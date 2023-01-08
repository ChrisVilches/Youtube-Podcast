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
      //       Jobs fail sometimes. It has only happened when I close the worker manually (this should never
      //       happen in practice, although I'd like to improve the graceful shutdown to the point it no longer matters).
      //       One problem with removing this count, is that if the job fails, and I don't have a retry mechanism (which
      //       I'll also have to test if I implement it), the user wouldn't know what happened to the job. There's also
      //       currently no way to store the status of the most recent download (which I may implement using Mongo perhaps,
      //       along with other data such as video title/thumbnail/description cache, etc)
      failed: await queue.getFailedCount()
    }
  })
}
