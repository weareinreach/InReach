export interface StoryEntry {
	id: string
	title: string
	name: string
	type: string
}

export const fetchStories = async (url: string): Promise<StoryEntry[]> => {
	const res = await fetch(`${url}/index.json`)
	if (!res.ok) {
		throw new Error(`Failed to fetch index.json from ${url}: ${res.status} ${res.statusText}`)
	}
	const data = (await res.json()) as { entries: Record<string, StoryEntry> }
	return Object.values(data.entries).filter((entry) => entry.type === 'story')
}

export const sharedStoryIds = (
	baseStories: StoryEntry[],
	compareStories: StoryEntry[],
	filter: string | null
) => {
	const baseIds = new Set(baseStories.map((s) => s.id))
	const compareById = new Map(compareStories.map((s) => [s.id, s]))
	const compareIds = new Set(compareById.keys())

	let sharedIds = [...compareIds].filter((id) => baseIds.has(id)).sort()
	if (filter) {
		const needle = filter.toLowerCase()
		sharedIds = sharedIds.filter((id) => compareById.get(id)?.title.toLowerCase().includes(needle))
	}
	const onlyInCompare = [...compareIds].filter((id) => !baseIds.has(id)).sort()
	const onlyInBase = [...baseIds].filter((id) => !compareIds.has(id)).sort()

	return { sharedIds, onlyInCompare, onlyInBase, compareById }
}
