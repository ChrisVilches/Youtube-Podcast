import { Request, Response } from 'express'
import { DownloadStatModel } from '../models/DownloadStat'

export const updateDownloadStats = async (_req: Request, res: Response): Promise<void> => {
  const videoId: string = res.locals.videoId
  console.assert(videoId.length)

  if (res.statusCode === 304) {
    return
  }

  await DownloadStatModel.updateOne({ videoId }, { $inc: { downloadCount: 1 } }, { upsert: true })
}
