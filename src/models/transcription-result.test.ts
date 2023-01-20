import { mockTranscriptionResult } from './mock'
import { TranscriptionResultModel } from './transcription-result'

const mock = mockTranscriptionResult

describe(TranscriptionResultModel.modelName, () => {
  it('validates a correct object', async () => {
    await expect(TranscriptionResultModel.validate(mock())).resolves.not.toThrowError()
  })

  it('validates a correct (after trimming) object', async () => {
    await expect(TranscriptionResultModel.validate(mock({ lang: '       en      ' }))).resolves.not.toThrowError()
  })

  it('rejects empty lang', async () => {
    await expect(TranscriptionResultModel.validate(mock({ lang: '' }))).rejects.toThrowError()
  })

  it('rejects empty (after trimming) lang', async () => {
    await expect(TranscriptionResultModel.validate(mock({ lang: '                ' }))).rejects.toThrowError()
  })

  it('rejects long lang', async () => {
    await expect(TranscriptionResultModel.validate(mock({ lang: 'aaabbccccdddeeeeffffggghhhh' }))).rejects.toThrowError()
  })

  it('transforms lang when validating', async () => {
    const t = mock({ lang: '       EN      ' })
    await TranscriptionResultModel.validate(t)
    expect(t.lang).toBe('en')
  })
})
