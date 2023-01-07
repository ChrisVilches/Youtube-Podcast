const replaceSlash = (s: string): string => s.replace(/\//g, ' ')

export const cleanTitle = (title: string): string => replaceSlash(title)
