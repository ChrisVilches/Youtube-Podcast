import fs from 'fs'
import path from 'path'

export const removeFile = async (videoId: string): Promise<boolean> => {
  const dir = path.join(__dirname, '..', '..', '..', 'files', videoId)

  try {
    await fs.promises.rm(dir, { recursive: true, force: true })
    return true
  } catch {
    return false
  }
}
