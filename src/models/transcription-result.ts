import { getModelForClass, index, mongoose, prop } from '@typegoose/typegoose'
import { Base } from './base'
import { TranscriptionEntry } from './transcription-entry'

const transcriptionValidatorSorted = (value: TranscriptionEntry[]): boolean => {
  for (let i = 0; i < value.length - 1; i++) {
    const curr = value[i]
    const next = value[i + 1]
    if (curr.start >= next.start) {
      return false
    }
  }

  return true
}

@index({ videoId: 1, lang: 1 }, { unique: true })
export class TranscriptionResult extends Base {
  @prop({ required: true })
  public videoId!: string

  @prop({ required: true, minLength: 1, maxLength: 20, lowercase: true, trim: true })
  public lang!: string

  @prop({
    required: true,
    validate: {
      validator: transcriptionValidatorSorted,
      message: 'start times must be sorted'
    },
    type: () => [TranscriptionEntry]
  })
  public transcription!: mongoose.Types.Array<TranscriptionEntry>

  @prop({ required: false })
  public summary?: string
}

export const TranscriptionResultModel = getModelForClass(TranscriptionResult)
