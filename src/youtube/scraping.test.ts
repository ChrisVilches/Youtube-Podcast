import { channelIdFromUsernameNonCached } from './scraping'

describe(channelIdFromUsernameNonCached.name, () => {
  it('gets the channel ID correctly', async () => {
    expect(await channelIdFromUsernameNonCached('Platzi')).toBe('UC55-mxUj5Nj3niXFReG44OQ')
    expect(await channelIdFromUsernameNonCached('ruriohama')).toBe('UCKtiMrNZq0gGbPTnsMu7Bsw')
  })

  it('throws error if the channel does not exist', async () => {
    await expect(channelIdFromUsernameNonCached('asdioajdioasjdoias')).rejects.toThrowError('Could not parse channel @asdioajdioasjdoias')
  })
})
