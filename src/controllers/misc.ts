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
      // TODO: It might be necessary to set removeOnFail = true
      //       And in that case, it might make sense to remove this field (because it'd always be 0).
      failed: await queue.getFailedCount()
    }
  })
}
