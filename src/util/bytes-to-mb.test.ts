import { bytesToMb } from './bytes-to-mb'

describe(bytesToMb.name, () => {
  it('converts bytes to MB correctly', () => {
    expect(bytesToMb(12345)).toBe(0.012345)
    expect(bytesToMb(0)).toBe(0)
  })
})
