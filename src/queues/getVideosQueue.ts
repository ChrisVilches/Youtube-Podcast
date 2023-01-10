import Bull from 'bull'

const connectQueue = (name: string): Bull.Queue => {
  const queue: Bull.Queue = new Bull(name, process.env.REDIS_URL as string, {
    defaultJobOptions: { removeOnComplete: true }
  })

  return queue
}

let queue: Bull.Queue | null = null

export const getVideosQueue = (): Bull.Queue => {
  queue ??= connectQueue('youtube-videos-to-download')
  return queue
}
