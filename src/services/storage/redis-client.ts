import { createClient, RedisClientType } from 'redis'

let client: RedisClientType | null = null

export const getRedisClient = async (): Promise<RedisClientType> => {
  if (client === null) {
    client = createClient({ url: process.env.REDIS_URL })
    await client.connect()
  }

  return client
}
