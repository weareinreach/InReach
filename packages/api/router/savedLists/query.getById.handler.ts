import { prisma } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

import {
	type TGetByIdInputSchema,
	type TGetByIdResponseSchema,
	ZGetByIdInputSchema,
	ZGetByIdResponseSchema,
} from './query.getById.schema'

const orgSelect = {
	organization: {
		select: {
			id: true,
			slug: true,
			name: true,
			description: { select: { tsKey: { select: { key: true, ns: true, text: true } } } },
			// locations: true,
			// orgLeader: true,
			// orgFocus: true,
			// serviceCategories: true,
			// national: true,
		},
	},
}

const getById = async ({
	ctx,
	input,
}: TRPCHandlerParams<TGetByIdInputSchema, 'protected'>): Promise<TGetByIdResponseSchema> => {
	const list = await prisma.userSavedList.findFirst({
		where: {
			id: input?.id ?? '',
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
			updatedAt: true,
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
							// ...orgSelect,
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
		// throw new Error('List not found')
		return ZGetByIdResponseSchema.parse({})
	}

	const reformattedData = {
		id: list.id,
		name: list.name,
		_count: list._count,
		updatedAt: list.updatedAt,
		organizations: list.organizations,
		services: list.services,
	}

	return ZGetByIdResponseSchema.parse(reformattedData) // Validate the result with Zod schema
}

export default getById
