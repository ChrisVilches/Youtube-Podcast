import { NextFunction, Request, Response } from 'express'
import { getProgress } from '../redis/videoProgress'

export const checkBeingPrepared = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  const videoId: string = res.locals.videoId
  console.assert(videoId.length)

  const progress = await getProgress(videoId)

  res.locals.beingPrepared = false

  if (progress !== null) {
    res.locals.beingPrepared = true
    res.locals.progress = progress
  }

  next()
}
