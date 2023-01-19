interface DownloadResponse {
  canDownload: boolean
  progress: number
}

export const createDownloadResponse = (canDownload: boolean, progress: number): DownloadResponse => ({ canDownload, progress })
