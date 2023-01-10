import { getModelForClass, prop } from '@typegoose/typegoose'
import { Base } from './Base'

// TODO: I think it's necessary to also execute the "ensureIndexes" method on the model.
// TODO: Does this index work? Make sure it does, because I only added "unique" and not "index" (unique should be enough)
export class DownloadStat extends Base {
  @prop({ required: true, unique: true })
  public videoId!: string

  @prop({ required: true, default: 0 })
  public downloadCount!: number
}

export const DownloadStatModel = getModelForClass(DownloadStat)
