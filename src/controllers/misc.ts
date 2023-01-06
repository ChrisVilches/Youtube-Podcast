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
      completed: await queue.getCompletedCount(),
      failed: await queue.getFailedCount()
    }
  })
}
