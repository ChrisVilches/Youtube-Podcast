import mongoose from 'mongoose'
import { dbUrl } from '../util/dbUrl'

export async function initializeMongo (): Promise<void> {
  const url = dbUrl('mongodb', 'MONGO')

  try {
    mongoose.set('strictQuery', true)
    await mongoose.connect(url)
    console.log('Mongo OK')
  } catch (e) {
    console.log(e)
  }
}
