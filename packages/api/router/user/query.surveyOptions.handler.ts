import { prisma } from '@weareinreach/db'
import { handleError } from '~api/lib/errorHandler'
import { type TRPCHandlerParams } from '~api/types/handler'

export const surveyOptions = async () => {
	try {
		const commonSelect = { id: true, tsKey: true, tsNs: true }

		const [immigration, sog, ethnicity, community, countries] = await Promise.all([
			prisma.userImmigration.findMany({
				select: {
					...commonSelect,
					status: true,
				},
				orderBy: {
					status: 'asc',
				},
			}),
			prisma.userSOGIdentity.findMany({
				select: {
					...commonSelect,
					identifyAs: true,
				},
				orderBy: {
					identifyAs: 'asc',
				},
			}),
			prisma.userEthnicity.findMany({
				select: {
					...commonSelect,
					ethnicity: true,
				},
				orderBy: {
					ethnicity: 'asc',
				},
			}),
			prisma.userCommunity.findMany({
				select: {
					...commonSelect,
					community: true,
				},
				orderBy: {
					community: 'asc',
				},
			}),
			prisma.country.findMany({
				select: {
					...commonSelect,
					cca2: true,
				},
				orderBy: {
					name: 'asc',
				},
			}),
		])

		return { community, countries, ethnicity, immigration, sog }
	} catch (error) {
		handleError(error)
	}
}
