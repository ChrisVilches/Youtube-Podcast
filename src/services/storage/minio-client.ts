import * as Minio from 'minio'

export const BUCKET_NAME = 'youtube-podcast-downloads'

let client: Minio.Client | null = null

const initBucket = async (c: Minio.Client): Promise<void> => {
  if (await c.bucketExists(BUCKET_NAME)) {
    return
  }

  await c.makeBucket(BUCKET_NAME, 'default-region')
}

export const getMinioClient = async (): Promise<Minio.Client> => {
  if (client === null) {
    client = new Minio.Client({
      endPoint: process.env.MINIO_ENDPOINT as string,
      port: Number(process.env.MINIO_PORT as string),
      useSSL: process.env.MINIO_SSL === '1',
      accessKey: process.env.MINIO_ACCESS_KEY as string,
      secretKey: process.env.MINIO_SECRET_KEY as string
    })

    await initBucket(client)
  }

  return client
}
