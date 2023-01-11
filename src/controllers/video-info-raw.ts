import { NextFunction, Request, Response } from 'express'
import VideoInfo from 'youtubei.js/dist/src/parser/youtube/VideoInfo'
import { requireVideoId } from '../middlewares/require-video-id'
import { getBasicInfoRaw } from '../youtube/scraping'
import createError from 'http-errors'

const getVideoInfo = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  const videoId: string = res.locals.videoId

  try {
    const infoRaw: VideoInfo = await getBasicInfoRaw(videoId)
    res.json(infoRaw)
  } catch (e) {
    next(createError.BadRequest('Video not found'))
  }
}

export const videoInfoRawController = [requireVideoId, getVideoInfo]
