import { streamToIterable } from 'youtubei.js/dist/src/utils/Utils'
import VideoInfo, { DownloadOptions } from 'youtubei.js/dist/src/parser/youtube/VideoInfo'
import Thumbnail from 'youtubei.js/dist/src/parser/classes/misc/Thumbnail'
import { Subject } from 'rxjs'
import { persistVideo, videoExists } from '../services/storage/persisted-files'
import { VideoBasicInfo, VideoBasicInfoModel } from '../models/video-basic-info'
import { getInnertube } from './innertube'
import { TranscriptionMetadata } from '../models/transcription-metadata'
import Channel from 'youtubei.js/dist/src/parser/youtube/Channel'
import { UserChannel, UserChannelModel } from '../models/user-channel'

const DOWNLOAD_OPTIONS: DownloadOptions = {
  type: 'audio',
  quality: 'bestefficiency',
  format: 'mp4'
}

interface PlaylistInfo {
  id: string
  author: string
  title: string
  isChannel: boolean
  items: VideoBasicInfo[]
}

export const channelIdFromUsernameNonCached = async (username: string): Promise<string> => {
  const res = await fetch(`https://www.youtube.com/@${username}/about`)
  const rawHtml = await res.text()
  const channelId: RegExpMatchArray | null = rawHtml.match(/"browseId":"([^"]+)"/) ?? null

  if (channelId === null) {
    throw new Error(`Could not parse channel @${username}`)
  }

  return channelId[1]
}

const channelIdFromUsername = async (username: string): Promise<string> => {
  username = username.trim().toLowerCase()
  const channel: UserChannel | null = await UserChannelModel.findOne({ username })

  if (channel !== null) {
    console.log('[channelIdFromUsername] Cache hit')
    return channel.channelId
  }

  const channelId: string = await channelIdFromUsernameNonCached(username)
  await UserChannelModel.findOneAndUpdate({ username }, { channelId }, { new: true, upsert: true })
  return channelId
}

export async function getChannelVideosAsPlaylist (channelUsername: string): Promise<PlaylistInfo> {
  const yt = await getInnertube()
  const channelId: string = await channelIdFromUsername(channelUsername)
  const channel: Channel = await yt.getChannel(channelId)
  const channelVideos = await channel.getVideos()
  const channelHandle = channelUsername.toLowerCase().trim()

  return {
    id: channelHandle,
    title: 'Latest videos',
    author: channel.metadata.title,
    isChannel: true,
    items: channelVideos.videos.map((item: any) => new VideoBasicInfoModel({
      videoId: item.id,
      author: channel.metadata.title,
      title: item.title.runs[0].text as string,
      duration: item.duration.seconds as number,
      description: item.description_snippet?.text ?? '',
      thumbnails: item.thumbnails as Thumbnail[]
    }))
  }
}

export async function getBasicInfoRaw (videoId: string): Promise<VideoInfo> {
  const yt = await getInnertube()
  return await yt.getBasicInfo(videoId)
}

const extractLengthBytes = (data: any): number | undefined => {
  const value = data.streaming_data?.adaptive_formats.filter((x: any) => x.mime_type.startsWith('audio/mp4'))[0]?.content_length
  if (!isFinite(value)) {
    return 0
  }

  return value
}

export async function fetchAndSaveBasicInfo (videoId: string): Promise<VideoBasicInfo> {
  const yt = await getInnertube()
  const data: VideoInfo = await yt.getBasicInfo(videoId)

  const { title, duration, short_description: description, thumbnail: thumbnails, channel } = data.basic_info

  const lengthBytes: number | undefined = extractLengthBytes(data)
  const transcriptions: TranscriptionMetadata[] = data.captions?.caption_tracks.map(data => ({ name: data.name.text, url: data.base_url, lang: data.language_code })) ?? []
  const author: string = channel?.name ?? ''

  return await VideoBasicInfoModel.findOneAndUpdate({ videoId }, {
    duration: duration ?? 0,
    title: title ?? '',
    author,
    description: description ?? '',
    thumbnails: thumbnails ?? [],
    lengthBytes,
    transcriptions
  }, { new: true, upsert: true })
}

async function download (videoId: string, subject: Subject<number>): Promise<Buffer> {
  if (await videoExists(videoId)) {
    throw new Error(`Video ${videoId} was already downloaded`)
  }

  const yt = await getInnertube()

  const stream = await yt.download(videoId, DOWNLOAD_OPTIONS)
  const data = []

  let completeBytes = 0

  subject.next(0)
  for await (const chunk of streamToIterable(stream)) {
    data.push(chunk)
    completeBytes += chunk.byteLength
    subject.next(completeBytes)
  }

  return Buffer.concat(data)
}

export async function downloadAndPersist (info: VideoBasicInfo, subject: Subject<number>): Promise<void> {
  const { videoId, title } = info

  info.validateCanDownload()

  const binary: Buffer = await download(videoId, subject)
  await persistVideo(videoId, title, binary)
  subject.complete()
}

export async function getPlayList (id: string): Promise<PlaylistInfo> {
  const yt = await getInnertube()
  const res = await yt.getPlaylist(id)

  return {
    id: res.endpoint.payload.playlistId,
    title: res.info.title,
    author: res.info.author.name,
    isChannel: false,
    items: res.items.map((item: any): VideoBasicInfo => new VideoBasicInfoModel({
      videoId: item.id,
      author: item.author.name,
      title: item.title.runs[0].text as string,
      duration: item.duration.seconds as number,
      description: '',
      thumbnails: item.thumbnails as Thumbnail[]
    }))
  }
}
