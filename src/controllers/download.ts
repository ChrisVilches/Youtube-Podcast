import { NextFunction, Request, Response } from 'express'
import { setVideoAlreadyPrepared } from '../middlewares/set-video-already-prepared'
import { requireVideoId } from '../middlewares/require-video-id'
import createError from 'http-errors'
import { videoStream, videoStatObject } from '../services/storage/persisted-files'
import { updateDownloadStats } from '../middlewares/update-download-stats'
import { videoToFileName } from '../services/download-filename'

const contentDisposition = async (videoId: string): Promise<string> => {
  const filename = await videoToFileName(videoId, 'm4a')
  const encodedFilename = encodeURIComponent(filename)
  return `attachment; filename*=UTF-8''${encodedFilename}`
}

const setDownloadHeaders = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const videoId: string = res.locals.videoId

  if (!(res.locals.videoAlreadyPrepared as boolean)) {
    next(createError.NotFound())
    return
  }

  const stat = await videoStatObject(videoId)

  // TODO: Header 'if-none-match' is not sent when using Firefox.
  if (stat.etag === req.headers['if-none-match']) {
    res.sendStatus(304)
    return
  }

  res.setHeader('Content-Length', stat.size)
  res.setHeader('ETag', stat.etag)
  res.setHeader('Content-Disposition', await contentDisposition(videoId))
  res.setHeader('Content-Transfer-Encoding', 'binary')
  // TODO: Maybe it should be audio/mp4 or something more specific.
  // In fact I think Android doesn't recognize these files as audio when I browse the Files app.
  res.setHeader('Content-Type', 'application/octet-stream')
  next()
}

// TODO: This controller has a few problems.
//       * Download count is increased at times that depend on how it's deployed (with or without Nginx)
//       * Too many custom headers (not necessarily a problem, but may fail)
//       * Not using the res.download function. Also not necessarily a problem though.
//       * Haven't implemented the frontend app, so this may change anyway.
//
//       I think the best way to go about this is to just wait until the frontend app is implemented,
//       and start modifying this from there.
const executeDownload = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  const videoId: string = res.locals.videoId
  const stream = await videoStream(videoId)
  stream.pipe(res).on('finish', next)
}

export const downloadController = [requireVideoId, setVideoAlreadyPrepared, setDownloadHeaders, executeDownload, updateDownloadStats]
export const downloadHeadController = [requireVideoId, setVideoAlreadyPrepared, setDownloadHeaders]
