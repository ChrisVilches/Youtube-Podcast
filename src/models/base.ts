import { modelOptions } from '@typegoose/typegoose'
import { TimeStamps } from '@typegoose/typegoose/lib/defaultClasses'

const clean = {
  virtuals: false,
  versionKey: false,
  transform (_doc: any, ret: any) {
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
