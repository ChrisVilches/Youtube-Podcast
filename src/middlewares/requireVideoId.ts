import { NextFunction, Request, Response } from 'express'

export const requireVideoId = (req: Request, res: Response, next: NextFunction): void => {
  res.locals.videoId = (req.query.v as string) ?? ''
  if (res.locals.videoId === '') {
    res.status(400).send('Video ID (v parameter) is required')
  } else {
    next()
  }
}
