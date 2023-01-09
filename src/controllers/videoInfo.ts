import { NextFunction, Request, Response } from 'express'
import { requireVideoId } from '../middlewares/requireVideoId'
import { videoStorageSummary } from '../services/storage/summary'
import createError from 'http-errors'
import { VideoBasicInfo } from '../models/VideoBasicInfo'
import { getModelForClass } from '@typegoose/typegoose'

// TODO: This API is for videos that have been processed, or done something with.
//       The "raw" one is for any video, that exists on Youtube (triggers a normal scraping).
//       The name should reflect that so it's easily understandable.

const getVideoInfo = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const videoId: string = (req.query.v as string) ?? ''

  const metadata: VideoBasicInfo | null = await getModelForClass(VideoBasicInfo).findOne({ videoId })

  if (metadata === null) {
    next(createError.NotFound())
    return
  }

  res.json({
    metadata,
    storage: await videoStorageSummary(videoId)
  })
}

export const videoInfoController = [requireVideoId, getVideoInfo]
