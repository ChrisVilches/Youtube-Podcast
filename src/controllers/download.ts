import { NextFunction, Request, Response } from 'express'
import { getDownloadedFilename } from '../storage/file-downloaded'
import { join } from 'path'
import { checkAlreadyPrepared } from '../middlewares/checkAlreadyPrepared'
import { requireVideoId } from '../middlewares/requireVideoId'
import { getVideosQueue } from '../queues/getVideosQueue'
import createError from 'http-errors'

// TODO: File storage must be improved. Storing the files here is not good.

const executeDownload = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const videoId: string = (req.query.v as string) ?? ''
  const storageDir = join(__dirname, '../../files', videoId)

  const fileName = await getDownloadedFilename(videoId)

  if (fileName === null) {
    next(createError.NotFound())
    return
  }

  res.sendFile(fileName, { root: storageDir }, (err) => {
    if (typeof err !== 'undefined') {
      next(createError.InternalServerError())
    }
  })
}

const executePrepare = async (_req: Request, res: Response): Promise<void> => {
  const videoId: string = res.locals.videoId

  await getVideosQueue().add({ id: videoId })

  res.send(`Download is in process. Try using /download?v=${videoId} after a few moments in order to download`)
}

export const downloadController = [requireVideoId, executeDownload]

// TODO: The only problem of removing the "setVideoBasicInfo" middleware is that now we cannot tell the
//       user if the video is available or not. It's processed later in the worker.
export const prepareController = [requireVideoId, checkAlreadyPrepared, executePrepare]
