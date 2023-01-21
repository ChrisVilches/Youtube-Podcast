import { createClient } from 'redis'
import { bootstrap } from './bootstrap'
import { Server } from 'socket.io'
import express from 'express'
import { createServer } from 'http'
import { PREPARE_EVENTS_CHANNEL } from './channels/prepare-events-channel'

// TODO: It doesn't need MongoDB. Remove it from the bootstrapper?
bootstrap(async (): Promise<void> => {
  const client = createClient({ url: process.env.REDIS_URL })
  await client.connect()

  const app = express()
  const server = createServer(app)
  const io = new Server(server)
  const port = process.env.SOCKET_IO_PORT ?? 0
  console.log(`Listening (${port})`)
  server.listen(port)

  io.on('connection', (socket) => {
    console.log('User connected')

    // TODO: Note that the client could join any arbitrary amount of rooms for no reason.
    socket.on('wait-prepared-result', async (roomName: string) => {
      console.log(roomName, 'Joining socket to room')
      await socket.join(roomName)
    })

    socket.on('disconnect', () => {
      console.log('User disconnected')
      // TODO: Cleanup necessary?
    })
  })

  client.subscribe(PREPARE_EVENTS_CHANNEL, (message: string) => {
    const { videoId, success } = JSON.parse(message)
    console.log(videoId, success)
    io.to(videoId).emit('prepared-result', JSON.stringify({ videoId, success }))

    // TODO: Is this logic correct? Make all clients leave the room that just had its
    //       "prepared-result" event.
    io.in(videoId).socketsLeave(videoId)
  }).catch(console.log)
})
