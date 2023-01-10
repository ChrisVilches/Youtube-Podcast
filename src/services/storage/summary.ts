import { BucketItemStat } from 'minio'
import { videoExists } from '../storage/persisted-files'
import { getProgress } from '../video-progress'
import { BUCKET_NAME, getMinioClient } from './minio-client'

interface VideoStorageSummary {
  progress: number | null
  fileExists: boolean
  stat: BucketItemStat | null
}

export const videoStorageSummary = async (videoId: string): Promise<VideoStorageSummary> => {
  const fileExists = await videoExists(videoId)
  const progress = await getProgress(videoId)
  let stat

  try {
    stat = await (await getMinioClient()).statObject(BUCKET_NAME, videoId)
  } catch {
    stat = null
  }

  return {
    progress,
    fileExists,
    stat
  }
}
