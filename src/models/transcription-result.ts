import { getModelForClass, index, prop } from '@typegoose/typegoose'
import { Base } from './base'

@index({ videoId: 1, lang: 1 }, { unique: true })
export class TranscriptionResult extends Base {
  @prop({ required: true })
  public videoId!: string

  @prop({ required: true, minLength: 1, maxLength: 5, lowercase: true, trim: true })
  public lang!: string

  @prop({ required: true })
  public transcription!: string

  @prop({ required: false })
  public summary?: string
}

export const TranscriptionResultModel = getModelForClass(TranscriptionResult)
