import { BucketItemStat } from 'minio'
import { videoExists } from '../storage/upload'
import { getProgress } from '../videoProgress'
import { BUCKET_NAME, getMinioClient } from './minioClient'

interface VideoStorageSummary {
  progress: number | null
  fileExists: boolean
  stat: BucketItemStat | null
}

// TODO: Include other metadata as well? Maybe simply fetch the entire "stat" data from Minio.
//       I think the byte length would be good.
export const videoStorageSummary = async (videoId: string): Promise<VideoStorageSummary> => {
  const fileExists = await videoExists(videoId)
  const progress = await getProgress(videoId)
  let stat = null

  try {
    stat = await (await getMinioClient()).statObject(BUCKET_NAME, videoId)
  } catch {

  }

  return {
    progress,
    fileExists,
    stat
  }
}
