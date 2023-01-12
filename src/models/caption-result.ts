import { getModelForClass, index, prop } from '@typegoose/typegoose'
import { Base } from './base'

// TODO: I think it's necessary to also execute the "ensureIndexes" method on the model.
// TODO: Does this index work? Make sure it does, because I only added "unique" and not "index" (unique should be enough)
@index({ videoId: 1, lang: 1 }, { unique: true })
export class CaptionResult extends Base {
  @prop({ required: true })
  public videoId!: string

  // TODO: May want to add a "non empty" validation check.
  @prop({ required: true })
  public lang!: string

  // TODO: I think this and every other occurrence of the word "caption" should actually be "transcription".
  //       "caption" is slightly different (it implies it has timestamps).
  @prop({ required: true })
  public caption!: string

  @prop({ required: false })
  public summary?: string
}

export const CaptionResultModel = getModelForClass(CaptionResult)
