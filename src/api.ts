/* eslint-disable @typescript-eslint/no-misused-promises */

import express, { Express, NextFunction } from 'express'
import { downloadController, prepareController } from './controllers/download'
import { showPlaylistInfoController, playlistPrepareAllController } from './controllers/playlist'
import { homeController } from './controllers/misc'
import morgan from 'morgan'
import { errorHandler } from './middlewares/error-handler'
import createError from 'http-errors'
import { videoInfoRawController } from './controllers/video-info-raw'
import { bootstrap } from './bootstrap'
import { processedVideoInfoController } from './controllers/processed-video-info'
import { captionsController } from './controllers/captions'

bootstrap(() => {
  const app: Express = express()

  const port = Number(process.env.PORT)

  app.use(morgan('combined'))

  app.get('/', homeController)
  app.get('/info', processedVideoInfoController)
  app.get('/info_raw', videoInfoRawController)
  app.get('/captions', captionsController)
  app.get('/download', downloadController)
  app.post('/prepare', prepareController)
  app.get('/playlist/:id', showPlaylistInfoController)
  app.post('/playlist/:id/prepare_all', playlistPrepareAllController)
  app.use('*', (_res, _req, next: NextFunction) => next(createError.NotFound()))
  app.use(errorHandler)

  app.listen(port, () => {
    console.log(`⚡️ [${process.env.NODE_ENV ?? ''}] Server is running at port ${port}`)
  })
})
