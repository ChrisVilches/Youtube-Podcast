import { channelIdFromUsername } from './scraping'

describe(channelIdFromUsername.name, () => {
  it('gets the channel ID correctly', async () => {
    expect(await channelIdFromUsername('Platzi')).toBe('UC55-mxUj5Nj3niXFReG44OQ')
    expect(await channelIdFromUsername('ruriohama')).toBe('UCKtiMrNZq0gGbPTnsMu7Bsw')
  })

  it('throws error if the channel does not exist', async () => {
    await expect(channelIdFromUsername('asdioajdioasjdoias')).rejects.toThrowError('Could not parse channel @asdioajdioasjdoias')
  })
})
