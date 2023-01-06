import { Innertube, UniversalCache } from 'youtubei.js'
import fs from 'fs'
import { streamToIterable } from 'youtubei.js/dist/src/utils/Utils'
import { DownloadOptions } from 'youtubei.js/dist/src/parser/youtube/VideoInfo'
import path from 'path'
import { withNamedLock } from './withNamedLock'
import { isFileAlreadyDownloaded } from '../storage/file-downloaded'
import Thumbnail from 'youtubei.js/dist/src/parser/classes/misc/Thumbnail'

const tmpDownloadPath = (): string => process.env.TMP_DOWNLOAD_PATH ?? ''

const DOWNLOAD_FINAL_DIR = './files'
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

const bytesToMb = (bytes: number): number => bytes / 1000000

async function downloadVideoToAudioAux (videoId: string, videoTitle: string, lengthBytes?: number): Promise<void> {
  // TODO: This should check also be done from the prepare controller, and it should be enough
  //       to only do it from there, if it's properly implemented. But keep this one as well since
  //       it doesn't damage the logic.
  if (await isFileAlreadyDownloaded(videoId)) {
    throw new Error(`Video ${videoId} was already downloaded`)
  }

  const yt = await getInnertube()

  const stream = await yt.download(videoId, DOWNLOAD_OPTIONS)
  const dir = path.join(DOWNLOAD_FINAL_DIR, videoId)

  // Download file to temp folder
  ensureDir(tmpDownloadPath())

  const tmpFile = path.join(tmpDownloadPath(), videoId)
  const finalFile = `${path.join(dir, videoTitle)}.m4a`

  const file = fs.createWriteStream(tmpFile)

  console.log(`⏬ Downloading ${videoId}...`)

  let completeBytes = 0
  let percentage = 0

  for await (const chunk of streamToIterable(stream)) {
    file.write(chunk)
    completeBytes += chunk.byteLength

    if (typeof lengthBytes === 'number') {
      const nextPercentage = Math.ceil(100 * completeBytes / lengthBytes)

      if (percentage !== nextPercentage) {
        percentage = Math.min(100, nextPercentage)
        process.stdout.write(`\r${percentage}% of ${bytesToMb(lengthBytes)} MB`)
      }
    }
  }

  process.stdout.write('\r')

  // Move temporary file to final folder (TODO: should be a more robust service like Minio or S3)
  ensureDir(dir)

  const finalSizeBytes = fs.statSync(tmpFile).size
  if (typeof lengthBytes === 'number') {
    console.log(`💾 Scraped size ${lengthBytes}. Final size: ${finalSizeBytes} ${lengthBytes === finalSizeBytes ? '✅' : '❌'}`)
  } else {
    console.log('❌ Length in bytes was not scraped')
  }

  fs.renameSync(tmpFile, finalFile)
}

export async function downloadVideoToAudio ({ id, title, lengthBytes }: VideoBasicInfo): Promise<void> {
  return await withNamedLock(id, async () => await downloadVideoToAudioAux(id, title, lengthBytes))
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
