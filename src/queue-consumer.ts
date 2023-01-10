import { Subject } from 'rxjs/internal/Subject'
import { bootstrap } from './bootstrap'
import { getVideosQueue } from './queues/videos-queue'
import { formatDuration } from './util/format'
import { consumeSubjectPrintCompletion, consumeSubjectUpdateProgress } from './worker/download-progress-observers'
import { cleanVideoId, handleShutdown } from './worker/shutdown'
import { downloadAndPersist, getBasicInfo } from './youtube/scraping'

// TODO: There's a bug where the program keeps outputting even after CTRL+C and even after
//       the shell prompt ($) is displayed.

const processVideoId = async (videoId: string): Promise<void> => {
  const subject = new Subject<number>()
  let scrapedTotalBytes = 0

  try {
    const info = await getBasicInfo(videoId)

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
  queueConsumer().catch(console.log)
  handleShutdown()
})
