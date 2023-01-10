import { NextFunction, Request, Response } from 'express'
import { setVideoAlreadyPrepared } from '../middlewares/setVideoAlreadyPrepared'
import { requireVideoId } from '../middlewares/requireVideoId'
import createError from 'http-errors'
import { setProgress } from '../middlewares/setProgress'
import { forceDownloadAgain } from '../middlewares/forceDownloadAgain'
import { messageResponse } from '../middlewares/messageResponse'
import contentDisposition from 'content-disposition'
import { videoStream, videoOriginalTitle, videoStatObject } from '../services/storage/upload'
import { cleanTitle } from '../util/format'
import { addVideoJob } from '../queues/addVideoJob'
import { updateDownloadStats } from '../middlewares/updateDownloadStats'

const videoToFileName = async (videoId: string, extension: string = 'm4a'): Promise<string> => {
  const originalTitle = await videoOriginalTitle(videoId)
  const cleanedTitle = cleanTitle(originalTitle)
  return `${cleanedTitle}.${extension}`
}

const executeDownload = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const videoId: string = (req.query.v as string) ?? ''

  if (!(res.locals.videoAlreadyPrepared as boolean)) {
    next(createError.NotFound())
    return
  }

  const stat = await videoStatObject(videoId)

  // TODO: Doesn't work in FireFox
  //       Print the headers using: console.log(req.headers)
  //       It doesn't contain the "if-none-match" header (on Firefox).
  if (stat.etag === req.headers['if-none-match']) {
    res.sendStatus(304)
  } else {
    res.setHeader('ETag', stat.etag)
    res.setHeader('Content-Disposition', contentDisposition(await videoToFileName(videoId)))
    res.setHeader('Content-Transfer-Encoding', 'binary')
    res.setHeader('Content-Type', 'application/octet-stream')

    const stream = await videoStream(videoId)
    stream.pipe(res)
  }

  res.on('finish', next)
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
export const prepareController = [requireVideoId, setProgress, forceDownloadAgain, setVideoAlreadyPrepared, executePrepare]
