import { bootstrap } from './bootstrap'
import { Server } from 'socket.io'
import express from 'express'
import { createServer } from 'http'
import { PREPARE_EVENTS_CHANNEL } from './channels/prepare-events-channel'
import { getRedisClient } from './services/storage/redis-client'
import { removeVideo, videoExists } from './services/storage/persisted-files'
import { addVideoJob } from './queues/videos-queue'

// TODO: It doesn't need MongoDB. Remove it from the bootstrapper?
bootstrap(async (): Promise<void> => {
  const app = express()
  const server = createServer(app)
  const io = new Server(server)
  const port = process.env.SOCKET_IO_PORT ?? 0
  console.log(`Listening. Port: ${port}, path: ${io.path()}`)
  server.listen(port)

  io.on('connection', (socket) => {
    console.log('User connected')

    // TODO: Note that the client could join any arbitrary amount of rooms for no reason.
    // TODO: Change the name to "prepare", because this endpoint now prepares and makes the socket
    //       join the room at the same time (now in the correct order).
    socket.on('wait-prepared-result', async (videoId: string) => {
      console.log(videoId, 'Joining socket to room')
      await socket.join(videoId)

      // TODO: This is just for debugging. The "clear" flag.
      await removeVideo(videoId)

      // TODO: This is basically the same as the "prepare" API, but perhaps has less checks,
      //       so make sure it's as robust as the API one.
      if (await videoExists(videoId)) {
        io.to(videoId).emit('prepared-result', JSON.stringify({ videoId, success: true }))
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
    console.log(videoId, success)
    io.to(videoId).emit('prepared-result', JSON.stringify({ videoId, success }))

    io.in(videoId).socketsLeave(videoId)
    console.log(`Make socket leave room ${videoId}`)
  }).catch(console.log)
})
