import dotenv from 'dotenv'
import { getVideosQueue } from './queues/getVideosQueue'
import { downloadVideoToAudio, getBasicInfo } from './youtube/scraping'

dotenv.config()

// TODO: Some issues happen when the process is killed.
//       Maybe this can be fixed by adding a "graceful shutdown" and do some cleanup
//       before exiting the process.

const formatDuration = (seconds: number): string => {
  return new Date(seconds * 1000).toISOString().slice(11, 19)
}

const validateDuration = (duration: number): void => {
  if (duration > Number(process.env.MAX_VIDEO_LENGTH_SECONDS)) {
    throw new Error(`Video is too long (${formatDuration(duration)})`)
  }

  if (typeof duration !== 'number' || duration === 0 || isNaN(duration)) {
    throw new Error(`Duration is ${duration}, but must be a number greater than zero (video may be invalid)`)
  }
}

const processVideoId = async (videoId: string): Promise<void> => {
  try {
    const info = await getBasicInfo(videoId)
    const { title: videoTitle, duration } = info

    console.log(`📄 ${videoTitle}`)
    validateDuration(duration)
    console.log(`🕓 ${formatDuration(duration)}`)

    await downloadVideoToAudio(info)
  } catch (e) {
    console.error(`❌ ${e as string}`)
    console.error('❌ Exiting.')
  }
}

const queueConsumer = async (): Promise<void> => {
  await getVideosQueue().process(async ({ data }) => {
    const { id: videoId }: { id: string } = data
    console.log(`⚡ Processing ${videoId}`)
    await processVideoId(videoId)
    console.log(`✅ Processed ${videoId}`)
    console.log()
  })
}

queueConsumer().catch(console.error)
