import { mockUserChannel } from './mock'
import { UserChannelModel } from './user-channel'

const mock = mockUserChannel

describe(UserChannelModel.modelName, () => {
  it('validates a correct object', async () => {
    await expect(UserChannelModel.validate(mock())).resolves.not.toThrowError()
  })

  it('rejects empty (after trimming strings)', async () => {
    await expect(UserChannelModel.validate(mock({ username: '             ' }))).rejects.toThrowError()
    await expect(UserChannelModel.validate(mock({ channelId: '             ' }))).rejects.toThrowError()
  })

  it('transforms strings when validating', async () => {
    const t = mock({ username: '       Some-User      ', channelId: '  XxxYyyyZzzz   ' })
    await UserChannelModel.validate(t)
    expect(t.username).toBe('some-user')
    expect(t.channelId).toBe('XxxYyyyZzzz')
  })
})
