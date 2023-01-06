import { Request, Response } from 'express'
import { getVideosQueue } from '../queues/getVideosQueue'
import { getPlayList } from '../youtube/scraping'

export const showPlaylistInfoController = async (req: Request, res: Response): Promise<void> => {
  const playlist = await getPlayList(req.params.id)
  res.json(playlist)
}

export const playlistPrepareAllController = async (req: Request, res: Response): Promise<void> => {
  const playlist = await getPlayList(req.params.id)
  const ids = playlist.items.map((item: any) => item.id)

  for (const id of ids) {
    await getVideosQueue().add({ id })
  }
  res.json(ids)
}
