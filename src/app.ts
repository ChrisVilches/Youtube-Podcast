/* eslint-disable @typescript-eslint/no-misused-promises */
// TODO: Enable this rule and fix the code.

import express, { Express, Request, Response } from 'express'
import dotenv from 'dotenv'
import { downloadVideoToAudio, getPlayList, tryGetBasicInfo } from './youtube/download'
import path from 'path'
import { isFileAlreadyDownloaded } from './storage/isFileAlreadyDownloaded'

dotenv.config()

const app: Express = express()
const port = process.env.PORT ?? 3000
// TODO: This url generation should be dynamic.
const url: string = `http://localhost:${port}`

app.get('/', (_req: Request, res: Response) => {
  res.json({
    port,
    env: process.env.NODE_ENV
  })
})

// TODO: Should lock the file to be downloaded, so that it's only downloaded once...
//       Ok so I do need SQL after all? (not MongoDB). Or use like a Redis with some atomic operations?
//       I don't know if that's possible.
// TODO: File storage must be improved. Storing the files here is not good.
app.get('/download', async (req: Request, res: Response) => {
  const videoId: string = (req.query.v as string) ?? ''
  const storageDir = path.join(__dirname, '..', 'files', videoId)

  try {
    const fileName = await isFileAlreadyDownloaded(videoId)
    res.sendFile(fileName, { root: storageDir })
  } catch (e) {
    res.status(400).send(e.toString())
  }
})

app.get('/prepare', async (req: Request, res: Response) => {
  const videoId: string = (req.query.v as string) ?? ''

  const info = await tryGetBasicInfo(videoId)
  if (info == null) {
    res.status(400).send(`Video ${videoId} is not available`)
    return
  }

  downloadVideoToAudio(videoId, (info as any).title).then(r => {
    console.log(`Result: ${r ? 'Yes' : 'No'}`)
  }).catch(console.error)

  res.send('Downloading & converting... execute /download?v=... after a few moments')
})

app.get('/playlist/:id', async (req: Request, res: Response) => {
  const playlist = await getPlayList(req.params.id)
  res.json(playlist.items)
})

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at ${url}`)
})
