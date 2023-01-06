import { NextFunction, Request, Response } from 'express'
import { isFileAlreadyDownloaded } from '../storage/file-downloaded'

// TODO: Eventually an "is already being prepared" should be implemented. But there's no way to know it
//       without a proper database (by storing the download status there). One way would be to query the Redis
//       database directly, or use some API from redis-lock if it's available. This is good enough, since Redis
//       is guaranteed to be centralized and available as a single instance from all nodes (assuming it's deployed
//       correctly.)
//       Note that this is also important for performance reasons, since it avoids executing too many Youtube API calls.
export const checkAlreadyPrepared = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  const videoId: string = res.locals.videoId
  console.assert(videoId.length)

  if (await isFileAlreadyDownloaded(videoId)) {
    res.send(`File is already prepared. Use /download?v=${videoId} to download`)
  } else {
    next()
  }
}
