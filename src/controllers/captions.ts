import { NextFunction, Request, Response } from 'express'
import { requireVideoId } from '../middlewares/require-video-id'
import createError from 'http-errors'
import { VideoBasicInfo, VideoBasicInfoModel } from '../models/video-basic-info'
import { fetchCaptions } from '../services/captions'

const getCaptions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const videoId: string = res.locals.videoId

  // TODO: What to do if new transcriptions are added? Does the "force" flag fetch
  //       the data again? This is not easy to fix, I think... The only easy way
  //       would be to have a way to refresh (re-fetch) the data, which defeats the purpose
  //       of caching things here.
  // TODO: The same thing happens if for example the summary is not available at one time,
  //       and the data is cached without the summary, but then it becomes available, the cache
  //       may never be cleared, and the summary may never be obtained. There's no mechanism
  //       that allows us to tell that a summary may have become available and we can free the cache
  //       and try to fetch it.
  const metadata: VideoBasicInfo | null = await VideoBasicInfoModel.findOne({ videoId })

  // TODO: All of this is hella spaghetti. Refactor.

  if (metadata === null) {
    next(createError.NotFound('Video has not been processed'))
    return
  }

  try {
    metadata.validateCanDownload()
    const desiredLang = req.query.lang as string | undefined
    const caption = await fetchCaptions(metadata, desiredLang)
    // TODO: Should be json (+ text cleaning)
    res.send(caption.caption.replace(/&amp;#39;/g, "'"))
    // res.json(caption)
  } catch (e) {
    next(createError.BadRequest((e as Error).message))
  }
}

export const captionsController = [requireVideoId, getCaptions]
