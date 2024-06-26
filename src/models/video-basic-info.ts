import { getModelForClass, mongoose, prop } from '@typegoose/typegoose'
import { Base } from './base'
import { Thumbnail } from './thumbnail'
import { TranscriptionMetadata } from './transcription-metadata'

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

export class VideoBasicInfo extends Base {
  @prop({ required: true, unique: true })
  public videoId!: string

  @prop({ required: true })
  public title!: string

  @prop({ required: true })
  public author!: string

  @prop({ required: true })
  public duration!: number

  @prop({ required: true })
  public description!: string

  @prop({ required: true })
  public audioUrl?: string

  @prop({ required: true })
  public lengthBytes?: number

  @prop({ required: true, type: () => [Thumbnail] })
  public thumbnails!: mongoose.Types.Array<Thumbnail>

  @prop({ required: true, type: () => [TranscriptionMetadata] })
  public transcriptions!: mongoose.Types.Array<TranscriptionMetadata>

  validateCanDownload (): void {
    validateDuration(this.duration)
    validateLengthBytes(this.lengthBytes)
  }
}

export const VideoBasicInfoModel = getModelForClass(VideoBasicInfo)
