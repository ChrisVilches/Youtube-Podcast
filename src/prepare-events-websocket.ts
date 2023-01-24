import { bootstrap } from './bootstrap'
import { Server } from 'socket.io'
import express from 'express'
import { createServer } from 'http'
import { PREPARE_EVENTS_CHANNEL } from './channels/prepare-events-channel'
import { getRedisClient } from './services/storage/redis-client'
import { videoExists } from './services/storage/persisted-files'
import { addVideoJob } from './queues/videos-queue'

const PREPARED_RESULT_EVENT = 'prepared-result'
const EXECUTE_PREPARE_EVENT = 'execute-prepare'

const notifyPrepareFinish = (io: Server, videoId: string, success: boolean): void => {
  console.log(videoId, success)
  io.to(videoId).emit(PREPARED_RESULT_EVENT, JSON.stringify({ videoId, success }))
  io.in(videoId).socketsLeave(videoId)
  console.log(`Make socket leave room ${videoId}`)
}

bootstrap(async (): Promise<void> => {
  const app = express()
  const server = createServer(app)
  const io = new Server(server)
  const port = process.env.SOCKET_IO_PORT ?? 0
  console.log(`Listening. Port: ${port}, path: ${io.path()}`)
  server.listen(port)

  io.on('connection', (socket) => {
    console.log('User connected')

    socket.on(EXECUTE_PREPARE_EVENT, async (rawVideoId: any) => {
      const videoId: string = (rawVideoId ?? '').trim()
      console.log(videoId, 'Joining socket to room')
      await socket.join(videoId)

      if (videoId.length === 0) {
        notifyPrepareFinish(io, videoId, false)
      } else if (await videoExists(videoId)) {
        notifyPrepareFinish(io, videoId, true)
      } else {
        await addVideoJob(videoId)
      }
    })

    socket.on('disconnect', () => {
      console.log('User disconnected')
    })
  })

  const client = await getRedisClient()

  client.subscribe(PREPARE_EVENTS_CHANNEL, (message: string) => {
    const { videoId, success }: { videoId: string, success: boolean } = JSON.parse(message)
    notifyPrepareFinish(io, videoId, success)
  }).catch(console.log)
})
