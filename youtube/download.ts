import { Innertube, UniversalCache } from 'youtubei.js'
import { existsSync, mkdirSync, createWriteStream } from 'fs'
import { streamToIterable } from 'youtubei.js/dist/src/utils/Utils'
import { DownloadOptions } from 'youtubei.js/dist/src/parser/youtube/VideoInfo'

// TODO: Should I memoize the cache object?
// const yt = await Innertube.create({ cache: new UniversalCache() });

const DOWNLOAD_DIR = './.downloaded'
const DOWNLOAD_OPTIONS: DownloadOptions = {
  type: 'audio',
  quality: 'bestefficiency',
  format: 'mp4'
}

async function tryGetBasicInfo (videoId: string): Promise<object | null> {
  try {
    const yt = await Innertube.create({ cache: new UniversalCache() })
    const data = await yt.getBasicInfo(videoId)
    const { id, title, short_description: description, thumbnail: thumbnails } = data.basic_info

    return {
      id,
      title,
      description,
      thumbnails
    }
  } catch {
    return null
  }
}

// TODO: If it was possible to get the final size of the video to download, it'd be possible to
//       return an observable (RxJS) that notifies the downloaded % everytime the % changes, and also
//       notify error/completion.
//       But I don't know how to get the full size.
// TODO: Should this return "false" when the download fails?
async function downloadVideoToAudio (videoId: string, outputName: string): Promise<boolean> {
  const yt = await Innertube.create({ cache: new UniversalCache() })

  const stream = await yt.download(videoId, DOWNLOAD_OPTIONS)

  if (!existsSync(DOWNLOAD_DIR)) {
    mkdirSync(DOWNLOAD_DIR)
  }

  const file = createWriteStream(`${DOWNLOAD_DIR}/${outputName}.m4a`)

  for await (const chunk of streamToIterable(stream)) {
    file.write(chunk)
  }

  return true
}

function formatOutputFileName (info) {
  return `${info.title} (${info.id})`
}

function videoIdFromURL (url: string): string {
  const u = new URL(url)
  const v = u.searchParams.get('v')
  if (!v) {
    throw new Error(`URL "${url}" is not a valid Youtube url`)
  }
  return v
}

async function getPlayList (id: string) {
  const yt = await Innertube.create({ cache: new UniversalCache() })

  return await yt.getPlaylist(id)
}

(async () => {
  const res = await getPlayList('PLGb9oxtniFL5J7fvfctISMnpxfA1pKDAB')
  console.log(res.items)

  return

  const videoId = videoIdFromURL('https://www.youtube.com/watch?v=9B4lxVQUkIc')

  const info = await tryGetBasicInfo(videoId)
  if (info == null) {
    console.error(`Video ${videoId} is not available`)
    return
  }

  console.log(info)
  console.log('Downloading...')
  const result = await downloadVideoToAudio(videoId, formatOutputFileName(info))
  console.log('Result: ', result)
})()
