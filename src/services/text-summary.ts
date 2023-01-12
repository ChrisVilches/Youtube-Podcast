// TODO: Implement this correctly
//       I think this doesn't need to be cached (the caller caches it)
export const summarizeText = async (text: string, lang: string): Promise<string | undefined> => {
  return `(DUMMY, must implement) This is some random summary (lang = ${lang}). Text has ${text.length} characters ${Math.random()}`
}
