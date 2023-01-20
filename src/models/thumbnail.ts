import { prop } from '@typegoose/typegoose'

export class Thumbnail {
  @prop({ required: true, minlength: 10, trim: true })
  public url!: string

  @prop({ required: true, min: 1 })
  public width!: number

  @prop({ required: true, min: 1 })
  public height!: number
}
