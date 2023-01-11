import { parseVideoId } from './youtube-url'

describe(parseVideoId.name, () => {
  it('parses watch?v= correctly', () => {
    expect(parseVideoId('https://www.youtube.com/watch?v=LrQuTGz7bjQ&ab_channel=ColoresdeJapon')).toBe('LrQuTGz7bjQ')
    expect(parseVideoId('https://www.youtube.com/watch?someparam=1234567&v=kCPQUAtMZR4')).toBe('kCPQUAtMZR4')
    expect(parseVideoId('https://wwW.youtuBe.com/watch?v=LrQuTGz7bjQ&ab_channel=ColoresdeJapon')).toBe('LrQuTGz7bjQ')
    expect(parseVideoId('https://www.youtubE.com/wAtCh?someparam=1234567&v=kCPQUAtMZR4')).toBe('kCPQUAtMZR4')
  })

  it('parses watch?v= (without www.) correctly', () => {
    expect(parseVideoId('https://youtube.com/watch?v=LrQuTGz7bjQ&ab_channel=ColoresdeJapon')).toBe('LrQuTGz7bjQ')
    expect(parseVideoId('https://youtube.com/watch?someparam=1234567&v=kCPQUAtMZR4')).toBe('kCPQUAtMZR4')
    expect(parseVideoId('httpS://youtube.com/watcH?v=LrQuTGz7bjQ&ab_channel=ColoresdeJapon')).toBe('LrQuTGz7bjQ')
    expect(parseVideoId('https://Youtube.COM/Watch?someparam=1234567&v=kCPQUAtMZR4')).toBe('kCPQUAtMZR4')
  })

  it('parses youtu.be correctly', () => {
    expect(parseVideoId('https://youtu.be/Ntn1-SocNiY')).toBe('Ntn1-SocNiY')
    expect(parseVideoId('https://youtu.be/WIKqgE4BwAY')).toBe('WIKqgE4BwAY')
    expect(parseVideoId('httpS://youtU.be/Ntn1-SocNiY')).toBe('Ntn1-SocNiY')
    expect(parseVideoId('hTTps://yOUtu.be/WIKqgE4BwAY')).toBe('WIKqgE4BwAY')

    expect(parseVideoId('https://youtu.be/Ntn1-SocNiY?someparam=1234')).toBe('Ntn1-SocNiY')
    expect(parseVideoId('https://youtu.be/WIKqgE4BwAY?someflag')).toBe('WIKqgE4BwAY')
  })

  it('parses ID without URL', () => {
    expect(parseVideoId('aaaa')).toBe('aaaa')
    expect(parseVideoId('bAhICOkoQI_A')).toBe('bAhICOkoQI_A')
  })

  it('parses "short video" url correctly', () => {
    expect(parseVideoId('https://youtube.com/shorts/5AnWWukyr4w?feature=share')).toBe('5AnWWukyr4w')
    expect(parseVideoId('https://www.youtube.com/shorts/5YQNW09EHgc')).toBe('5YQNW09EHgc')
  })

  it('parses embed url correctly', () => {
    expect(parseVideoId('https://www.youtube.com/embed/ho8fvPH_Ro0')).toBe('ho8fvPH_Ro0')
    expect(parseVideoId('https://YOUTUBE.com/eMBED/OLB7JYl34y4')).toBe('OLB7JYl34y4')
    expect(parseVideoId('https://www.youtube.com/embed/ho8fvPH_Ro0?someparam=123')).toBe('ho8fvPH_Ro0')
    expect(parseVideoId('https://YOUTUBE.com/eMBED/OLB7JYl34y4?someflag')).toBe('OLB7JYl34y4')
  })
})
