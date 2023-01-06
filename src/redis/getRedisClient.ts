import { createClient, RedisClientType } from 'redis'
import { redisUrl } from './redisUrl'

let client: RedisClientType | null = null

export const getRedisClient = async (): Promise<RedisClientType> => {
  if (client === null) {
    client = createClient({ url: redisUrl() })

    await client.connect()
  }

  return client
}
