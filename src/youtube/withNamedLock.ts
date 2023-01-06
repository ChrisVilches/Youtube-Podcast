import { createClient, RedisClientType } from 'redis'
import redisLock from 'redis-lock'

// TODO: The time has an impact in how the locks are cleaned up,
//       and whether the lock is released prematurely.
//       Update: I was using 900ms. Now I try with 900 * 1000
const LOCK_TIMEOUT = Number(process.env.LOCK_TIMEOUT_SECONDS) * 1000

let client: RedisClientType | null = null

const getClient = async (): Promise<RedisClientType> => {
  if (client === null) {
    client = createClient()
    await client.connect()
  }

  return client
}

// TODO: locks must be cleaned up when the program exits.
export const withNamedLock = async (lockName: string, fn: () => Promise<void>): Promise<void> => {
  const client = await getClient()
  const lock = redisLock(client)

  let unlock: (() => Promise<void>) | null = null

  try {
    process.stdout.write(`🔒 Acquiring lock ${lockName}... `)
    unlock = await lock(lockName, LOCK_TIMEOUT)
    console.log('✅')
    await fn()
  } finally {
    if (unlock !== null) {
      await unlock()
      // TODO: Not sure why 'unlock' isn't enough to release the lock ('del' is also necessary).
      await client.del(`lock.${lockName}`)
      console.log(`🔓 Released lock ${lockName}`)
    }
  }
}
