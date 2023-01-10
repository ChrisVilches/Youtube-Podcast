import mongoose from 'mongoose'

export async function initializeMongo (): Promise<void> {
  try {
    mongoose.set('strictQuery', true)
    await mongoose.connect(process.env.MONGO_URL as string)
    console.log('Mongo OK')
  } catch (e) {
    console.log(e)
  }
}
