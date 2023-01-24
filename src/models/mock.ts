import { TranscriptionResult, TranscriptionResultModel } from './transcription-result'
import { VideoBasicInfo, VideoBasicInfoModel } from './video-basic-info'

export const mockVideoBasicInfo = (args: any = {}): VideoBasicInfo => new VideoBasicInfoModel(Object.assign({
  videoId: 'AAAAAA',
  title: 'some title',
  author: 'the-author',
  duration: 1000,
  description: 'some description',
  lengthBytes: 1000,
  thumbnails: [],
  transcriptions: []
}, args))

export const mockTranscriptionResult = (args: any = {}): TranscriptionResult => new TranscriptionResultModel(Object.assign({
  videoId: 'AAAAAA',
  lang: 'es',
  transcription: [
    { text: 'some text', start: 23, duration: 5 },
    { text: 'another text', start: 45, duration: 7 }
  ],
  summary: undefined
}, args))
