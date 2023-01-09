import { getModelForClass, index, prop } from '@typegoose/typegoose'
import { TimeStamps } from '@typegoose/typegoose/lib/defaultClasses'
import Thumbnail from 'youtubei.js/dist/src/parser/classes/misc/Thumbnail'

const validateDuration = (duration: number): void => {
  if (duration > Number(process.env.MAX_VIDEO_LENGTH_SECONDS)) {
    throw new Error(`Video is too long (${duration} seconds)`)
  }

  if (typeof duration !== 'number' || duration === 0 || isNaN(duration)) {
    throw new Error(`Duration is ${duration}, but must be a number greater than zero (video may be invalid)`)
  }
}

const validateLengthBytes = (lengthBytes?: number): void => {
  if ((lengthBytes ?? 0) <= 0) {
    throw new Error('Content length (bytes) cannot be zero (video may be invalid)')
  }
}

// TODO: What is the "1"??
// TODO: I think it's necessary to also execute the "ensureIndexes" method on the model.
@index({ videoId: 1 }, { unique: true })
export class VideoBasicInfo extends TimeStamps {
  @prop({ required: true })
  public videoId!: string

  @prop({ required: true })
  public title!: string

  @prop({ required: true })
  public duration!: number

  @prop({ required: true })
  public description!: string

  @prop({ required: true })
  public lengthBytes?: number

  @prop({ required: false })
  public thumbnails!: Thumbnail[]

  validateCanDownload (): void {
    validateDuration(this.duration)
    validateLengthBytes(this.lengthBytes)
  }
}

export const VideoBasicInfoModel = getModelForClass(VideoBasicInfo)
