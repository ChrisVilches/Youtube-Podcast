import { ValidationError, X2jOptionsOptional, XMLParser, XMLValidator } from 'fast-xml-parser'
import { decode } from 'he'
import { TranscriptionEntry } from '../models/transcription-entry'

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

      const entry = new TranscriptionEntry()
      entry.text = decode(o.text[0]['#text'])
      entry.start = Number(o[':@']['@_start'])
      entry.duration = Number(o[':@']['@_start'])
      clean.push(entry)
    }
  } catch {
    throw new Error('XML string cannot be converted to transcription entries')
  }

  return clean
}
