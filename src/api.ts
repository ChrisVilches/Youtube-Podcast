/* eslint-disable @typescript-eslint/no-misused-promises */

import express, { Express, NextFunction } from 'express'
import dotenv from 'dotenv'
import { downloadController, prepareController } from './controllers/download'
import { showPlaylistInfoController, playlistPrepareAllController } from './controllers/playlist'
import { homeController } from './controllers/misc'
import morgan from 'morgan'
import { errorHandler } from './middlewares/errorHandler'
import createError from 'http-errors'
import { videoInfoController } from './controllers/videoInfo'
dotenv.config()

const app: Express = express()

const port = Number(process.env.PORT)

app.use(morgan('combined'))

app.get('/', homeController)
app.get('/info', videoInfoController)
app.get('/download', downloadController)
app.post('/prepare', prepareController)
app.get('/playlist/:id', showPlaylistInfoController)
app.post('/playlist/:id/prepare_all', playlistPrepareAllController)
app.use('*', (_res, _req, next: NextFunction) => next(createError.NotFound()))
app.use(errorHandler)

app.listen(port, () => {
  console.log(`⚡️ [${process.env.NODE_ENV ?? ''}] Server is running at port ${port}`)
})
