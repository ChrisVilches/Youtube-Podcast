import { NextFunction, Request, Response } from 'express'
import { setVideoAlreadyPrepared } from '../middlewares/set-video-already-prepared'
import { requireVideoId } from '../middlewares/require-video-id'
import createError from 'http-errors'
import { setProgress } from '../middlewares/set-progress'
import { forceDownloadAgain } from '../middlewares/force-download-again'
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

  // TODO: It may be necessary to check that the request is an actual browser,
  //       and not a scraper (this may happen when posting the download link on some
  //       social website, etc).

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
    stream.pipe(res)

    // TODO: Now using this to see if the "next" is executed when the download is complete.
    //       Test has to be made with Digital Ocean only. (download a video, check that /info doesn't
    //       show any download. But when the download completes (i.e. file is in the device), /info should
    //       show a downloadCount = 1)
    stream.on('end', next)
  }

  // TODO: This occurs even if the download has not completed yet.
  // res.on('finish', next)
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
