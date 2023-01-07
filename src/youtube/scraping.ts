import { Innertube, UniversalCache } from 'youtubei.js'
import fs from 'fs'
import { streamToIterable } from 'youtubei.js/dist/src/utils/Utils'
import VideoInfo, { DownloadOptions } from 'youtubei.js/dist/src/parser/youtube/VideoInfo'
import path from 'path'
import { isFileAlreadyDownloaded } from '../services/storage/file-downloaded'
import Thumbnail from 'youtubei.js/dist/src/parser/classes/misc/Thumbnail'
import { Subject } from 'rxjs'
import { cleanTitle } from './util'

const DOWNLOAD_DIR = './files'
const DOWNLOAD_OPTIONS: DownloadOptions = {
  type: 'audio',
  quality: 'bestefficiency',
  format: 'mp4'
}

interface VideoBasicInfo {
  id: string
  title: string
  duration: number
  description: string
  lengthBytes?: number
  thumbnails: Thumbnail[]
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

  // TODO: "is_live_content" may be a video that was originally a stream but finished and is now a video.
  //       I think the best way to determine if it's an ongoing stream is to use the "duration: NaN" condition.
  //       But also it'd be best to change the "isLive" and use something like "Has a finite duration" or something like that,
  //       because duration=NaN doesn't necessarily mean it's a live stream.
  //       Then test downloading a short video that was originally published as a livestream.
  const { id, title, duration, short_description: description, thumbnail: thumbnails, is_live_content: isLive } = data.basic_info

  const lengthBytes: number | undefined = data.streaming_data?.adaptive_formats.filter((x: any) => x.mime_type.startsWith('audio/mp4'))[0]?.content_length

  return {
    id: id as string,
    title: title ?? '',
    duration: isLive as boolean ? NaN : (duration ?? 0),
    description: description ?? '',
    thumbnails: thumbnails ?? [],
    lengthBytes
  }
}

const ensureDir = (dir: string): void => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir)
  }
}

let innertube: Innertube | null = null

async function getInnertube (): Promise<Innertube> {
  innertube ??= await Innertube.create({ cache: new UniversalCache() })
  return innertube
}

async function downloadVideoToAudioAux (videoId: string, videoTitle: string, subject: Subject<number>): Promise<void> {
  if (await isFileAlreadyDownloaded(videoId)) {
    throw new Error(`Video ${videoId} was already downloaded`)
  }

  videoTitle = cleanTitle(videoTitle)

  const yt = await getInnertube()

  const stream = await yt.download(videoId, DOWNLOAD_OPTIONS)
  const dir = path.join(DOWNLOAD_DIR, `${videoId}.tmp`)

  ensureDir(dir)
  const finalFile = `${path.join(dir, videoTitle)}.m4a`
  const file = fs.createWriteStream(finalFile)

  let completeBytes = 0

  subject.next(0)
  for await (const chunk of streamToIterable(stream)) {
    file.write(chunk)
    completeBytes += chunk.byteLength
    subject.next(completeBytes)
  }

  fs.renameSync(path.join(DOWNLOAD_DIR, `${videoId}.tmp`), path.join(DOWNLOAD_DIR, `${videoId}`))
}

const validateDuration = (duration: number): void => {
  if (duration > Number(process.env.MAX_VIDEO_LENGTH_SECONDS)) {
    throw new Error(`Video is too long (${duration} seconds)`)
  }

  if (typeof duration !== 'number' || duration === 0 || isNaN(duration)) {
    throw new Error(`Duration is ${duration}, but must be a number greater than zero (video may be invalid)`)
  }
}

export async function downloadVideoToAudio ({ id, title, duration }: VideoBasicInfo, subject: Subject<number>): Promise<void> {
  try {
    validateDuration(duration)
    await downloadVideoToAudioAux(id, title, subject)
  } catch (e) {
    subject.error(e)
  }

  subject.complete()
}

export async function getPlayList (id: string): Promise<PlaylistInfo> {
  const yt = await getInnertube()
  const res = await yt.getPlaylist(id)

  const result: PlaylistInfo = {
    id: res.endpoint.payload.playlistId,
    title: res.info.title,
    author: res.info.author.name,
    items: res.items.map((item: any): VideoBasicInfo => ({
      id: item.id as string,
      title: item.title.runs[0].text as string,
      duration: item.duration.seconds,
      description: '',
      thumbnails: item.thumbnails as Thumbnail[]
    }))
  }

  return result
}
