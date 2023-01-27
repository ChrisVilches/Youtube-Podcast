import { getType } from 'mime'

export const FILE_DOWNLOAD_EXTENSION = 'm4a'
const DEFAULT_CONTENT_TYPE = 'application/octet-stream'
export const FILE_CONTENT_TYPE = getType(FILE_DOWNLOAD_EXTENSION) ?? DEFAULT_CONTENT_TYPE
