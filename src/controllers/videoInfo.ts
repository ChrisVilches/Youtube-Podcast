import { NextFunction, Request, Response } from 'express'
import { requireVideoId } from '../middlewares/requireVideoId'
import { VideoModel } from '../models/Video'
import { videoStorageSummary } from '../services/storage/summary'
import createError from 'http-errors'

// TODO: This API is for videos that have been processed, or done something with.
//       The "raw" one is for any video, that exists on Youtube (triggers a normal scraping).
//       The name should reflect that so it's easily understandable.

const getVideoInfo = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const videoId: string = (req.query.v as string) ?? ''

  const info = await VideoModel.findOne({ videoId })
  console.log(info)

  if (info === null) {
    next(createError.NotFound())
    return
  }

  res.json({
    metadata: info.metadata,
    storage: await videoStorageSummary(videoId)
  })
}

export const videoInfoController = [requireVideoId, getVideoInfo]
