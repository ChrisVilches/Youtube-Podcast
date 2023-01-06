/* eslint-disable @typescript-eslint/no-misused-promises */
// TODO: Enable this rule and fix the code.

import express, { Express } from 'express'
import dotenv from 'dotenv'
import { downloadController, prepareController } from './controllers/download'
import { showPlaylistInfoController } from './controllers/playlist'
import { homeController } from './controllers/misc'

dotenv.config()

const app: Express = express()

const port = Number(process.env.PORT)

app.get('/', homeController)
app.get('/download', downloadController)
app.get('/prepare', prepareController)
app.get('/playlist/:id', showPlaylistInfoController)

app.listen(port, () => {
  console.log(`⚡️ [${process.env.NODE_ENV ?? ''}] Server is running at port ${port}`)
})
