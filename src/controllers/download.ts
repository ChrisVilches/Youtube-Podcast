import { Request, Response } from 'express'
import { isFileAlreadyDownloaded } from '../storage/isFileAlreadyDownloaded'
import { downloadVideoToAudio } from '../youtube/download'
import { join } from 'path'

// TODO: Should lock the file to be downloaded, so that it's only downloaded once...
//       Ok so I do need SQL after all? (not MongoDB). Or use like a Redis with some atomic operations?
//       I don't know if that's possible.
// TODO: File storage must be improved. Storing the files here is not good.

export const downloadController = async (req: Request, res: Response): Promise<void> => {
  const videoId: string = (req.query.v as string) ?? ''
  const storageDir = join(__dirname, '..', 'files', videoId)

  try {
    const fileName = await isFileAlreadyDownloaded(videoId)
    res.sendFile(fileName, { root: storageDir })
  } catch (e) {
    res.status(400).send(e.toString())
  }
}

export const prepareController = async (_req: Request, res: Response): Promise<void> => {
  // TODO: This should dispatch a worker on Redis or something like that.
  downloadVideoToAudio(res.locals.videoId, res.locals.info.title).then(r => {
    console.log(`Result: ${r ? 'Yes' : 'No'}`)
  }).catch(console.error)

  res.send('Downloading & converting... execute /download?v=... after a few moments')
}
