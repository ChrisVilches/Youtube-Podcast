import { CaptionResult, CaptionResultModel } from '../models/caption-result'
import { CaptionMetadata, VideoBasicInfo } from '../models/video-basic-info'
import { summarizeText } from './text-summary'

const getDesiredCaption = (metadata: VideoBasicInfo, lang?: string): CaptionMetadata => {
  const captions = metadata.captions ?? []

  if (captions.length === 0) {
    throw new Error('This video has no captions available')
  }

  const desiredLang: string = lang ?? captions[0].lang

  const caption = captions.find((c: CaptionMetadata) => c.lang.toLocaleLowerCase() === desiredLang.toLocaleLowerCase())

  if (typeof caption === 'undefined' || caption === null) {
    throw new Error(`Caption '${desiredLang}' is not available`)
  }

  return caption
}

export const fetchCaptions = async (metadata: VideoBasicInfo, desiredLang?: string): Promise<CaptionResult> => {
  const caption = getDesiredCaption(metadata, desiredLang)

  const cached: CaptionResult | null = await CaptionResultModel.findOne({ videoId: metadata.videoId, lang: caption.lang })

  if (cached !== null) {
    return cached
  }

  // TODO: I'm not sure about this error handling.
  //       It can probably be recycled.
  //       But actually the most important thing is that if it fails, the user can retry and it would
  //       use OpenAI multiple times.
  try {
    const captionRes = await fetch(caption.url)

    // TODO: Value must be cleaned (note: I don't see much value in storing the raw content. Skip for now)
    const captionContent = await captionRes.text()
    const summary: string | undefined = await summarizeText(captionContent, caption.lang)

    const result = await CaptionResultModel.create({
      videoId: metadata.videoId,
      lang: caption.lang,
      summary,
      caption: captionContent
    })

    return result
  } catch (e) {
    console.error(e)
    throw new Error('Something happened')
  }
}
