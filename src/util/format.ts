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
]
  .map((c: string) => `\\${c}`)
  .join('')

const INVALID_CHARS_REGEX = new RegExp(`[${INVALID_CHARS}]`, 'g')

const removeInvalidChars = (s: string): string => s.replace(INVALID_CHARS_REGEX, '_')

export const cleanTitle = (title: string): string => multipleSpacesToOne(removeInvalidChars(title)).trim()

export const titleToFilename = (title: string, videoId: string, extension: string): string => {
  title = cleanTitle(title)

  if (title.length === 0) {
    return `${videoId}.${extension}`
  }

  return `${title}.${extension}`
}
