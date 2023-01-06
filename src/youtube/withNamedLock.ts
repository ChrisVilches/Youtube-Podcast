import { createClient, RedisClientType } from 'redis'
import redisLock from 'redis-lock'

// TODO: Should this number have a different value?
const LOCK_TIMEOUT = 1000 * 60 * 15

let client: RedisClientType | null = null

const getClient = async (): Promise<RedisClientType> => {
  if (client !== null) {
    return client
  }

  client = createClient()
  await client.connect()
  return client
}

export const withNamedLock = async (lockName: string, fn: () => Promise<void>): Promise<void> => {
  const client = await getClient()
  const lock = redisLock(client)

  let unlock: (() => Promise<void>) | null = null

  try {
    console.log(`Trying to acquire lock ${lockName}`)
    unlock = await lock(lockName, LOCK_TIMEOUT)
    console.log(`Acquired lock ${lockName}`)

    await fn()
  } finally {
    if (unlock !== null) {
      await unlock()
      console.log(`Released lock ${lockName}`)
    }
  }
}
