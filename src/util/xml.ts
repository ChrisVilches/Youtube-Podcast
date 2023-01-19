import { ValidationError, X2jOptionsOptional, XMLParser, XMLValidator } from 'fast-xml-parser'
import { decode } from 'he'
import { TranscriptionEntry } from '../models/transcription-result'

const XML_OPTIONS: X2jOptionsOptional = {
  preserveOrder: true,
  ignoreAttributes: false,
  trimValues: true
}

const parser = new XMLParser(XML_OPTIONS)

export const validateXml = (xml: string): void => {
  const result: true | ValidationError = XMLValidator.validate(xml)

  if (typeof result === 'boolean' && result) {
    return
  }

  throw new Error(result.err.msg)
}

export const xmlTranscriptionToJson = (xml: string): TranscriptionEntry[] => {
  xml = xml.trim()
  validateXml(xml)

  const clean: TranscriptionEntry[] = []

  try {
    const obj = parser.parse(xml)[1].transcript

    for (const o of obj) {
      if (o.text.length === 0) {
        continue
      }

      const text: string = decode(o.text[0]['#text'])
      const start: number = Number(o[':@']['@_start'])
      const duration: number = Number(o[':@']['@_start'])

      clean.push({
        text,
        start,
        duration
      })
    }
  } catch {
    throw new Error('XML string cannot be converted to transcription entries')
  }

  return clean
}
