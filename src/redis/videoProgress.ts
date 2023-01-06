import { getRedisClient } from './getRedisClient'

// TODO: This shouldn't be in the "Redis" folder, because it should be database agnostic.
// TODO: Make the keys expire. Make sure they don't expire if they keys are constantly being reactivated.
//       Make sure the time is big enough so that all the processing is finished without it expiring
//       while processing (including the transfer to Minio/S3)
//       https://redis.io/commands/expire/

export const updateProgress = async (videoId: string, progress: number): Promise<void> => {
  // console.log(`Updating progress ${progress}`)
  const redis = await getRedisClient()
  await redis.set(`videoDownloadProgress:${videoId}`, progress)
}

export const removeProgress = async (videoId: string): Promise<void> => {
  const redis = await getRedisClient()
  await redis.del(`videoDownloadProgress:${videoId}`)
}

export const getProgress = async (videoId: string): Promise<number | null> => {
  const redis = await getRedisClient()
  const value = await redis.get(`videoDownloadProgress:${videoId}`)

  if (typeof value === 'string' && value.length > 0) {
    return Number(value)
  }

  return null
}
