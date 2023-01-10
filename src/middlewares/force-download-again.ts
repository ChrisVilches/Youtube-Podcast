import { NextFunction, Request, Response } from 'express'
import { removeVideo } from '../services/storage/persisted-files'

export const forceDownloadAgain = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const videoId: string = res.locals.videoId
  console.assert(videoId.length)

  const inProgress = res.locals.inProgress as boolean

  if (!inProgress && 'force' in req.query) {
    await removeVideo(videoId)
  }

  next()
}
