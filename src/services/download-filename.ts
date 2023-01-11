import { titleToFilename } from '../util/format'
import { videoOriginalTitle } from './storage/persisted-files'

export const videoToFileName = async (videoId: string, extension: string): Promise<string> => {
  const originalTitle = await videoOriginalTitle(videoId)
  return titleToFilename(originalTitle, videoId, extension)
}
