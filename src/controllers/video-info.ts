import { NextFunction, Request, Response } from 'express'
import { requireVideoId } from '../middlewares/require-video-id'
import { videoStorageSummary } from '../services/storage/summary'
import createError from 'http-errors'
import { VideoBasicInfo } from '../models/video-basic-info'
import { getModelForClass } from '@typegoose/typegoose'
import { DownloadStatModel } from '../models/download-stat'
import { fetchAndSaveBasicInfo } from '../youtube/scraping'

const getMetadata = async (videoId: string): Promise<VideoBasicInfo | null> => {
  let metadata: VideoBasicInfo | null = await getModelForClass(VideoBasicInfo).findOne({ videoId })

  if (metadata === null) {
    try {
      metadata = await fetchAndSaveBasicInfo(videoId)
    } catch {
      return null
    }
  }

  return metadata
}

const getVideoInfo = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  const videoId: string = res.locals.videoId

  const metadata: VideoBasicInfo | null = await getMetadata(videoId)

  if (metadata === null) {
    next(createError.NotFound())
    return
  }

  res.json({
    metadata,
    storage: await videoStorageSummary(videoId),
    downloadStats: await DownloadStatModel.findOne({ videoId })
  })
}

export const processedVideoInfoController = [requireVideoId, getVideoInfo]
