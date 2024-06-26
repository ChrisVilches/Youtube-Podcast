// TODO: This module was rewritten. But it's not complete as of now.
//       Some functions are not implemented yet.

// import { streamToIterable } from 'youtubei.js/dist/src/utils/Utils'
import VideoInfo from 'youtubei.js/dist/src/parser/youtube/VideoInfo'
import { Subject } from 'rxjs'
// import { persistVideo, videoExists } from '../services/storage/persisted-files'
import { VideoBasicInfo, VideoBasicInfoModel } from '../models/video-basic-info'
import { getInnertube } from './innertube'
import { TranscriptionMetadata } from '../models/transcription-metadata'
import { Format } from 'youtubei.js/dist/src/parser/misc'
import { PlaylistVideo, Video } from 'youtubei.js/dist/src/parser/nodes'
import { UserChannel, UserChannelModel } from '../models/user-channel'
import Channel from 'youtubei.js/dist/src/parser/youtube/Channel'
import { DownloadOptions } from 'youtubei.js/dist/src/types/FormatUtils'
// import { TranscriptionMetadata } from '../models/transcription-metadata'
// import Channel from 'youtubei.js/dist/src/parser/youtube/Channel'
// import { UserChannel, UserChannelModel } from '../models/user-channel'
// import PlaylistVideo from 'youtubei.js/dist/src/parser/classes/PlaylistVideo'
// import Video from 'youtubei.js/dist/src/parser/classes/Video'
// import Format from 'youtubei.js/dist/src/parser/classes/misc/Format'

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

const isType = <T>(type: string) => (x: unknown): x is T => typeof x === 'object' && x !== null && 'type' in x && x.type === type

export async function getChannelVideosAsPlaylist (channelUsername: string): Promise<PlaylistInfo> {
  const yt = await getInnertube()
  const channelId: string = await channelIdFromUsername(channelUsername)
  const channel: Channel = await yt.getChannel(channelId)
  const channelVideos = await channel.getVideos()
  const channelHandle = channelUsername.toLowerCase().trim()

  return {
    id: channelHandle,
    title: 'Latest videos',
    author: channel.metadata.title ?? '',
    isChannel: true,
    items: channelVideos.videos.filter(isType<Video>('Video')).map((item) => new VideoBasicInfoModel({
      videoId: item.id,
      author: channel.metadata.title,
      title: item.title.runs?.at(0)?.text ?? '',
      duration: item.duration.seconds,
      description: item.description_snippet?.text ?? '',
      thumbnails: item.thumbnails
    }))
  }
}

export async function getBasicInfoRaw (videoId: string): Promise<VideoInfo> {
  const yt = await getInnertube()
  return await yt.getBasicInfo(videoId)
}

const isAudioMp4Format = (f: Format): boolean => f.mime_type.startsWith('audio/mp4')

const extractLengthBytes = (data: VideoInfo): number | undefined => {
  const value = data.streaming_data?.adaptive_formats.filter(isAudioMp4Format).at(0)?.content_length ?? 0
  if (!isFinite(value)) {
    return 0
  }

  return value
}

async function getAudioDirectUrl (videoId: string): Promise<string> {
  const yt = await getInnertube()
  const data = await yt.getStreamingData(videoId, DOWNLOAD_OPTIONS)
  return data.decipher(yt.session.player)
}

export async function fetchAndSaveBasicInfo (videoId: string): Promise<VideoBasicInfo> {
  const yt = await getInnertube()
  const data: VideoInfo = await yt.getBasicInfo(videoId)

  const { title, duration, short_description: description, thumbnail: thumbnails, channel } = data.basic_info

  const lengthBytes: number | undefined = extractLengthBytes(data)
  const transcriptions: TranscriptionMetadata[] = data.captions?.caption_tracks?.map(data => ({ name: data.name.text ?? '', url: data.base_url, lang: data.language_code })) ?? []
  const author: string = channel?.name ?? ''

  return await VideoBasicInfoModel.findOneAndUpdate({ videoId }, {
    duration: duration ?? 0,
    title: title ?? '',
    author,
    description: description ?? '',
    thumbnails: thumbnails ?? [],
    lengthBytes,
    transcriptions,
    audioUrl: await getAudioDirectUrl(videoId)
  }, { new: true, upsert: true })
}

// async function download (videoId: string, subject: Subject<number>): Promise<Buffer> {
//   if (await videoExists(videoId)) {
//     throw new Error(`Video ${videoId} was already downloaded`)
//   }

//   const yt = await getInnertube()

//   const stream = await yt.download(videoId, DOWNLOAD_OPTIONS)
//   const data = []

//   let completeBytes = 0

//   subject.next(0)
//   for await (const chunk of streamToIterable(stream)) {
//     data.push(chunk)
//     completeBytes += chunk.byteLength
//     subject.next(completeBytes)
//   }

//   return Buffer.concat(data)
// }

export async function downloadAndPersist (info: VideoBasicInfo, subject: Subject<number>): Promise<void> {
  // const { videoId, title } = info

  // info.validateCanDownload()

  // const binary: Buffer = await download(videoId, subject)
  // await persistVideo(videoId, title, binary)
  // subject.complete()
}

export async function getPlayList (id: string): Promise<PlaylistInfo> {
  const yt = await getInnertube()
  const res = await yt.getPlaylist(id)

  return {
    id: res.endpoint?.payload.playlistId,
    title: res.info?.title ?? '',
    author: res.info.author.name,
    isChannel: false,
    items: res.items.filter(isType<PlaylistVideo>('PlaylistVideo')).map((item) => new VideoBasicInfoModel({
      videoId: item.id,
      author: item.author.name,
      title: item.title.runs?.at(0)?.text,
      duration: item.duration.seconds,
      description: '',
      thumbnails: item.thumbnails
    }))
  }
}
