import { NextFunction, Request, Response } from 'express'
import { removeVideo } from '../services/storage/persisted-files'

/*
TODO: I don't think it's necessary to remove the file when using force.

User A prepares video
user A tries to download it, but before that
User B force-prepares video
user A cannot download it

But i'm not sure about what would happen if the download stream is still being processed while the file gets replaced.
I think it's necessary to check if the logic doesn't break with this change (i.e. removing the "removeVideo" line)
*/

export const forceDownloadAgain = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const videoId: string = res.locals.videoId

  const inProgress = res.locals.inProgress as boolean

  if (!inProgress && 'force' in req.query) {
    await removeVideo(videoId)
  }

  next()
}
