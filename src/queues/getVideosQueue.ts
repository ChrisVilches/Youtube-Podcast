import Bull from 'bull'
import { redisUrl } from '../redis/redisUrl'

const connectQueue = (name: string): Bull.Queue => {
  const queue: Bull.Queue = new Bull(name, redisUrl(), {
    defaultJobOptions: { removeOnComplete: true }
  })

  return queue
}

let queue: Bull.Queue | null = null

export const getVideosQueue = (): Bull.Queue => {
  queue ??= connectQueue('youtube-videos-to-download')
  return queue
}
