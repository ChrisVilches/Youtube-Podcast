import { mockVideoBasicInfo } from './mock'
import { Thumbnail } from './thumbnail'
import { VideoBasicInfoModel } from './video-basic-info'

const mock = mockVideoBasicInfo

describe(Thumbnail.name, () => {
  describe('validations', () => {
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
})
