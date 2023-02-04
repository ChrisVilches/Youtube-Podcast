import { NextFunction, Request, Response } from 'express'
import { getChannelVideosAsPlaylist } from '../youtube/scraping'
import createError from 'http-errors'

const AT_REGEX = /@/g

export const showChannelLatestVideosController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const username = (req.params.username ?? '').replace(AT_REGEX, '').trim()

  if (username.length === 0) {
    next(createError.BadRequest('Channel username must be given'))
    return
  }

  try {
    const playlist = await getChannelVideosAsPlaylist(username)
    res.json(playlist)
  } catch (e) {
    next(createError.BadRequest(String(e)))
  }
}
