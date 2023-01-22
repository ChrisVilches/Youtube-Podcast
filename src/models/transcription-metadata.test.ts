import { mockVideoBasicInfo } from './mock'
import { TranscriptionMetadata } from './transcription-metadata'
import { VideoBasicInfoModel } from './video-basic-info'

const mock = mockVideoBasicInfo

describe(TranscriptionMetadata.name, () => {
  describe('name', () => {
    expect(TranscriptionMetadata.name).toBe('TranscriptionMetadata')
  })

  describe('validations', () => {
    it('accepts an undefined array (and converts it to empty array)', async () => {
      const v = mock({ transcriptions: undefined })
      await expect(VideoBasicInfoModel.validate(v)).resolves.not.toThrowError()
      expect(v.transcriptions).toHaveLength(0)
      expect(v.transcriptions).toHaveProperty('length')
    })

    it('requires positive width', async () => {
      const thumbnails = [{ height: 1, width: 0, url: 'http://www.someurl.com' }]
      await expect(VideoBasicInfoModel.validate(mock({ thumbnails }))).rejects.toThrowError('Validation failed: thumbnails.width: Path `width` (0) is less than minimum allowed value (1).')
    })

    it('requires URL', async () => {
      const transcriptions = [{ lang: 'aa', name: 'x', url: '        url.jpg       ' }]
      await expect(VideoBasicInfoModel.validate(mock({ transcriptions }))).rejects.toThrowError('Validation failed: transcriptions.url: Path `url` (`url.jpg`) is shorter than the minimum allowed length (10).')
    })

    it('requires name', async () => {
      const transcriptions = [{ lang: 'aa', name: '       ', url: 'xxxxxxxxxxxxxxxxxxxxxxxxxxx' }]
      await expect(VideoBasicInfoModel.validate(mock({ transcriptions }))).rejects.toThrowError('Validation failed: transcriptions.name: Path `name` is required.')
    })
  })
})
