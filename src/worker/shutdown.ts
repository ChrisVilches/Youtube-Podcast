import { first, Subject } from 'rxjs'
import { removeVideoJob } from '../queues/videos-queue'

export const cleanVideoId: { value: string } = { value: '' }

const cleanup = async (videoId: string): Promise<void> => {
  const tasks = Promise.all([
    // TODO: Sometimes the jobs are automatically retried, but I'm not sure under what conditions.
    removeVideoJob(videoId)
  ])

  try {
    await tasks
    console.log('🧹 Cleanup OK')
  } catch (e) {
    console.log(e)
  }

  // TODO: The job remains "active", I think. Should also cleanup that as well.
  // TODO: Sometimes the jobs get marked as "failed".
}

export const gracefulShutdown = async (): Promise<void> => {
  console.log()
  console.log('🛑 Graceful shutdown...')
  await cleanup(cleanVideoId.value)
  process.exit()
}

export const handleShutdown = (): void => {
  const shutdown = new Subject<boolean>()

  shutdown.pipe(first()).subscribe({
    next: () => { gracefulShutdown().catch(console.log) }
  })

  process.on('SIGINT', () => { shutdown.next(true) })
  process.on('SIGTERM', () => { shutdown.next(true) })
  process.on('SIGQUIT', () => { shutdown.next(true) })
}
