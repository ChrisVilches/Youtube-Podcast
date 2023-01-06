import { Request, Response } from 'express'
import { isFileAlreadyDownloaded } from '../storage/isFileAlreadyDownloaded'
import { downloadVideoToAudio } from '../youtube/download'
import { join } from 'path'
import { checkAlreadyPrepared } from '../middlewares/checkAlreadyPrepared'
import { requireVideoId } from '../middlewares/requireVideoId'
import { setVideoBasicInfo } from '../middlewares/setVideoBasicInfo'

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

const executePrepare = async (_req: Request, res: Response): Promise<void> => {
  const videoId: string = res.locals.videoId

  // TODO: This should dispatch a worker on Redis or something like that.
  downloadVideoToAudio(videoId, res.locals.info.title).then(() => {}).catch(console.error)
  res.send(`Download is in process. Try using /download?v=${videoId} after a few moments in order to download`)
}

export const downloadController = [requireVideoId, executeDownload]
export const prepareController = [requireVideoId, checkAlreadyPrepared, setVideoBasicInfo, executePrepare]
