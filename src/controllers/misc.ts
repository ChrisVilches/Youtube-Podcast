import { Request, Response } from 'express'
import { getVideosQueue } from '../queues/getVideosQueue'

export const homeController = async (_req: Request, res: Response): Promise<void> => {
  const queue = await getVideosQueue()

  res.json({
    port: Number(process.env.PORT),
    env: process.env.NODE_ENV,
    jobs: {
      pending: await queue.getWaitingCount(),
      active: await queue.getActiveCount(),
      // TODO: Does it make sense to include this information now? (after removing the completed count)
      //       I think I should also remove the jobs from the queue on failure, because
      //       I wouldn't be able to force redownload failed jobs. I haven't confirmed this yet.
      failed: await queue.getFailedCount()
    }
  })
}
