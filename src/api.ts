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

// TODO: Change all filenames to aaa-bbb-ccc
//       Reasoning:
/*
https://stackoverflow.com/questions/18927298/node-js-project-naming-conventions-for-files-folders
Use kebab-case for all package, folder and file names.

Why?
You should imagine that any folder or file might be extracted to its own package some day. Packages cannot contain uppercase letters.
*/
// Also I agree because files are not enforced to have only one or multiple exports. It can be an arbitrary number of exports,
// so it doesn't make sense to use camelCase when it's one (another one could be added in the future!) or kebab-case for files with multiple
// exports. So it makes sense to use kebab-case because the "filename" is independent from its content, although it obviously should explain
// what the file is about.

bootstrap(() => {
  const app: Express = express()

  const port = Number(process.env.PORT)

  app.use(morgan('combined'))

  app.get('/', homeController)
  app.get('/info', processedVideoInfoController)
  app.get('/info_raw', videoInfoRawController)
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
