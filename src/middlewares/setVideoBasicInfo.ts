import { NextFunction, Request, Response } from 'express'
import { getBasicInfo } from '../youtube/download'
import { requireVideoId } from './requireVideoId'

const fetchBasicInfo = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    res.locals.info = await getBasicInfo(res.locals.videoId)
    next()
  } catch {
    res.status(400).send(`Video ${res.locals.videoId as string} is not available`)
  }
}

export const setVideoBasicInfo = [requireVideoId, fetchBasicInfo]
