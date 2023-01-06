import { NextFunction, Request, Response } from 'express'
import { getBasicInfo } from '../youtube/download'

// TODO: This middleware is deprecated, since the process is not done in a middleware (i.e. API)
export const setVideoBasicInfo = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  console.assert(res.locals.videoId.length)
  try {
    res.locals.info = await getBasicInfo(res.locals.videoId)
    next()
  } catch {
    res.status(400).send(`Video ${res.locals.videoId as string} is not available`)
  }
}
