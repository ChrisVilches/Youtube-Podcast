import { VideoBasicInfo, VideoBasicInfoModel } from '../models/video-basic-info'
import { downloadFile } from './download-file'
import { urlWithoutQueryString } from './youtube-url'
import ffmpeg from 'fluent-ffmpeg'
import { open } from 'fs/promises'
import { statSync, unlinkSync, readFileSync } from 'node:fs'
import crypto from 'crypto'

const FILE_METADATA_ALBUM_NAME = 'Youtube Podcast'

const safeMetadata = (field: string, value: string): string => `${field}=${value}`

const isJpgExtension = (url: string): boolean => url.toLowerCase().endsWith('.jpg') || url.toLowerCase().endsWith('.jpeg')

/**
 * Some things that were found while reverse-engineering. These findings may become obsolete in the future (or even now, since
 * there's no guarantee all cases behave like this).
 *
 * Some URLs end with .webp, but ffmpeg can't process them, so they must be discarded.
 * URLs that end with .jpg, but have a query string are actually .webp (the .jpg extension doesn't match the actual content).
 * When removing the query string from any of these .jpg URLs, the content becomes an actual .jpg file, which is what we must use.
 * (ffmpeg needs a JPG image.)
 *
 * It's assumed that all videos have at least one valid .jpg file (must monitor this).
 *
 * When attaching the file using ffmpeg, it's not necessary that the file has the .jpg extension.
 */
const getValidJPGThumbnailURL = (metadata: VideoBasicInfo): string => {
  const availableThumbnailUrls = metadata.thumbnails
    .map(t => urlWithoutQueryString(t.url))
    .filter(isJpgExtension)

  const thumbnailUrl: string = availableThumbnailUrls[0]
  console.assert(typeof thumbnailUrl === 'string' && thumbnailUrl.length > 0)
  return thumbnailUrl
}

const fileSizeMB = (filepath: string): number => {
  const stats = statSync(filepath)
  const fileSizeInBytes = stats.size
  return fileSizeInBytes / (1024 * 1024)
}

const M4A_FORMAT = 'ipod'

export const m4aAddMetadata = async (videoId: string, fileContent: Buffer): Promise<Buffer> => {
  const tmpUUID: string = crypto.randomUUID()

  const tmpPrefix = `/tmp/yt-${tmpUUID}-`
  const createTmpFilePath = (path: string): string => `${tmpPrefix}${path}`

  const metadata: VideoBasicInfo = await VideoBasicInfoModel.findOne({ videoId }) as VideoBasicInfo

  const thumbnailPath: string = createTmpFilePath(`${videoId}_thumbnail`)
  const tmpFilePath = createTmpFilePath(videoId)
  const tmpFileResultPath = createTmpFilePath(`${videoId}_with_metadata`)

  await downloadFile(getValidJPGThumbnailURL(metadata), thumbnailPath)

  const fileHandle = await open(tmpFilePath, 'w')
  await fileHandle.write(fileContent)
  await fileHandle.close()
  console.log(`Before adding metadata ${fileSizeMB(tmpFilePath)} MB`)

  return await new Promise<Buffer>((resolve, reject) => {
    ffmpeg()
      .input(tmpFilePath)
      .input(thumbnailPath)
      .outputOption('-c', 'copy')
      .outputOption('-map', '1')
      .outputOption('-map', '0')
      .outputOption('-metadata', safeMetadata('artist', metadata.author ?? 'Unknown artist'))
      .outputOption('-metadata', safeMetadata('title', metadata.title))
      .outputOption('-metadata', safeMetadata('album', FILE_METADATA_ALBUM_NAME))
      .outputOption('-disposition:0', 'attached_pic')
      .outputOption('-f', M4A_FORMAT)
      .save(tmpFileResultPath)
      .on('end', () => {
        try {
          const buffer = readFileSync(tmpFileResultPath)
          console.log(`After adding metadata ${fileSizeMB(tmpFileResultPath)} MB`)
          unlinkSync(tmpFilePath)
          unlinkSync(thumbnailPath)
          unlinkSync(tmpFileResultPath)
          resolve(buffer)
        } catch (e) {
          reject(e)
        }
      })
      .on('error', reject)
  })
}
