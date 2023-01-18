export const formatDuration = (seconds: number): string => {
  if (isNaN(seconds) || !isFinite(seconds)) {
    return 'N/A'
  }

  return new Date(seconds * 1000).toISOString().slice(11, 19)
}

const removeSingleQuotes = (s: string): string => s.replace(/'/g, '')
const replaceSlash = (s: string): string => s.replace(/\//g, ' ')
const multipleSpacesToOne = (s: string): string => s.replace(/\s+/g, ' ')

export const cleanTitle = (title: string): string => multipleSpacesToOne(replaceSlash(removeSingleQuotes(title))).trim()

export const titleToFilename = (title: string, videoId: string, extension: string): string => {
  title = cleanTitle(title)

  if (title.length === 0) {
    return `${videoId}.${extension}`
  }

  return `${title}.${extension}`
}
