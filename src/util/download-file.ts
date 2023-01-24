import { createWriteStream } from 'node:fs'
import { WritableStream } from 'node:stream/web'

export const downloadFile = async (url: string, path: string): Promise<void> => {
  console.log('Downloading...')
  console.log(url)
  const res = await fetch(url)
  const body: ReadableStream<Uint8Array> | null = res.body
  const fileStream = createWriteStream(path)

  const writableStream = new WritableStream({
    write: async (chunk) => {
      return await new Promise((resolve, reject) => {
        fileStream.write(chunk, (err) => {
          if (err !== null && typeof err !== 'undefined') {
            reject(err)
          } else {
            resolve()
          }
        })
      })
    }
  })

  console.assert(body !== null)

  await body?.pipeTo(writableStream)
}
