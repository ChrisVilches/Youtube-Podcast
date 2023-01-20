import { TranscriptionEntry } from './transcription-entry'
import { TranscriptionResult, TranscriptionResultModel } from './transcription-result'
import { mockTranscriptionResult } from './mock'

const mock = mockTranscriptionResult

// TODO: OK?
console.assert(TranscriptionEntry.name === 'TranscriptionEntry')

describe(TranscriptionEntry.name, () => {
  describe('validations', () => {
    it('does not allow unsorted start times', async () => {
      const t: TranscriptionResult = mock()
      t.transcription[0].start = 100
      t.transcription[1].start = 99
      await expect(TranscriptionResultModel.validate(t)).rejects.toThrowError('Validation failed: transcription: start times must be sorted')
    })

    it('requires each entry to have correct structure', async () => {
      const t: TranscriptionResult = mock()

      t.transcription[0] = {
        wrongField: 'aaa'
      } as any

      const err = 'Validation failed: transcription.duration: Path `duration` is required., transcription.start: Path `start` is required., transcription.text: Path `text` is required.'
      await expect(TranscriptionResultModel.validate(t)).rejects.toThrowError(err)
    })

    it('is required to be a valid array', async () => {
      // Note: Using mock() and then doing 't.transcription = 1234 as any' doesn't work (i.e. the promise resolves).
      //       Maybe related to how Typegoose uses reflection (mock() uses the model constructor, which
      //       may contain some class metadata).
      const t: any = {
        videoId: 'AAAAAA',
        lang: 'es',
        transcription: 1234,
        summary: undefined
      }

      const err = 'Validation failed: transcription: Cast to embedded failed for value "1234" (type number) at path "transcription" because of "ObjectParameterError"'
      await expect(TranscriptionResultModel.validate(t)).rejects.toThrowError(err)
    })
  })
})
