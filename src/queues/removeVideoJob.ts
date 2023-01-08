import { getVideosQueue } from './getVideosQueue'

export const removeVideoJob = async (videoId: string): Promise<void> => {
  if (videoId.length === 0) {
    return
  }

  const job = await getVideosQueue().getJob(videoId)
  await job?.releaseLock()
  await job?.remove()
}
