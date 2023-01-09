import { UploadedObjectInfo } from 'minio'
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

// TODO: This could eventually be obtained from Mongo.
//       That's probably a bit better than having to encode and decode the title,
//       since it's not necessary in Mongo.
//       However, consider that I also must store this metadata anyway, because
//       that makes it easier to work with Minio (when using the dashboard, etc)
//       so there's no reason why I should avoid fetching the name from this source.
//       Using Minio's metadata isn't very different from using Mongo.
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
