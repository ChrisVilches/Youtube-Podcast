/* eslint-disable @typescript-eslint/no-misused-promises */

import express, { Express, NextFunction } from 'express'
import { downloadController } from './controllers/download'
import { showPlaylistInfoController } from './controllers/playlist'
import { homeController } from './controllers/misc'
import morgan from 'morgan'
import { errorHandler } from './middlewares/error-handler'
import createError from 'http-errors'
import { videoInfoRawController } from './controllers/video-info-raw'
import { bootstrap } from './bootstrap'
import { processedVideoInfoController } from './controllers/video-info'
import { transcriptionsController } from './controllers/transcriptions'

// TODO: I'm not sure if there's some extra unused code that resulted from removing the "prepare" controller
//       and all of its middlewares.

bootstrap(() => {
  const app: Express = express()

  const port = Number(process.env.API_PORT)

  app.use(morgan('combined'))

  app.get('/', homeController)
  app.get('/info', processedVideoInfoController)
  app.get('/info_raw', videoInfoRawController)
  app.get('/transcriptions', transcriptionsController)
  app.get('/download', downloadController)
  app.get('/playlist/:id', showPlaylistInfoController)
  app.use('*', (_res, _req, next: NextFunction) => next(createError.NotFound()))
  app.use(errorHandler)

  app.listen(port, () => {
    console.log(`⚡️ [${process.env.NODE_ENV ?? ''}] Server is running at port ${port}`)
  })
})
