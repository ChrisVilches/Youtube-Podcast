import { modelOptions } from '@typegoose/typegoose'
import { TimeStamps } from '@typegoose/typegoose/lib/defaultClasses'

const clean = {
  virtuals: false,
  versionKey: false,
  transform (_doc: unknown, ret: { _id: unknown }) {
    delete ret._id
  }
}

@modelOptions({
  schemaOptions: {
    toJSON: clean,
    toObject: clean
  }
})
export class Base extends TimeStamps {}
