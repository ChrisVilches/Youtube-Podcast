import redisLock from 'redis-lock'
import { getRedisClient } from '../redis/getRedisClient'

// TODO: The time has an impact in how the locks are cleaned up,
//       and whether the lock is released prematurely.
//       Update: I was using 900ms. Now I try with 900 * 1000
const LOCK_TIMEOUT = Number(process.env.LOCK_TIMEOUT_SECONDS) * 1000

// TODO: locks must be cleaned up when the program exits.
// TODO: These locks may not even be necessary anymore, now that Redis stores the data for every video.
//       Note that using Redis alone may not be perfect, but it's a good case. That combined with SPAM prevention
//       would be more than enough.
//       However note that the progress values stored in Redis also don't get cleaned up, so that's another problem
//       to fix.
export const withNamedLock = async (lockName: string, fn: () => Promise<void>): Promise<void> => {
  await fn()
  /*
  const client = await getRedisClient()
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
  */
}
