import { getModelForClass, prop } from '@typegoose/typegoose'
import { Base } from './base'

export class DownloadStat extends Base {
  @prop({ required: true, unique: true })
  public videoId!: string

  @prop({ required: true, default: 0 })
  public downloadCount!: number
}

export const DownloadStatModel = getModelForClass(DownloadStat)
