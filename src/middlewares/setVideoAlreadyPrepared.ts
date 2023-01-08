import { NextFunction, Request, Response } from 'express'
import { videoExists } from '../services/storage/minioUpload'

export const setVideoAlreadyPrepared = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  const videoId: string = res.locals.videoId
  console.assert(videoId.length)

  res.locals.videoAlreadyPrepared = await videoExists(videoId)
  next()
}
