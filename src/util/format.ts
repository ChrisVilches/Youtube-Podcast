export const formatDuration = (seconds: number): string => {
  if (isNaN(seconds) || !isFinite(seconds)) {
    return 'N/A'
  }

  return new Date(seconds * 1000).toISOString().slice(11, 19)
}

const multipleSpacesToOne = (s: string): string => s.replace(/\s+/g, ' ')

const INVALID_CHARS = [
  '/',
  '\\',
  '?',
  '%',
  '*',
  ':',
  '|',
  '"',
  '<',
  '>',
  '.',
  ',',
  ';',
  '=',
  "'"
].map((c: string) => new RegExp(`\\${c}`, 'g'))

const removeInvalidChars = (s: string): string => {
  let result = s

  for (const regex of INVALID_CHARS) {
    result = result.replace(regex, '_')
  }

  return result
}

export const cleanTitle = (title: string): string => multipleSpacesToOne(removeInvalidChars(title)).trim()

export const titleToFilename = (title: string, videoId: string, extension: string): string => {
  title = cleanTitle(title)

  if (title.length === 0) {
    return `${videoId}.${extension}`
  }

  return `${title}.${extension}`
}
