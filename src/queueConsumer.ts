/* eslint-disable @typescript-eslint/promise-function-async */

import dotenv from 'dotenv'
import { Subject } from 'rxjs/internal/Subject'
import { map, concatMap, distinct, first } from 'rxjs/operators'
import { getVideosQueue } from './queues/getVideosQueue'
import { removeVideoJob } from './queues/removeVideoJob'
import { updateProgress } from './services/videoProgress'
import { bytesToMb } from './util/bytesToMb'
import { formatDuration } from './util/format'
import { downloadVideoToAudio, getBasicInfo } from './youtube/scraping'

dotenv.config()

const consumeSubjectUpdateProgress = (videoId: string, subject: Subject<number>, scrapedTotalBytes: number): Promise<void> => new Promise(resolve => {
  subject.pipe(
    map((b: number) => Math.floor(100 * b / scrapedTotalBytes)),
    distinct(),
    concatMap((p: number) => updateProgress(videoId, p))
  ).subscribe({
    complete: resolve,
    error: resolve
  })
})

const consumeSubjectPrintCompletion = (subject: Subject<number>, scrapedTotalBytes: number): Promise<void> => new Promise(resolve => {
  const mb = bytesToMb(scrapedTotalBytes)

  const nextCompleteBytes = (b: number): void => {
    if (b === 0) {
      console.log('⏬ Downloading...')
    }

    const p = Math.floor(100 * b / scrapedTotalBytes)

    process.stdout.write(`\r${b}/${scrapedTotalBytes} bytes (${p}% of ${mb}MB)`)
    if (p === 100) {
      process.stdout.write('\r')
      console.log(`💾 Scraped size ${scrapedTotalBytes}. Final size: ${b} ${scrapedTotalBytes === b ? '✅' : '❌'}`)
    }
  }

  subject.subscribe({
    next: nextCompleteBytes,
    complete: resolve,
    error: (e: any) => {
      console.log(`❌ ${e as string}`)
      console.log('❌ Details:')
      console.log(e.stack)
      resolve()
    }
  })
})

const processVideoId = async (videoId: string): Promise<void> => {
  const subject = new Subject<number>()
  let scrapedTotalBytes = 0

  try {
    const info = await getBasicInfo(videoId)

    const { title: videoTitle, duration, lengthBytes } = info
    scrapedTotalBytes = lengthBytes ?? Infinity

    console.log(`📄 ${videoTitle}`)
    console.log(`🕓 ${formatDuration(duration)}`)

    downloadVideoToAudio(info, subject).catch(e => subject.error(e))
  } catch (e) {
    subject.error(e)
  }

  await Promise.all([
    consumeSubjectUpdateProgress(videoId, subject, scrapedTotalBytes),
    consumeSubjectPrintCompletion(subject, scrapedTotalBytes)
  ])
}

let currentVideoId: string = ''

const queueConsumer = async (): Promise<void> => {
  await getVideosQueue().process(async ({ data }) => {
    const { id: videoId }: { id: string } = data
    currentVideoId = videoId
    console.log(`⚡ Processing ${videoId}`)
    await processVideoId(videoId)
    console.log(`✅ Processed ${videoId}`)
    console.log()
  })
}

queueConsumer().catch(console.log)

const cleanup = async (videoId: string): Promise<void> => {
  const tasks = Promise.all([
    // TODO: Sometimes the jobs are automatically retried, but I'm not sure under what conditions.
    removeVideoJob(videoId)
  ])

  try {
    await tasks
    console.log('Cleanup OK')
  } catch (e) {
    console.log(e)
  }

  // TODO: The job remains "active", I think. Should also cleanup that as well.
  // TODO: Sometimes the jobs get marked as "failed".
}

const gracefulShutdown = async (): Promise<void> => {
  console.log()
  console.log('Graceful shutdown...')
  await cleanup(currentVideoId)
  process.exit()
}

const shutdown = new Subject<boolean>()

shutdown.pipe(first()).subscribe({
  next: () => { gracefulShutdown().catch(console.log) }
})

process.on('SIGINT', () => { shutdown.next(true) })
process.on('SIGTERM', () => { shutdown.next(true) })
process.on('SIGQUIT', () => { shutdown.next(true) })
