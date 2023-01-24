import { createWriteStream } from 'node:fs'
import { WritableStream } from 'node:stream/web'
import mmm from 'mmmagic'

const magic = new mmm.Magic()

const detectType = async (path: string): Promise<string> => await new Promise<string>((resolve, reject) => {
  magic.detectFile(path, (err: any, result: string) => {
    if (err !== null && typeof err !== 'undefined') {
      reject(err)
    }

    resolve(result)
  })
})

export const downloadFile = async (url: string, path: string): Promise<void> => {
  console.log('Downloading File')
  console.log('URL:', url)
  console.log('Dest:', path)
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
  console.log('File type:', await detectType(path))
}
