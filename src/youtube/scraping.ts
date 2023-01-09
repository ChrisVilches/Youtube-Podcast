import { Innertube, UniversalCache } from 'youtubei.js'
import { streamToIterable } from 'youtubei.js/dist/src/utils/Utils'
import VideoInfo, { DownloadOptions } from 'youtubei.js/dist/src/parser/youtube/VideoInfo'
import Thumbnail from 'youtubei.js/dist/src/parser/classes/misc/Thumbnail'
import { Subject } from 'rxjs'
import { persistVideo, videoExists } from '../services/storage/upload'
import { VideoBasicInfo, VideoBasicInfoModel } from '../models/VideoBasicInfo'

const DOWNLOAD_OPTIONS: DownloadOptions = {
  type: 'audio',
  quality: 'bestefficiency',
  format: 'mp4'
}

interface PlaylistInfo {
  id: string
  author: string
  title: string
  items: VideoBasicInfo[]
}

export async function getBasicInfoRaw (videoId: string): Promise<VideoInfo> {
  const yt = await getInnertube()
  return await yt.getBasicInfo(videoId)
}

export async function getBasicInfo (videoId: string): Promise<VideoBasicInfo> {
  const yt = await getInnertube()
  const data: VideoInfo = await yt.getBasicInfo(videoId)

  const { title, duration, short_description: description, thumbnail: thumbnails } = data.basic_info

  const lengthBytes: number | undefined = data.streaming_data?.adaptive_formats.filter((x: any) => x.mime_type.startsWith('audio/mp4'))[0]?.content_length

  return new VideoBasicInfoModel({
    videoId,
    duration: duration ?? 0,
    title: title ?? '',
    description: description ?? '',
    thumbnails: thumbnails ?? [],
    lengthBytes
  })
}

let innertube: Innertube | null = null

async function getInnertube (): Promise<Innertube> {
  innertube ??= await Innertube.create({ cache: new UniversalCache() })
  return innertube
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
  const { videoId, title, duration, description, lengthBytes, thumbnails } = info

  const payload = { videoId, title, duration, description, lengthBytes, thumbnails }

  await VideoBasicInfoModel.updateOne({ videoId }, payload, { upsert: true })
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
    items: res.items.map((item: any): VideoBasicInfo => new VideoBasicInfoModel({
      videoId: item.id,
      title: item.title.runs[0].text as string,
      duration: item.duration.seconds as number,
      description: '',
      thumbnails: item.thumbnails as Thumbnail[]
    }))
  }
}
