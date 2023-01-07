/* eslint-disable @typescript-eslint/promise-function-async */

import dotenv from 'dotenv'
import { Subject } from 'rxjs/internal/Subject'
import { map, concatMap, distinct } from 'rxjs/operators'
import { getVideosQueue } from './queues/getVideosQueue'
import { removeProgress, updateProgress } from './services/videoProgress'
import { removeFile } from './services/storage/removeFile'
import { downloadVideoToAudio, getBasicInfo } from './youtube/scraping'

dotenv.config()

const formatDuration = (seconds: number): string => {
  if (isNaN(seconds)) {
    return 'N/A'
  }

  return new Date(seconds * 1000).toISOString().slice(11, 19)
}

const bytesToMb = (bytes: number): number => bytes / 1000000

const consumeSubjectUpdateProgress = (videoId: string, subject: Subject<number>, scrapedTotalBytes: number): Promise<void> => new Promise(resolve => {
  const finish = (): void => {
    removeProgress(videoId).catch(console.log)
    resolve()
  }

  subject.pipe(
    map((b: number) => Math.floor(100 * b / scrapedTotalBytes)),
    distinct(),
    concatMap((p: number) => updateProgress(videoId, p))
  ).subscribe({
    complete: finish,
    error: finish
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

    console.log(`📄 ${videoTitle}`)
    console.log(`🕓 ${formatDuration(duration)}`)

    downloadVideoToAudio(info, subject).catch(console.log)

    scrapedTotalBytes = lengthBytes ?? Infinity
  } catch (e) {
    subject.error(e)
  }

  await Promise.all([
    consumeSubjectUpdateProgress(videoId, subject, scrapedTotalBytes),
    consumeSubjectPrintCompletion(subject, scrapedTotalBytes)
  ])
}

let currentVideoId: string | null = null

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

let cleanupStarted = false

async function signalHandler (): Promise<void> {
  if (cleanupStarted) {
    return
  }

  cleanupStarted = true
  console.log()
  console.log('Graceful shutdown...')

  if (currentVideoId !== null) {
    await Promise.all([
      removeFile(currentVideoId),
      removeProgress(currentVideoId)
      // TODO: The job remains "active", I think. Should also cleanup that as well.
    ])
  }

  process.exit()
}

process.on('SIGINT', () => { signalHandler().catch(console.log) })
process.on('SIGTERM', () => { signalHandler().catch(console.log) })
process.on('SIGQUIT', () => { signalHandler().catch(console.log) })
