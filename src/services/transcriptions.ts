import { TranscriptionResult, TranscriptionResultModel } from '../models/transcription-result'
import { TranscriptionMetadata, VideoBasicInfo } from '../models/video-basic-info'
import { summarizeText } from './text-summary'

const getDesiredTranscription = (metadata: VideoBasicInfo, lang?: string): TranscriptionMetadata => {
  const transcriptions = metadata.transcriptions ?? []

  if (transcriptions.length === 0) {
    throw new Error('This video has no transcriptions available')
  }

  const desiredLang: string = lang ?? transcriptions[0].lang

  const transcription = transcriptions.find((c: TranscriptionMetadata) => c.lang.toLocaleLowerCase() === desiredLang.toLocaleLowerCase())

  if (typeof transcription === 'undefined' || transcription === null) {
    throw new Error(`Transcription '${desiredLang}' is not available`)
  }

  return transcription
}

export const fetchTranscriptions = async (metadata: VideoBasicInfo, desiredLang?: string): Promise<TranscriptionResult> => {
  const transcription = getDesiredTranscription(metadata, desiredLang)

  const cached: TranscriptionResult | null = await TranscriptionResultModel.findOne({ videoId: metadata.videoId, lang: transcription.lang })

  if (cached !== null) {
    return cached
  }

  // TODO: I'm not sure about this error handling.
  //       It can probably be recycled.
  //       But actually the most important thing is that if it fails, the user can retry and it would
  //       use OpenAI multiple times.
  try {
    const transcriptionRes = await fetch(transcription.url)

    const transcriptionContent = await transcriptionRes.text()
    const summary: string | undefined = await summarizeText(transcriptionContent, transcription.lang)

    const result = await TranscriptionResultModel.create({
      videoId: metadata.videoId,
      lang: transcription.lang,
      summary,
      transcription: transcriptionContent
    })

    return result
  } catch (e) {
    console.error(e)
    // TODO: Test the output of this (how does it look when using the API Client, Thunder in my case).
    //       I think it should be an 500 error without message. But what was my intention?
    //       I think I should move the console.error to the global error handler and log all status >= 500 errors
    //       (other errors are not necessary to log because they might be user errors like bad requests or forbidden, etc)
    //       Then, I can just remove all this try/catch.
    //       The problem about retrying (and using a lot of OpenAI credits) still remains though. This is because failed
    //       queries are not cached, but they may still use some credits if the summarization executes, but because it doesn't
    //       get cached, the user can trigger the query again, consuming even more credits.
    throw new Error('Something happened')
  }
}
