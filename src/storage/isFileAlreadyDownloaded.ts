import { join } from 'path'
import { readdir } from 'fs'

// TODO: Note that this actually doesn't work... because the file will be seen as "already downloaded"
//       simply because the stream is being written to disk, and the file exists, but the download is not complete.
//       I haven't actually confirmed this happen, but it should happen the way I described.

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
