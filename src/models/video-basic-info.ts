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

export interface CaptionMetadata {
  url: string
  name: string
  lang: string
}

// TODO: I think it's necessary to also execute the "ensureIndexes" method on the model.
// TODO: Does this index work? Make sure it does, because I only added "unique" and not "index" (unique should be enough)
// NOTE: Some fields are not required for building an instance, but are required when saving the object.
//       This prevents incomplete instances to be saved, allowing only detailed data to be persisted (obtained with certain APIs).
//       TODO: This should be explained using unit tests, not with comments.
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
  public captions?: CaptionMetadata[]

  validateCanDownload (): void {
    validateDuration(this.duration)
    validateLengthBytes(this.lengthBytes)
  }
}

export const VideoBasicInfoModel = getModelForClass(VideoBasicInfo)
