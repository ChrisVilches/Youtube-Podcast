import { Subject } from 'rxjs/internal/Subject'
import { bootstrap } from './bootstrap'
import { VideoBasicInfo, VideoBasicInfoModel } from './models/video-basic-info'
import { getVideosQueue } from './queues/videos-queue'
import { formatDuration } from './util/format'
import { consumeSubjectPrintCompletion, consumeSubjectUpdateProgress } from './worker/download-progress-observers'
import { cleanVideoId, handleShutdown } from './worker/shutdown'
import { downloadAndPersist, fetchAndSaveBasicInfo } from './youtube/scraping'

// TODO: There's a bug where the program keeps outputting even after CTRL+C and even after
//       the shell prompt ($) is displayed.

const getCachedBasicInfo = async (videoId: string): Promise<VideoBasicInfo> => {
  // TODO: This still doesn't cache the case where the videoId is of a video that doesn't exist.
  //       The Youtube API is still used to try to fetch it.
  let info: VideoBasicInfo | null

  const secondsAgo = Number(process.env.VIDEO_BASIC_INFO_CACHE_SECONDS ?? '10')
  info = await VideoBasicInfoModel.findOne({
    videoId,
    updatedAt: { $gt: new Date(Date.now() - secondsAgo * 1000) }
  })

  if (info === null) {
    info = await fetchAndSaveBasicInfo(videoId)
  } else {
    console.log(`👍 Using cached metadata (Last update: ${(info.updatedAt ?? '').toString()})`)
  }

  return info
}

const processVideoId = async (videoId: string): Promise<void> => {
  const subject = new Subject<number>()
  let scrapedTotalBytes = 0

  try {
    const info: VideoBasicInfo = await getCachedBasicInfo(videoId)

    const { title: videoTitle, duration, lengthBytes } = info
    scrapedTotalBytes = lengthBytes ?? Infinity

    console.log(`📄 ${videoTitle}`)
    console.log(`🕓 ${formatDuration(duration)}`)

    downloadAndPersist(info, subject).catch(e => subject.error(e))
  } catch (e) {
    subject.error(e)
  }

  await Promise.all([
    consumeSubjectUpdateProgress(videoId, subject, scrapedTotalBytes),
    consumeSubjectPrintCompletion(subject, scrapedTotalBytes)
  ])
}

const queueConsumer = async (): Promise<void> => {
  await getVideosQueue().process(async ({ data }) => {
    const { id: videoId }: { id: string } = data
    cleanVideoId.value = videoId
    console.log(`⚡ Processing ${videoId}`)
    await processVideoId(videoId)
    console.log(`✅ Processed ${videoId}`)
    console.log()
  })
}

bootstrap(() => {
  console.log('🔧 Worker started')
  queueConsumer().catch(console.log)
  handleShutdown()
})
