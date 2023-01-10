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

export const addVideoJob = async (videoId: string): Promise<void> => {
  await getVideosQueue().add({ id: videoId }, { jobId: videoId })
}

export const removeVideoJob = async (videoId: string): Promise<void> => {
  if (videoId.length === 0) {
    return
  }

  const job = await getVideosQueue().getJob(videoId)
  await job?.releaseLock()
  await job?.remove()
}
