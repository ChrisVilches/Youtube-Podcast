import { getModelForClass, modelOptions, prop, Severity } from '@typegoose/typegoose'
import Thumbnail from 'youtubei.js/dist/src/parser/classes/misc/Thumbnail'
import { Base } from './base'

const validateDuration = (duration: number): void => {
  if (duration > Number(process.env.MAX_VIDEO_LENGTH_SECONDS)) {
    throw new Error(`Video is too long (${duration} seconds)`)
  }

  if (typeof duration !== 'number' || duration <= 0 || isNaN(duration)) {
    throw new Error(`Duration is ${duration}, but must be a number greater than zero (video may be invalid)`)
  }
}

const validateLengthBytes = (lengthBytes?: number): void => {
  if ((lengthBytes ?? 0) <= 0) {
    throw new Error('Content length (bytes) cannot be zero (video may be invalid)')
  }
}

export interface TranscriptionMetadata {
  url: string
  name: string
  lang: string
}

@modelOptions({
  options: {
    allowMixed: Severity.ALLOW
  }
})
export class VideoBasicInfo extends Base {
  @prop({ required: true, unique: true })
  public videoId!: string

  @prop({ required: true })
  public title!: string

  @prop({ required: true })
  public duration!: number

  @prop({ required: true })
  public description!: string

  @prop({ required: true })
  public lengthBytes?: number

  @prop({ required: true })
  public thumbnails!: Thumbnail[]

  @prop({ required: true })
  public transcriptions?: TranscriptionMetadata[]

  validateCanDownload (): void {
    validateDuration(this.duration)
    validateLengthBytes(this.lengthBytes)
  }
}

export const VideoBasicInfoModel = getModelForClass(VideoBasicInfo)
