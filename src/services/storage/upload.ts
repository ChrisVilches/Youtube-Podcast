import { BucketItemStat, UploadedObjectInfo } from 'minio'
import internal from 'stream'
import { BUCKET_NAME, getMinioClient } from './minioClient'

// TODO: There's room for improving the name of this module.

export const videoExists = async (videoId: string): Promise<boolean> => {
  const client = await getMinioClient()
  try {
    const stat = await client.statObject(BUCKET_NAME, videoId)
    return stat.etag.length > 0 && stat.size > 0
  } catch {
    return false
  }
}

export const videoStatObject = async (videoId: string): Promise<BucketItemStat> => {
  const client = await getMinioClient()
  return await client.statObject(BUCKET_NAME, videoId)
}

export const videoOriginalTitle = async (videoId: string): Promise<string> => {
  const client = await getMinioClient()
  const stat = await client.statObject(BUCKET_NAME, videoId)
  return decodeURI(stat.metaData['Original-Title-Encoded'.toLowerCase()])
}

export const persistVideo = async (videoId: string, videoTitle: string, fileContent: Buffer): Promise<UploadedObjectInfo> => {
  const client = await getMinioClient()

  const metaData = {
    'Content-Type': 'application/octet-stream',
    'Original-Title-Encoded': encodeURI(videoTitle)
  }

  return await client.putObject(BUCKET_NAME, videoId, fileContent, metaData)
}

export const removeVideo = async (videoId: string): Promise<void> => {
  await (await getMinioClient()).removeObject(BUCKET_NAME, videoId)
}

export const videoStream = async (videoId: string): Promise<internal.Readable> => {
  const client = await getMinioClient()
  return await client.getObject(BUCKET_NAME, videoId)
}
