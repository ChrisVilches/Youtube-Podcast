import { Request, Response } from 'express'
import { DownloadStatModel } from '../models/download-stat'

export const updateDownloadStats = async (_req: Request, res: Response): Promise<void> => {
  if (res.statusCode === 304) {
    return
  }

  const videoId: string = res.locals.videoId

  await DownloadStatModel.updateOne({ videoId }, { $inc: { downloadCount: 1 } }, { upsert: true })
}
