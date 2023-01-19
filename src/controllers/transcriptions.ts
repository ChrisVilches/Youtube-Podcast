import { NextFunction, Request, Response } from 'express'
import { requireVideoId } from '../middlewares/require-video-id'
import createError from 'http-errors'
import { VideoBasicInfo, VideoBasicInfoModel } from '../models/video-basic-info'
import { fetchTranscriptions } from '../services/transcriptions'
import { TranscriptionResult } from '../models/transcription-result'

const getTranscriptions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const videoId: string = res.locals.videoId

  const metadata: VideoBasicInfo | null = await VideoBasicInfoModel.findOne({ videoId })

  if (metadata === null) {
    next(createError.NotFound('Video has not been processed'))
    return
  }

  try {
    metadata.validateCanDownload()
    const desiredLang = req.query.lang as string | undefined
    const result: TranscriptionResult = await fetchTranscriptions(metadata, desiredLang)
    // TODO: Should be json (+ text cleaning)
    // TODO: Consider implementing the "cleaning" process in the TranscriptionResultModel itself.
    res.json(result)
    // res.json(transcription)
  } catch (e) {
    next(createError.BadRequest((e as Error).message))
  }
}

export const transcriptionsController = [requireVideoId, getTranscriptions]
