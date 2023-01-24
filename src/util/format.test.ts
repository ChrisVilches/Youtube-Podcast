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
    expect(cleanTitle('some/title/with/slashes')).toBe('some_title_with_slashes')
    expect(cleanTitle('  title with    many spaces  ')).toBe('title with many spaces')
    expect(cleanTitle('  some\\title  ')).toBe('some_title')
    expect(cleanTitle('title with many spaces  ')).toBe('title with many spaces')
    expect(cleanTitle('  title with   many  / spaces   and   / / / / / / slashes')).toBe('title with many _ spaces and _ _ _ _ _ _ slashes')
    expect(cleanTitle("  my height is 5'10\"")).toBe('my height is 5_10_')
    expect(cleanTitle('モーニング娘。_14 『What is LOVE_』 (MV)')).toBe('モーニング娘。_14 『What is LOVE_』 (MV)')
  })
})

describe(titleToFilename.name, () => {
  it('computes the correct filename', () => {
    expect(titleToFilename(' my  / video', 'DB5W6qg_1Dx', 'm4a')).toBe('my _ video.m4a')
    expect(titleToFilename('  / / ///  /    //', 'DB5W6qg_1Dx', 'm4a')).toBe('_ _ ___ _ __.m4a')
    expect(titleToFilename('      ', 'DB5W6qg_1Dx', 'm4a')).toBe('DB5W6qg_1Dx.m4a')
  })

  it('removes single quotes and other symbols', () => {
    expect(titleToFilename("this is a 'file'", 'DB5W6qg_1Dx', 'm4a')).toBe('this is a _file_.m4a')
    expect(titleToFilename('this is/a %file?', 'DB5W6qg_1Dx', 'm4a')).toBe('this is_a _file_.m4a')
    expect(titleToFilename(" '' '''  ''", 'DB5W6qg_1Dx', 'm4a')).toBe('__ ___ __.m4a')
  })
})
