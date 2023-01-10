import mongoose from 'mongoose'

export async function initializeMongo (): Promise<void> {
  mongoose.set('strictQuery', true)
  await mongoose.connect(process.env.MONGO_URL as string)
}
