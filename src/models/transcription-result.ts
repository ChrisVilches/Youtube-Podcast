import { getModelForClass, index, prop } from '@typegoose/typegoose'
import { Base } from './base'

export interface TranscriptionEntry {
  text: string
  start: number
  duration: number
}

@index({ videoId: 1, lang: 1 }, { unique: true })
export class TranscriptionResult extends Base {
  @prop({ required: true })
  public videoId!: string

  @prop({ required: true, minLength: 1, maxLength: 20, lowercase: true, trim: true })
  public lang!: string

  // TODO: This should have its validation, since it's always the same structure
  //       The structure is a list of TranscriptionEntry, which right now is on a different file.
  @prop({ required: true })
  public transcription!: TranscriptionEntry

  @prop({ required: false })
  public summary?: string
}

export const TranscriptionResultModel = getModelForClass(TranscriptionResult)
