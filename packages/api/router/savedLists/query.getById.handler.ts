import { prisma } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TGetByIdSchema } from './query.getById.schema'
import { type ApiOutput } from '../..'

const orgSelect = {
	organization: {
		select: {
			slug: true,
			name: true,
			description: {
				select: { tsKey: { select: { key: true, ns: true, text: true } } },
			},
		},
	},
}

type SearchResultCardProps = SearchResultHasData | SearchResultLoading

type SearchResultHasData = {
	result: NonNullable<ApiOutput['organization']['searchDistance']>['orgs'][number]
	loading?: boolean
}

type SearchResultLoading = {
	loading: true
	result?: never
}

const getById = async ({
	ctx,
	input,
}: TRPCHandlerParams<TGetByIdSchema, 'protected'>): Promise<SearchResultCardProps> => {
	const list = await prisma.userSavedList.findFirst({
		where: {
			id: input.id,
			OR: [{ ownedById: ctx.session.user.id }, { sharedWith: { some: { userId: ctx.session.user.id } } }],
		},
		select: {
			id: true,
			name: true,
			_count: {
				select: {
					organizations: true,
					services: true,
				},
			},
			organizations: {
				select: orgSelect,
			},
			services: {
				select: {
					service: {
						select: {
							id: true,
							serviceName: {
								select: { tsKey: { select: { key: true, ns: true, text: true } } },
							},
							...orgSelect,
							description: {
								select: { tsKey: { select: { key: true, ns: true, text: true } } },
							},
						},
					},
				},
			},
		},
	})

	if (!list) {
		return { loading: true }
	}

	return { result: list, loading: false }
}

export default getById
