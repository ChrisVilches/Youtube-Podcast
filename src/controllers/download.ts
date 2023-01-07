import { NextFunction, Request, Response } from 'express'
import { join } from 'path'
import { setDownloadedFilename } from '../middlewares/setDownloadedFilename'
import { requireVideoId } from '../middlewares/requireVideoId'
import { getVideosQueue } from '../queues/getVideosQueue'
import createError from 'http-errors'
import { setProgress } from '../middlewares/setProgress'
import { forceDownloadAgain } from '../middlewares/forceDownloadAgain'
import { messageResponse } from '../middlewares/messageResponse'
import contentDisposition from 'content-disposition'

// TODO: File storage must be improved. Storing the files here is not good.

const executeDownload = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const videoId: string = (req.query.v as string) ?? ''
  const storageDir = join(__dirname, '../../files', videoId)

  const fileName = res.locals.fileName as string | null

  if (fileName === null) {
    next(createError.NotFound())
    return
  }
  res.setHeader('Content-Disposition', contentDisposition(fileName))
  res.setHeader('Content-Transfer-Encoding', 'binary')
  res.setHeader('Content-Type', 'application/octet-stream')

  res.sendFile(fileName, { root: storageDir }, (err) => {
    if (typeof err !== 'undefined') {
      next(createError.InternalServerError())
    }
  })
}

const executePrepare = async (_req: Request, res: Response): Promise<void> => {
  const videoId: string = res.locals.videoId

  const fileName = res.locals.fileName as string | null

  if (fileName !== null) {
    res.json(messageResponse(`File is already prepared. Use /download?v=${videoId} to download`))
    return
  }

  await getVideosQueue().add({ id: videoId }, { jobId: videoId })

  const progress = (res.locals.progress as number | null) ?? 0

  res.json(messageResponse(`Downloading (${progress}%). Try using /download?v=${videoId} after a few moments in order to download`))
}

export const downloadController = [requireVideoId, setProgress, setDownloadedFilename, executeDownload]
export const prepareController = [requireVideoId, setProgress, forceDownloadAgain, setDownloadedFilename, executePrepare]
