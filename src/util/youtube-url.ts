import { parse } from 'node:url'

const getVideoIdFromWatch = (url: string): string | undefined => {
  const u = new URL(url)
  const query = new URLSearchParams(u.search)
  return query.get('v')?.trim()
}

const getVideoIdFromShareUrl = (url: string): string | undefined => {
  const u = new URL(url)
  const videoId = u.pathname.split('/').find(s => s.length > 0)
  return videoId?.trim()
}

const getVideoIdFromShortsEmbedUrl = (url: string): string | undefined => {
  const u = new URL(url)
  const path = u.pathname.split('/').filter(s => s.length > 0)
  return path.at(1)?.trim()
}

const WATCH_URL_REGEX = /^https:\/\/(www\.)?youtube\.com\/watch\?/i
const SHARE_URL_REGEX = /^https:\/\/youtu\.be\//i
const SHORTS_EMBED_URL_REGEX = /^https:\/\/(www\.)?youtube\.com\/(embed|shorts)\//i

export const parseVideoId = (str?: string): string | undefined => {
  if (typeof str === 'undefined') {
    return undefined
  }

  str = str.trim()

  if (str.match(WATCH_URL_REGEX) !== null) {
    return getVideoIdFromWatch(str)
  }

  if (str.match(SHARE_URL_REGEX) !== null) {
    return getVideoIdFromShareUrl(str)
  }

  if (str.match(SHORTS_EMBED_URL_REGEX) !== null) {
    return getVideoIdFromShortsEmbedUrl(str)
  }

  if (str.length > 0) {
    return str
  }

  return undefined
}

export const urlWithoutQueryString = (url: string): string => {
  const u = parse(url)
  if (u.protocol === null || u.host === null || u.pathname === null) {
    throw new Error(`Invalid URL: ${url}`)
  }

  return `${u.protocol}//${u.host}${u.pathname}`
}
