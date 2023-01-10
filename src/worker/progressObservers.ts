/* eslint-disable @typescript-eslint/promise-function-async */

import { concatMap, distinct, map, Subject } from 'rxjs'
import { updateProgress } from '../services/videoProgress'
import { bytesToMb } from '../util/bytesToMb'

export const consumeSubjectUpdateProgress = (videoId: string, subject: Subject<number>, scrapedTotalBytes: number): Promise<void> => new Promise(resolve => {
  subject.pipe(
    map((b: number) => Math.floor(100 * b / scrapedTotalBytes)),
    distinct(),
    concatMap((p: number) => updateProgress(videoId, p))
  ).subscribe({
    complete: resolve,
    error: resolve
  })
})

export const consumeSubjectPrintCompletion = (subject: Subject<number>, scrapedTotalBytes: number): Promise<void> => new Promise(resolve => {
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
