import { prisma } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TForSuggestionTableSchema } from './query.forSuggestionTable.schema'

// 1. Flatten the interface to match your exact flat JSON database row
interface SuggestionDataBlob {
	countryId?: string | null
	orgAddress?: string | null
	orgWebsite?: string | null
	communityFocus?: string[] | null
	serviceCategories?: string[] | null
}

const forSuggestionTable = async (_params: TRPCHandlerParams<TForSuggestionTableSchema>) => {
	const suggestions = await prisma.suggestion.findMany({
		select: {
			id: true,
			data: true,
			organization: {
				select: {
					id: true,
					name: true,
					slug: true,
				},
			},
			suggestedBy: {
				select: {
					id: true,
					name: true,
					email: true,
				},
			},
			createdAt: true,
			updatedAt: true,
			handled: true,
			suggestedById: true,
		},
		orderBy: [{ createdAt: 'desc' }],
	})

	const countryIds = new Set<string>()
	const attributeIds = new Set<string>()

	suggestions.forEach((sug) => {
		// 2. Direct cast to the flat structure (removing the `.json` accessor)
		const blob = sug.data as unknown as SuggestionDataBlob
		if (blob?.countryId) countryIds.add(blob.countryId)
		if (Array.isArray(blob?.communityFocus)) {
			blob.communityFocus.forEach((id) => {
				if (id) attributeIds.add(id)
			})
		}
	})

	const [countries, attributes] = await Promise.all([
		prisma.country.findMany({
			where: { id: { in: Array.from(countryIds) } },
			select: { id: true, name: true },
		}),
		prisma.attribute.findMany({
			where: { id: { in: Array.from(attributeIds) } },
			select: { id: true, name: true },
		}),
	])

	const countryMap = new Map(countries.map((c) => [c.id, c.name]))
	const attributeMap = new Map(attributes.map((a) => [a.id, a.name]))

	return suggestions.map((sug) => {
		// 3. Direct cast here as well
		const blob = sug.data as unknown as SuggestionDataBlob
		const resolvedCountry = blob?.countryId ? countryMap.get(blob.countryId) : null

		const resolvedAttributes = Array.isArray(blob?.communityFocus)
			? (blob.communityFocus.map((id) => attributeMap.get(id)).filter(Boolean) as string[])
			: []

		return {
			...sug,
			orgWebsite: blob?.orgWebsite || null,
			orgAddress: blob?.orgAddress ?? '',
			countryName: resolvedCountry ?? '',
			attributeNames: resolvedAttributes,
		}
	})
}

export default forSuggestionTable
