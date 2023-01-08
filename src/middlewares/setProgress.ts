import { NextFunction, Request, Response } from 'express'
import { getProgress } from '../services/videoProgress'

export const setProgress = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  const videoId: string = res.locals.videoId
  console.assert(videoId.length)

  const progress: number | null = await getProgress(videoId)

  res.locals.progress = progress
  res.locals.inProgress = res.locals.progress !== null

  next()
}
