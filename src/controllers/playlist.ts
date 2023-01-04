import { Request, Response } from 'express'
import { getPlayList } from '../youtube/download'

// TODO: Make the output pretty.
export const showPlaylistInfoController = async (req: Request, res: Response): Promise<void> => {
  const playlist = await getPlayList(req.params.id)
  res.json(playlist.items)
}
