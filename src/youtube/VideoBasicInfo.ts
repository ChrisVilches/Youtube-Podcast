import Thumbnail from 'youtubei.js/dist/src/parser/classes/misc/Thumbnail'

export interface VideoBasicInfo {
  id: string
  title: string
  duration: number
  description: string
  lengthBytes?: number
  thumbnails: Thumbnail[]
}

const validateDuration = (duration: number): void => {
  if (duration > Number(process.env.MAX_VIDEO_LENGTH_SECONDS)) {
    throw new Error(`Video is too long (${duration} seconds)`)
  }

  if (typeof duration !== 'number' || duration === 0 || isNaN(duration)) {
    throw new Error(`Duration is ${duration}, but must be a number greater than zero (video may be invalid)`)
  }
}

const validateLengthBytes = (lengthBytes?: number): void => {
  if ((lengthBytes ?? 0) <= 0) {
    throw new Error('Content length (bytes) cannot be zero (video may be invalid)')
  }
}

export const validateVideoBasicInfo = ({ duration, lengthBytes }: VideoBasicInfo): void => {
  validateDuration(duration)
  validateLengthBytes(lengthBytes)
}
