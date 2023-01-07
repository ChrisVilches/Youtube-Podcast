import { NextFunction, Request, Response } from 'express'
import { getDownloadedFilename } from '../services/storage/file-downloaded'
import { join } from 'path'
import { checkAlreadyPrepared } from '../middlewares/checkAlreadyPrepared'
import { requireVideoId } from '../middlewares/requireVideoId'
import { getVideosQueue } from '../queues/getVideosQueue'
import createError from 'http-errors'
import { checkBeingPrepared } from '../middlewares/checkBeingPrepared'
import { forceDownloadAgain } from '../middlewares/forceDownloadAgain'
import { updateProgress } from '../services/videoProgress'
import { messageResponse } from '../middlewares/messageResponse'

// TODO: File storage must be improved. Storing the files here is not good.

const executeDownload = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  if (res.locals.beingPrepared as boolean) {
    next(createError.NotFound())
    return
  }

  const videoId: string = (req.query.v as string) ?? ''
  const storageDir = join(__dirname, '../../files', videoId)

  const fileName = await getDownloadedFilename(videoId)

  if (fileName === null) {
    next(createError.NotFound())
    return
  }

  // TODO: fileName may contain colons and semicolons. I think they need to be cleaned before
  //       setting this header.
  res.setHeader('Content-Disposition', `attachment; filename=${fileName}`)
  res.setHeader('Content-Transfer-Encoding', 'binary')
  res.setHeader('Content-Type', 'application/octet-stream')

  res.sendFile(fileName, { root: storageDir }, (err) => {
    if (typeof err !== 'undefined') {
      next(createError.InternalServerError())
    }
  })
}

const executePrepare = async (_req: Request, res: Response): Promise<void> => {
  if (res.locals.beingPrepared as boolean) {
    res.json(messageResponse(`Video is already being prepared (${res.locals.progress as number}%). Wait a few moments.`))
    return
  }

  const videoId: string = res.locals.videoId

  await getVideosQueue().add({ id: videoId })

  await updateProgress(videoId, 0)
  res.json(messageResponse(`Download has been started. Try using /download?v=${videoId} after a few moments in order to download`))
}

export const downloadController = [requireVideoId, checkBeingPrepared, executeDownload]
export const prepareController = [requireVideoId, checkBeingPrepared, forceDownloadAgain, checkAlreadyPrepared, executePrepare]
