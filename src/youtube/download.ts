import { Innertube, UniversalCache } from 'youtubei.js'
import { existsSync, mkdirSync, createWriteStream } from 'fs'
import { streamToIterable } from 'youtubei.js/dist/src/utils/Utils'
import { DownloadOptions } from 'youtubei.js/dist/src/parser/youtube/VideoInfo'
import path from 'path'

// TODO: Should I memoize the cache object?
// const yt = await Innertube.create({ cache: new UniversalCache() });

const DOWNLOAD_DIR = './files'
const DOWNLOAD_OPTIONS: DownloadOptions = {
  type: 'audio',
  quality: 'bestefficiency',
  format: 'mp4'
}

export async function getBasicInfo (videoId: string): Promise<object> {
  const yt = await Innertube.create({ cache: new UniversalCache() })
  const data = await yt.getBasicInfo(videoId)
  const { id, title, short_description: description, thumbnail: thumbnails } = data.basic_info

  return {
    id,
    title,
    description,
    thumbnails
  }
}

// TODO: If it was possible to get the final size of the video to download, it'd be possible to
//       return an observable (RxJS) that notifies the downloaded % everytime the % changes, and also
//       notify error/completion.
//       But I don't know how to get the full size.
// TODO: Should this return "false" when the download fails?
export async function downloadVideoToAudio (videoId: string, outputName: string): Promise<boolean> {
  const yt = await Innertube.create({ cache: new UniversalCache() })

  const stream = await yt.download(videoId, DOWNLOAD_OPTIONS)
  const dir = path.join(DOWNLOAD_DIR, videoId)

  // TODO: Should be async
  if (!existsSync(dir)) {
    mkdirSync(dir)
  }

  const file = createWriteStream(`${path.join(dir, outputName)}.m4a`)

  for await (const chunk of streamToIterable(stream)) {
    file.write(chunk)
  }

  return true
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
