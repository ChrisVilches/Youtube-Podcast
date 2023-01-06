import { NextFunction, Request, Response } from 'express'
import { isFileAlreadyDownloaded } from '../storage/file-downloaded'

export const checkAlreadyPrepared = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  const videoId: string = res.locals.videoId
  console.assert(videoId.length)

  const beingPrepared: boolean = res.locals.beingPrepared

  if (!beingPrepared && await isFileAlreadyDownloaded(videoId)) {
    res.send(`File is already prepared. Use /download?v=${videoId} to download`)
  } else {
    next()
  }
}
