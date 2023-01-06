import { Innertube, UniversalCache } from 'youtubei.js'
import fs from 'fs'
import { streamToIterable } from 'youtubei.js/dist/src/utils/Utils'
import { DownloadOptions } from 'youtubei.js/dist/src/parser/youtube/VideoInfo'
import path from 'path'
import { withNamedLock } from './withNamedLock'
import { isFileAlreadyDownloaded } from '../storage/file-downloaded'
import Thumbnail from 'youtubei.js/dist/src/parser/classes/misc/Thumbnail'
import { Subject } from 'rxjs'

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

export async function getBasicInfo (videoId: string): Promise<VideoBasicInfo> {
  const yt = await getInnertube()
  const data = await yt.getBasicInfo(videoId)
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

  const yt = await getInnertube()

  const stream = await yt.download(videoId, DOWNLOAD_OPTIONS)
  const dir = path.join(DOWNLOAD_DIR, videoId)

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
  await withNamedLock(id, async () => {
    validateDuration(duration)
    await downloadVideoToAudioAux(id, title, subject)
  }).catch(e => subject.error(e))

  subject.complete()
}

/*
export function UNUSED_FOR_NOW_videoIdFromURL (url: string): string {
  const u = new URL(url)
  const v: string = u.searchParams.get('v') ?? ''
  if (v === '') {
    throw new Error(`URL "${url}" is not a valid Youtube url`)
  }
  return v
}
*/

// TODO: implement
// TODO: I'll probably not use this one. Delete this, the controller, and the API middleware, etc.
export async function getChannel (id: string): Promise<null> {
  const yt = await getInnertube()
  console.log(`id: [${id}]`)
  const res = await yt.getChannel(id)
  console.log('Maybe it worked? lol')
  console.log(res)
  return null
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
