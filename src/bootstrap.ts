import dotenv from 'dotenv'
import { initializeMongo } from './models/initializeMongo'

async function init (): Promise<void> {
  dotenv.config()
  await initializeMongo()
}

export const bootstrap = (executeApp: () => void): void => {
  init().then(() => {
    executeApp()
  }).catch(e => {
    console.log(e)
    process.exit(1)
  })
}
