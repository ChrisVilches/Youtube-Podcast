// TODO: Implement this test.

import { VideoBasicInfo, VideoBasicInfoModel } from './video-basic-info'

const mock = (args: any = {}): VideoBasicInfo => new VideoBasicInfoModel(Object.assign({
  videoId: 'AAAAAA',
  title: 'some title',
  duration: 1000,
  description: 'description',
  lengthBytes: 1000,
  thumbnails: []
}, args))

describe(VideoBasicInfoModel.name, () => {
  describe(VideoBasicInfoModel.prototype.validateCanDownload.name, () => {
    it('validates a correct object', () => {
      expect(() => mock().validateCanDownload()).not.toThrowError()
    })

    it('validates duration correctly', () => {
      expect(() => mock({ duration: 10000000 }).validateCanDownload()).toThrowError()
      expect(() => mock({ duration: 0 }).validateCanDownload()).toThrowError()
      expect(() => mock({ duration: -1 }).validateCanDownload()).toThrowError()
    })

    it('validates content length correctly', () => {
      expect(() => mock({ lengthBytes: undefined }).validateCanDownload()).toThrowError()
      expect(() => mock({ lengthBytes: 0 }).validateCanDownload()).toThrowError()
      expect(() => mock({ lengthBytes: -1 }).validateCanDownload()).toThrowError()
    })
  })
})
