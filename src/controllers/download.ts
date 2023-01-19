import { NextFunction, Request, Response } from 'express'
import { setVideoAlreadyPrepared } from '../middlewares/set-video-already-prepared'
import { requireVideoId } from '../middlewares/require-video-id'
import createError from 'http-errors'
import { setProgress } from '../middlewares/set-progress'
import { clearExistingFile } from '../middlewares/clear-existing-file'
import { videoStream, videoStatObject } from '../services/storage/persisted-files'
import { updateDownloadStats } from '../middlewares/update-download-stats'
import { addVideoJob } from '../queues/videos-queue'
import { videoToFileName } from '../services/download-filename'
import { createDownloadResponse } from '../middlewares/download-response'

const contentDisposition = async (videoId: string): Promise<string> => {
  const filename = await videoToFileName(videoId, 'm4a')
  const encodedFilename = encodeURIComponent(filename)
  return `attachment; filename*=UTF-8''${encodedFilename}`
}

// TODO: This controller has a few problems.
//       * Download count is increased at times that depend on how it's deployed (with or without Nginx)
//       * Too many custom headers (not necessarily a problem, but may fail)
//       * Not using the res.download function. Also not necessarily a problem though.
//       * Haven't implemented the frontend app, so this may change anyway.
//
//       I think the best way to go about this is to just wait until the frontend app is implemented,
//       and start modifying this from there.
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
    res.setHeader('Content-Disposition', await contentDisposition(videoId))
    res.setHeader('Content-Transfer-Encoding', 'binary')
    res.setHeader('Content-Type', 'application/octet-stream')

    const stream = await videoStream(videoId)
    stream.pipe(res).on('finish', next)
  }
}

const executePrepare = async (_req: Request, res: Response): Promise<void> => {
  const videoId: string = res.locals.videoId

  const videoAlreadyPrepared: boolean = res.locals.videoAlreadyPrepared

  if (videoAlreadyPrepared) {
    res.json(createDownloadResponse(true, 100))
    return
  }

  await addVideoJob(videoId)

  const progress = (res.locals.progress as number | null) ?? 0

  res.json(createDownloadResponse(false, progress))
}

export const downloadController = [requireVideoId, setProgress, setVideoAlreadyPrepared, executeDownload, updateDownloadStats]
export const prepareController = [requireVideoId, setProgress, clearExistingFile, setVideoAlreadyPrepared, executePrepare]
