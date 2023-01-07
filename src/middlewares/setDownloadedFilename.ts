import { NextFunction, Request, Response } from 'express'
import { getDownloadedFilename } from '../services/storage/file-downloaded'

export const setDownloadedFilename = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  const videoId: string = res.locals.videoId
  console.assert(videoId.length)

  const fileName: string | null = await getDownloadedFilename(videoId)
  res.locals.fileName = fileName
  next()
}
