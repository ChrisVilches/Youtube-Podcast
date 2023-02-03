import { streamToIterable } from 'youtubei.js/dist/src/utils/Utils'
import VideoInfo, { DownloadOptions } from 'youtubei.js/dist/src/parser/youtube/VideoInfo'
import Thumbnail from 'youtubei.js/dist/src/parser/classes/misc/Thumbnail'
import { Subject } from 'rxjs'
import { persistVideo, videoExists } from '../services/storage/persisted-files'
import { VideoBasicInfo, VideoBasicInfoModel } from '../models/video-basic-info'
import { getInnertube } from './innertube'
import { TranscriptionMetadata } from '../models/transcription-metadata'
import Channel from 'youtubei.js/dist/src/parser/youtube/Channel'

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

// TODO: This should probably be cached somewhere. But don't cache ALL data because
//       it could be terabytes of usernames. Remember that there's always the option to
//       scrape the ID on the client (Flutter app) and cache the data there.
const channelIdFromUsername = async (username: string): Promise<string> => {
  const res = await fetch(`https://www.youtube.com/@${username}`)
  const rawHtml = await res.text()
  const channelId: RegExpMatchArray | null = rawHtml.match(/"browseId":"([^"]+)"/) ?? null

  if (channelId === null) {
    throw new Error(`Could not parse channel @${username}`)
  }

  return channelId[1]
}

export async function getChannelVideosAsPlaylist (channelUsername: string): Promise<PlaylistInfo> {
  const yt = await getInnertube()
  const channelId: string = await channelIdFromUsername(channelUsername)
  const channel: Channel = await yt.getChannel(channelId)
  const channelVideos = await channel.getVideos()

  return {
    // TODO: Could the channelId eventually be the same as a playlist ID? This could happen because the IDs
    //       are from different collections, so there's no guarantee they are always different.
    //       If I use @username then it's guaranteed it'd never clash, but it's kinda ugly and non-standard.
    id: channelUsername,
    title: 'Latest videos',
    author: channel.metadata.title,
    isChannel: true,
    // TODO: Dumb question, but does this create an entry in Mongo? I think not but verify.
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
