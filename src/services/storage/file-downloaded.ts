import { resolve } from 'path'
import { readdir } from 'fs'

export const isFileAlreadyDownloaded = async (videoId: string): Promise<boolean> =>
  await getDownloadedFilename(videoId) !== null

export async function getDownloadedFilename (videoId: string): Promise<string | null> {
  const storageDir = resolve(__filename, '..', '..', '..', '..', 'files', videoId)

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
