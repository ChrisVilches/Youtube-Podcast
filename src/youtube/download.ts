import { Innertube, UniversalCache } from 'youtubei.js'
import fs from 'fs'
import { streamToIterable } from 'youtubei.js/dist/src/utils/Utils'
import { DownloadOptions } from 'youtubei.js/dist/src/parser/youtube/VideoInfo'
import path from 'path'
import { withNamedLock } from './withNamedLock'
import { isFileAlreadyDownloaded } from '../storage/isFileAlreadyDownloaded'
import Thumbnail from 'youtubei.js/dist/src/parser/classes/misc/Thumbnail'

// TODO: There should be a video length limit. Also avoid downloading streams, etc.
// TODO: Should I memoize the cache object?
// const yt = await Innertube.create({ cache: new UniversalCache() });

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
  description: string
  thumbnails: Thumbnail[]
}

// TODO: This should return an object using an interface.
export async function getBasicInfo (videoId: string): Promise<VideoBasicInfo> {
  const yt = await Innertube.create({ cache: new UniversalCache() })
  const data = await yt.getBasicInfo(videoId)
  const { id, title, short_description: description, thumbnail: thumbnails } = data.basic_info

  return {
    id: id as string,
    title: title ?? '',
    description: description ?? '',
    thumbnails: thumbnails ?? []
  }
}

const ensureDir = (dir: string): void => {
  // TODO: Should be async
  //       Actually if this is done as an extra worker (i.e. another thread), it can be sync.
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir)
  }
}

async function downloadVideoToAudioAux (videoId: string, videoTitle: string): Promise<void> {
  // TODO: This bit is a bit awkward.
  try {
    // TODO: This should check also be done from the prepare controller, and it should be enough
    //       to only do it from there, if it's properly implemented. But keep this one as well since
    //       it doesn't damage the logic.
    await isFileAlreadyDownloaded(videoId)
    console.log(`Video ${videoId} was already downloaded. Exiting`)
    return
  } catch {

  }

  // TODO: Should there be a singleton client?
  const yt = await Innertube.create({ cache: new UniversalCache() })

  const stream = await yt.download(videoId, DOWNLOAD_OPTIONS)
  const dir = path.join(DOWNLOAD_FINAL_DIR, videoId)

  // Download file to temp folder
  ensureDir(tmpDownloadPath())

  const tmpFile = path.join(tmpDownloadPath(), videoId)
  const finalFile = `${path.join(dir, videoTitle)}.m4a`

  const file = fs.createWriteStream(tmpFile)

  console.log(`File ${videoId} is being downloaded...`)

  for await (const chunk of streamToIterable(stream)) {
    file.write(chunk)
  }

  console.log(`File ${videoId} was downloaded`)

  // Move temporary file to final folder (TODO: should be a more robust service like Minio or S3)
  ensureDir(dir)

  fs.renameSync(tmpFile, finalFile)
}

// TODO: If it was possible to get the final size of the video to download, it'd be possible to
//       return an observable (RxJS) that notifies the downloaded % everytime the % changes, and also
//       notify error/completion.
//       But I don't know how to get the full size.
// TODO: Should this return "false" when the download fails?
export async function downloadVideoToAudio (videoId: string, videoTitle: string): Promise<void> {
  await withNamedLock(videoId, async () => await downloadVideoToAudioAux(videoId, videoTitle))
}

export function videoIdFromURL (url: string): string {
  const u = new URL(url)
  const v: string = u.searchParams.get('v') ?? ''
  if (v === '') {
    throw new Error(`URL "${url}" is not a valid Youtube url`)
  }
  return v
}

export async function getPlayList (id: string): Promise<any> {
  const yt = await Innertube.create({ cache: new UniversalCache() })

  return await yt.getPlaylist(id)
}
