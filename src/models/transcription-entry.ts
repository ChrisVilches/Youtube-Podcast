import { prop } from '@typegoose/typegoose'

export class TranscriptionEntry {
  @prop({ required: true })
  public text!: string

  @prop({ required: true })
  public start!: number

  @prop({ required: true })
  public duration!: number
}
