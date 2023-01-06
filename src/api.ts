/* eslint-disable @typescript-eslint/no-misused-promises */

import express, { Express, NextFunction } from 'express'
import dotenv from 'dotenv'
import { downloadController, prepareController } from './controllers/download'
import { showPlaylistInfoController, playlistPrepareAllController } from './controllers/playlist'
import { homeController } from './controllers/misc'
import morgan from 'morgan'
import { join } from 'path'
import { createWriteStream } from 'fs'
import { error } from './middlewares/error'
import createError from 'http-errors'
dotenv.config()

const app: Express = express()

const port = Number(process.env.PORT)

app.use(morgan('combined', {
  stream: createWriteStream(join(__dirname, '../logs', `${process.env.NODE_ENV as string}.log`), { flags: 'a' })
}))

app.get('/', homeController)
app.get('/download', downloadController)
app.post('/prepare', prepareController)
app.get('/playlist/:id', showPlaylistInfoController)
app.post('/playlist/:id/prepare_all', playlistPrepareAllController)
app.use('*', (_res, _req, next: NextFunction) => next(createError.NotFound()))
app.use(error)

app.listen(port, () => {
  console.log(`⚡️ [${process.env.NODE_ENV ?? ''}] Server is running at port ${port}`)
})
