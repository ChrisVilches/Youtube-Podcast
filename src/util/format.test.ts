import { cleanTitle, formatDuration, titleToFilename } from './format'

describe(formatDuration.name, () => {
  it('formats the duration correctly', () => {
    expect(formatDuration(0)).toBe('00:00:00')
    expect(formatDuration(59)).toBe('00:00:59')
    expect(formatDuration(60)).toBe('00:01:00')
    expect(formatDuration(60 * 60 - 1)).toBe('00:59:59')
    expect(formatDuration(60 * 60)).toBe('01:00:00')
  })

  it('formats NaN/Infinity correctly', () => {
    expect(formatDuration(NaN)).toBe('N/A')
    expect(formatDuration(Infinity)).toBe('N/A')
  })
})

describe(cleanTitle.name, () => {
  it('cleans the title correctly', () => {
    expect(cleanTitle('some/title/with/slashes')).toBe('some title with slashes')
    expect(cleanTitle('  title with    many spaces  ')).toBe('title with many spaces')
    expect(cleanTitle('title with many spaces  ')).toBe('title with many spaces')
    expect(cleanTitle('  title with   many  / spaces   and   / / / / / / slashes')).toBe('title with many spaces and slashes')
  })
})

describe(titleToFilename.name, () => {
  it('computes the correct filename', () => {
    expect(titleToFilename(' my  / video', 'DB5W6qg_1Dx', 'm4a')).toBe('my video.m4a')
  })

  it('handles empty title (after cleaning) correctly', () => {
    expect(titleToFilename('  / / ///  /    //', 'DB5W6qg_1Dx', 'm4a')).toBe('DB5W6qg_1Dx.m4a')
  })

  it('removes single quotes', () => {
    expect(titleToFilename("this is a 'file'", 'DB5W6qg_1Dx', 'm4a')).toBe('this is a file.m4a')
    expect(titleToFilename(" '' '''  ''", 'DB5W6qg_1Dx', 'm4a')).toBe('DB5W6qg_1Dx.m4a')
  })
})
