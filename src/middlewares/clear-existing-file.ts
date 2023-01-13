import { NextFunction, Request, Response } from 'express'
import { removeVideo } from '../services/storage/persisted-files'

export const clearExistingFile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const videoId: string = res.locals.videoId

  const inProgress = res.locals.inProgress as boolean

  if (!inProgress && 'clear' in req.query) {
    await removeVideo(videoId)
  }

  next()
}
