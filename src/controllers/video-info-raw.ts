import { Request, Response } from 'express'
import VideoInfo from 'youtubei.js/dist/src/parser/youtube/VideoInfo'
import { requireVideoId } from '../middlewares/require-video-id'
import { getBasicInfoRaw } from '../youtube/scraping'

const getVideoInfo = async (req: Request, res: Response): Promise<void> => {
  const videoId: string = (req.query.v as string) ?? ''
  const infoRaw: VideoInfo = await getBasicInfoRaw(videoId)
  res.json(infoRaw)
}

export const videoInfoRawController = [requireVideoId, getVideoInfo]
