import { VideoModel } from '../models/Video'
import { VideoBasicInfo } from '../youtube/VideoBasicInfo'

export const upsertBasicInfo = async (videoId: string, metadata: VideoBasicInfo): Promise<void> => {
  await VideoModel.updateOne({ videoId }, { metadata }, { upsert: true })
}
