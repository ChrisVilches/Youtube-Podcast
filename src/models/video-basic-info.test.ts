import { VideoBasicInfo, VideoBasicInfoModel } from './video-basic-info'

const mock = (args: any = {}): VideoBasicInfo => new VideoBasicInfoModel(Object.assign({
  videoId: 'AAAAAA',
  title: 'some title',
  duration: 1000,
  description: 'some description',
  lengthBytes: 1000,
  thumbnails: [],
  transcriptions: []
}, args))

describe(VideoBasicInfoModel.modelName, () => {
  describe('validations', () => {
    it('validates a correct object', async () => {
      await expect(VideoBasicInfoModel.validate(mock())).resolves.not.toThrowError()
    })

    it('requires content length (bytes)', async () => {
      await expect(VideoBasicInfoModel.validate(mock({ lengthBytes: undefined }))).rejects.toThrowError()
    })
  })

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
