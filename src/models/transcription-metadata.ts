import { prop } from '@typegoose/typegoose'

export class TranscriptionMetadata {
  @prop({ required: true, minlength: 10, trim: true })
  public url!: string

  @prop({ required: true, minLength: 1, trim: true })
  public name!: string

  @prop({ required: true, minLength: 1, maxLength: 20, lowercase: true, trim: true })
  public lang!: string
}
