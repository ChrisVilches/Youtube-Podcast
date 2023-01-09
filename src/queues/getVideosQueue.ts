import Bull from 'bull'

const redisUrl = (): string => {
  const host = process.env.REDIS_HOST as string
  const port = process.env.REDIS_PORT as string
  const user = process.env.REDIS_USER as string
  const pass = process.env.REDIS_PASS as string
  const dbNum = process.env.REDIS_DB_NUMBER as string

  return `redis://${user}:${pass}@${host}:${port}/${dbNum}`
}

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
