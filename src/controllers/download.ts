import { NextFunction, Request, Response } from 'express'
import { setVideoAlreadyPrepared } from '../middlewares/set-video-already-prepared'
import { requireVideoId } from '../middlewares/require-video-id'
import createError from 'http-errors'
import { setProgress } from '../middlewares/set-progress'
import { clearExistingFile } from '../middlewares/clear-existing-file'
import { messageResponse } from '../middlewares/message-response'
import contentDisposition from 'content-disposition'
import { videoStream, videoStatObject } from '../services/storage/persisted-files'
import { updateDownloadStats } from '../middlewares/update-download-stats'
import { addVideoJob } from '../queues/videos-queue'
import { videoToFileName } from '../services/download-filename'

const executeDownload = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const videoId: string = res.locals.videoId

  if (!(res.locals.videoAlreadyPrepared as boolean)) {
    next(createError.NotFound())
    return
  }

  const stat = await videoStatObject(videoId)

  // TODO: Header 'if-none-match' is not sent when using Firefox.
  if (stat.etag === req.headers['if-none-match']) {
    res.sendStatus(304)
  } else {
    res.setHeader('Content-Length', stat.size)
    res.setHeader('ETag', stat.etag)
    res.setHeader('Content-Disposition', contentDisposition(await videoToFileName(videoId, 'm4a')))
    res.setHeader('Content-Transfer-Encoding', 'binary')
    res.setHeader('Content-Type', 'application/octet-stream')

    const stream = await videoStream(videoId)

    // If deployed behind Nginx, this will execute immediately.
    stream.pipe(res).on('finish', next)
  }
}

const executePrepare = async (_req: Request, res: Response): Promise<void> => {
  const videoId: string = res.locals.videoId

  const videoAlreadyPrepared: boolean = res.locals.videoAlreadyPrepared

  if (videoAlreadyPrepared) {
    res.json(messageResponse(`File is already prepared. Use /download?v=${videoId} to download`))
    return
  }

  await addVideoJob(videoId)

  const progress = (res.locals.progress as number | null) ?? 0

  res.json(messageResponse(`Downloading (${progress}%). Try using /download?v=${videoId} after a few moments in order to download`))
}

export const downloadController = [requireVideoId, setProgress, setVideoAlreadyPrepared, executeDownload, updateDownloadStats]
export const prepareController = [requireVideoId, setProgress, clearExistingFile, setVideoAlreadyPrepared, executePrepare]
