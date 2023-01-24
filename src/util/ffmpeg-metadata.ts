import { VideoBasicInfo, VideoBasicInfoModel } from '../models/video-basic-info'
import { downloadFile } from './download-file'
import { urlWithoutQueryString } from './youtube-url'
import ffmpeg from 'fluent-ffmpeg'
import { open, readFile } from 'fs/promises'
import { statSync, unlinkSync } from 'node:fs'
import crypto from 'crypto'

const safeMetadata = (field: string, value: string): string => `${field}=${value.replace(/"/g, String.raw`\"`)}`

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
  const stats = statSync(tmpFilePath)
  const fileSizeInBytes = stats.size
  return fileSizeInBytes / (1024 * 1024)
}

export const m4aAddMetadata = async (videoId: string, fileContent: Buffer): Promise<Buffer> => {
  const tmpUUID: string = crypto.randomUUID()

  const metadata: VideoBasicInfo = await VideoBasicInfoModel.findOne({ videoId }) as VideoBasicInfo
  const thumbnailPath: string = `/tmp/yt-${tmpUUID}-${videoId}_thumbnail.jpg`
  const tmpFilePath = `/tmp/yt-${tmpUUID}-${videoId}`
  const tmpFileResultPath = tmpFilePath + '.m4a'
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
      .outputOption('-disposition:0', 'attached_pic')
      .on('end', () => {
        readFile(tmpFileResultPath)
          .then((buffer: Buffer) => {
            console.log(`After adding metadata ${fileSizeMB(tmpFileResultPath)} MB`)
            // TODO: Does it remove all tmp files correctly????
            unlinkSync(tmpFilePath)
            unlinkSync(thumbnailPath)
            unlinkSync(tmpFileResultPath)
            resolve(buffer)
          })
          .catch(reject)
      })
      .on('error', reject)
      // TODO: I think it only works with the .m4a, but it should work without it as well. Why?
      // TODO: I want to try adding a suffix like "_result" instead of "m4a" in order to avoid
      //       hardcoding extensions.
      .save(tmpFileResultPath)
  })
}
