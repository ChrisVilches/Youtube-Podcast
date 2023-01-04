/* eslint-disable @typescript-eslint/no-misused-promises */
// TODO: Enable this rule and fix the code.

import express, { Express } from 'express'
import dotenv from 'dotenv'
import { requireVideoId } from './middlewares/requireVideoId'
import { setVideoBasicInfo } from './middlewares/setVideoBasicInfo'
import { downloadController, prepareController } from './controllers/download'
import { showPlaylistInfoController } from './controllers/playlist'
import { homeController } from './controllers/misc'

dotenv.config()

const app: Express = express()

const port = Number(process.env.PORT)
// TODO: This url generation should be dynamic.
const url: string = `http://localhost:${port}`

app.get('/', homeController)
app.get('/download', requireVideoId, downloadController)
app.get('/prepare', setVideoBasicInfo, prepareController)
app.get('/playlist/:id', showPlaylistInfoController)

app.listen(port, () => {
  console.log(`⚡️ [${process.env.NODE_ENV ?? ''}] Server is running at ${url}`)
})
