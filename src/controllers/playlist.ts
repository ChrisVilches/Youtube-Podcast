import { Request, Response } from 'express'
import { addVideoJob } from '../queues/addVideoJob'
import { videoExists } from '../services/storage/minioUpload'
import { getProgress } from '../services/videoProgress'
import { getPlayList } from '../youtube/scraping'

export const showPlaylistInfoController = async (req: Request, res: Response): Promise<void> => {
  const playlist = await getPlayList(req.params.id)
  res.json(playlist)
}

export const playlistPrepareAllController = async (req: Request, res: Response): Promise<void> => {
  const playlist = await getPlayList(req.params.id)
  const ids = playlist.items.map((item: any) => item.id)

  const result: any = {}

  for (const id of ids) {
    if (await videoExists(id)) {
      result[id] = 'file is already downloaded'
      continue
    }

    await addVideoJob(id)
    const progress: number | null = await getProgress(id)
    result[id] = `downloading (${progress ?? 0}%)`
  }

  res.json(result)
}
