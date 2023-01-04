import { join } from 'path'
import { readdir } from 'fs'

// TODO: This function doesn't need to be "async" as far as I know.. (lint error?)
/* eslint-disable @typescript-eslint/promise-function-async */
export function isFileAlreadyDownloaded (videoId: string): Promise<string> {
  const storageDir = join(__dirname, '..', '..', 'files', videoId)

  return new Promise((resolve, reject) => {
    readdir(storageDir, (err, files) => {
      if (err != null || files.length !== 1) {
        reject(new Error(`File has not been downloaded. Execute /prepare?v=${videoId} first`))
      } else {
        resolve(files[0])
      }
    })
  })
}
