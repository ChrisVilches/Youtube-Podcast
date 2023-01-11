import { Innertube, UniversalCache } from 'youtubei.js'

let innertube: Innertube | null = null

export async function getInnertube (): Promise<Innertube> {
  innertube ??= await Innertube.create({ cache: new UniversalCache() })
  return innertube
}
