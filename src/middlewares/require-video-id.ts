import { NextFunction, Request, Response } from 'express'
import { parseVideoId } from '../util/youtube-url'

export const requireVideoId = (req: Request, res: Response, next: NextFunction): void => {
  res.locals.videoId = parseVideoId(req.query.v as string | undefined) ?? ''

  if (res.locals.videoId === '') {
    res.status(400).send('Video ID (v parameter) is required')
  } else {
    next()
  }
}
