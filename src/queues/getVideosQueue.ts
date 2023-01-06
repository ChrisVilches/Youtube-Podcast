import Bull from 'bull'

const connectQueue = (name: string): Bull.Queue => {
  const queue: Bull.Queue = new Bull(name, {
    redis: {
      port: Number(process.env.REDIS_PORT),
      host: process.env.REDIS_HOST
    }
  })

  return queue
}

let queue: Bull.Queue | null = null

export const getVideosQueue = (): Bull.Queue => {
  queue ??= connectQueue('youtube-videos-to-download')
  return queue
}
