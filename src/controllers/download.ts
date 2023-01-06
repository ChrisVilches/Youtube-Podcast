import { Request, Response } from 'express'
import { isFileAlreadyDownloaded } from '../storage/isFileAlreadyDownloaded'
import { join } from 'path'
import { checkAlreadyPrepared } from '../middlewares/checkAlreadyPrepared'
import { requireVideoId } from '../middlewares/requireVideoId'
import { getVideosQueue } from '../queues/getVideosQueue'

// TODO: File storage must be improved. Storing the files here is not good.

const executeDownload = async (req: Request, res: Response): Promise<void> => {
  const videoId: string = (req.query.v as string) ?? ''
  const storageDir = join(__dirname, '../../files', videoId)

  try {
    const fileName = await isFileAlreadyDownloaded(videoId)
    res.sendFile(fileName, { root: storageDir }, (err) => {
      if (typeof err !== 'undefined') {
        // TODO: This error should be handled properly. The user shouldn't see this.
        res.status(400).send('File was not found')
      }
    })
  } catch (e) {
    res.status(400).send((e as Error).toString())
  }
}

// TODO: Check if it's already being prepared. I already wrote this TODO comment somewhere else.
//       Basically this would avoid enqueueing too many items to the queue.
const executePrepare = async (_req: Request, res: Response): Promise<void> => {
  const videoId: string = res.locals.videoId

  await getVideosQueue().add({
    id: videoId
  })

  res.send(`Download is in process. Try using /download?v=${videoId} after a few moments in order to download`)
}

export const downloadController = [requireVideoId, executeDownload]

// TODO: The only problem of removing the "setVideoBasicInfo" middleware is that now we cannot tell the
//       user if the video is available or not. It's processed later in the worker.
export const prepareController = [requireVideoId, checkAlreadyPrepared, executePrepare]
