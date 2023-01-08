import { getVideosQueue } from './getVideosQueue'

export const addVideoJob = async (videoId: string): Promise<void> => {
  await getVideosQueue().add({ id: videoId }, { jobId: videoId })
}
