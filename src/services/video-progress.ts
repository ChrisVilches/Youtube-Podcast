import { getVideosQueue } from '../queues/videos-queue'

export const updateProgress = async (videoId: string, progress: number): Promise<void> => {
  const job = await getVideosQueue().getJob(videoId)
  await job?.progress(progress)
}

export const getProgress = async (videoId: string): Promise<number | null> => {
  const job = await getVideosQueue().getJob(videoId)

  if (job === null) {
    return null
  }

  const result: number = await job?.progress()
  return result
}
