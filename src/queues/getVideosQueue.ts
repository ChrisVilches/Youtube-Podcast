import Bull from 'bull'
import { dbUrl } from '../util/dbUrl'

const connectQueue = (name: string): Bull.Queue => {
  const queue: Bull.Queue = new Bull(name, dbUrl('redis', 'REDIS'), {
    defaultJobOptions: { removeOnComplete: true }
  })

  return queue
}

let queue: Bull.Queue | null = null

export const getVideosQueue = (): Bull.Queue => {
  queue ??= connectQueue('youtube-videos-to-download')
  return queue
}
