import { getModelForClass, index, prop } from '@typegoose/typegoose'
import { Base } from './base'

@index({ username: 1, channelId: 1 }, { unique: true })
export class UserChannel extends Base {
  @prop({ required: true, minLength: 1, maxLength: 100, lowercase: true, trim: true })
  public username!: string

  @prop({ required: true, minLength: 1, maxLength: 50, trim: true })
  public channelId!: string
}

export const UserChannelModel = getModelForClass(UserChannel)
