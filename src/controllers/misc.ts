import { Request, Response } from 'express'
import { getVideosQueue } from '../queues/videos-queue'

export const homeController = async (_req: Request, res: Response): Promise<void> => {
  const queue = await getVideosQueue()

  res.json({
    port: Number(process.env.API_PORT),
    env: process.env.NODE_ENV,
    jobs: {
      pending: await queue.getWaitingCount(),
      active: await queue.getActiveCount(),
      failed: await queue.getFailedCount()
    }
  })
}
