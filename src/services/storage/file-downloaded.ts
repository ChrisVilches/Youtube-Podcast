import { join } from 'path'
import { readdir } from 'fs'

export const isFileAlreadyDownloaded = async (videoId: string): Promise<boolean> =>
  await getDownloadedFilename(videoId) !== null

// TODO: The "'..', '..', '..'" makes it buggy if I move this file to a nested folder.
export async function getDownloadedFilename (videoId: string): Promise<string | null> {
  const storageDir = join(__dirname, '..', '..', '..', 'files', videoId)

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
