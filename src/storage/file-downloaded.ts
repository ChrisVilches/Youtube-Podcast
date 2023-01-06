import { join } from 'path'
import { readdir } from 'fs'

export async function isFileAlreadyDownloaded (videoId: string): Promise<boolean> {
  const storageDir = join(__dirname, '..', '..', 'files', videoId)

  return await new Promise((resolve, _reject) => {
    readdir(storageDir, (err, files) => resolve(err === null && files.length === 1))
  })
}

export async function getDownloadedFilename (videoId: string): Promise<string | null> {
  const storageDir = join(__dirname, '..', '..', 'files', videoId)

  return await new Promise(resolve => {
    readdir(storageDir, (err, files) => {
      if (err !== null || files.length !== 1) {
        resolve(null)
      } else {
        resolve(files[0])
      }
    })
  })
}
