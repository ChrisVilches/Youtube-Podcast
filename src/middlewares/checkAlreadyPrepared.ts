import { NextFunction, Request, Response } from 'express'
import { isFileAlreadyDownloaded } from '../services/storage/file-downloaded'
import { messageResponse } from './messageResponse'

export const checkAlreadyPrepared = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  const videoId: string = res.locals.videoId
  console.assert(videoId.length)

  const beingPrepared: boolean = res.locals.beingPrepared
  console.log(`beingPrepared: ${beingPrepared ? 'true' : 'false'}`)
  const fileAlreadyDownloaded: boolean = await isFileAlreadyDownloaded(videoId)
  console.log(`fileAlreadyDownloaded: ${fileAlreadyDownloaded ? 'true' : 'false'}`)

  if (!beingPrepared && await isFileAlreadyDownloaded(videoId)) {
    res.json(messageResponse(`File is already prepared. Use /download?v=${videoId} to download`))
  } else {
    next()
  }
}
