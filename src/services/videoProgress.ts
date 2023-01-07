import { getRedisClient } from '../redis/getRedisClient'

export const updateProgress = async (videoId: string, progress: number): Promise<void> => {
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
