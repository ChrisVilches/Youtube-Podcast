import { NextFunction, Request, Response } from 'express'
import { removeFile } from '../services/storage/removeFile'

export const forceDownloadAgain = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const videoId: string = res.locals.videoId
  console.assert(videoId.length)

  const beingPrepared: boolean = res.locals.beingPrepared

  if (!beingPrepared && 'force' in req.query) {
    await removeFile(videoId)
  }

  next()
}
