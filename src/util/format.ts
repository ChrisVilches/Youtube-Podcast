export const formatDuration = (seconds: number): string => {
  if (isNaN(seconds)) {
    return 'N/A'
  }

  return new Date(seconds * 1000).toISOString().slice(11, 19)
}

const replaceSlash = (s: string): string => s.replace(/\//g, ' ')

export const cleanTitle = (title: string): string => replaceSlash(title)
