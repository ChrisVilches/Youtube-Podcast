import dotenv from 'dotenv'
import { Subject } from 'rxjs/internal/Subject'
import { getVideosQueue } from './queues/getVideosQueue'
import { removeProgress, updateProgress } from './redis/videoProgress'
import { downloadVideoToAudio, getBasicInfo } from './youtube/scraping'

dotenv.config()

// TODO: Some issues happen when the process is killed.
//       Maybe this can be fixed by adding a "graceful shutdown" and do some cleanup
//       before exiting the process.

const formatDuration = (seconds: number): string => {
  if (isNaN(seconds)) {
    return 'N/A'
  }

  return new Date(seconds * 1000).toISOString().slice(11, 19)
}

const bytesToMb = (bytes: number): number => bytes / 1000000

const processVideoId = async (videoId: string): Promise<void> => {
  const info = await getBasicInfo(videoId)
  const { title: videoTitle, duration, lengthBytes } = info
  const totalBytes = lengthBytes ?? Infinity

  console.log(`📄 ${videoTitle}`)
  console.log(`🕓 ${formatDuration(duration)}`)

  const subject = new Subject<number>()
  downloadVideoToAudio(info, subject).catch(console.log)

  return await new Promise(resolve => {
    subject.subscribe({
      next: (b: number) => {
        // TODO: The flow of this should be done also using RxJS in a more controlled way.
        const p = Math.floor(100 * b / totalBytes)
        updateProgress(videoId, p).catch(console.error)
      },
      complete: () => {
        removeProgress(videoId).catch(console.error)
      },
      error: () => {
        removeProgress(videoId).catch(console.error)
      }
    })

    subject.subscribe({
      next: (b: number) => {
        if (b === 0) {
          console.log('⏬ Downloading...')
        }

        const mb = bytesToMb(totalBytes)
        const p = Math.floor(100 * b / totalBytes)

        process.stdout.write(`\r${b} bytes of ${totalBytes} (${p}% of ${mb}MB)`)
        if (p === 100) {
          process.stdout.write('\r')
          console.log(`💾 Scraped size ${totalBytes}. Final size: ${b} ${totalBytes === b ? '✅' : '❌'}`)
        }
      },
      complete: resolve,
      error: (e: any) => {
        console.log(`❌ ${e as string}`)
        resolve()
      }
    })
  })
}

const queueConsumer = async (): Promise<void> => {
  await getVideosQueue().process(async ({ data }) => {
    const { id: videoId }: { id: string } = data
    console.log(`⚡ Processing ${videoId}`)
    await processVideoId(videoId)
    console.log(`✅ Processed ${videoId}`)
    console.log()
  })
}

queueConsumer().catch(console.log)
