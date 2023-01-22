import { mockVideoBasicInfo } from './mock'
import { VideoBasicInfo, VideoBasicInfoModel } from './video-basic-info'

const mock = mockVideoBasicInfo

describe(VideoBasicInfoModel.modelName, () => {
  it('has correct name', () => {
    expect(VideoBasicInfoModel.modelName).toBe('VideoBasicInfo')
    expect(VideoBasicInfo.name).toBe('VideoBasicInfo')
  })

  describe('validations', () => {
    it('validates a correct object', async () => {
      await expect(VideoBasicInfoModel.validate(mock())).resolves.not.toThrowError()
    })

    it('requires content length (bytes)', async () => {
      await expect(VideoBasicInfoModel.validate(mock({ lengthBytes: undefined }))).rejects.toThrowError()
    })
  })

  describe('thumbnails validations', () => {
    it('validates a correct object', async () => {
      const thumbnails = [{ height: 1, width: 4, url: 'http://www.someurl.com' }]
      await expect(VideoBasicInfoModel.validate(mock({ thumbnails }))).resolves.not.toThrowError()
    })

    it('requires positive width', async () => {
      const thumbnails = [{ height: 1, width: 0, url: 'http://www.someurl.com' }]
      await expect(VideoBasicInfoModel.validate(mock({ thumbnails }))).rejects.toThrowError('Validation failed: thumbnails.width: Path `width` (0) is less than minimum allowed value (1).')
    })

    it('requires URL', async () => {
      const thumbnails = [{ height: 1, width: 6, url: '        url.jpg       ' }]

      await expect(VideoBasicInfoModel.validate(mock({ thumbnails }))).rejects.toThrowError('Validation failed: thumbnails.url: Path `url` (`url.jpg`) is shorter than the minimum allowed length (10).')
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
