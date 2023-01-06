import dotenv from 'dotenv'
import { getVideosQueue } from './queues/getVideosQueue'
import { downloadVideoToAudio, getBasicInfo } from './youtube/download'
import { withNamedLock } from './youtube/withNamedLock'

dotenv.config()

const workerName = `worker-${process.pid}`

const processVideoId = async (videoId: string): Promise<void> => {
  // TODO: Note that this may crash if the video is not available. We must handle
  //       the error somehow. Before, when the error was reported in the API, the code from the middleware
  //       was this:
  //       Update: I moved it into the try and catch.
  /*
    try {
      res.locals.info = await getBasicInfo(res.locals.videoId)
      next()
    } catch {
      res.status(400).send(`Video ${res.locals.videoId as string} is not available`)
    }
  */

  try {
    const videoTitle: string = (await getBasicInfo(videoId)).title
    console.log(`Title: ${videoTitle}`)
    await downloadVideoToAudio(videoId, videoTitle)
  } catch (e) {
    console.error(e)
  }
}

const queueConsumer = async (): Promise<void> => {
  await getVideosQueue().process(async ({ data }) => {
    const { id: videoId }: { id: string } = data
    // TODO: This is a hack to avoid the queue from fetching a new item from the queue
    //       while the process is busy doing an async operation. How to fix this in a better way?
    console.log(`⚡ Processing ${videoId}`)
    await withNamedLock(workerName, async () => await processVideoId(videoId))
    console.log(`✅ Processed ${videoId}`)
    console.log()
  })
}

queueConsumer().catch(console.error)
