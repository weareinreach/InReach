import { isIdFor, prisma, type Prisma } from '@weareinreach/db'
import { handleError } from '~api/lib/errorHandler'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TForContactInfoEditSchema } from './query.forContactInfoEdit.schema'

const whereId = (input: TForContactInfoEditSchema): Prisma.OrgWebsiteWhereInput => {
	switch (true) {
		case isIdFor('organization', input.parentId): {
			return { organization: { id: input.parentId } }
		}
		case isIdFor('orgLocation', input.parentId): {
			return { orgLocation: { id: input.parentId } }
		}

		default: {
			return {}
		}
	}
}
export const forContactInfoEdit = async ({ ctx, input }: TRPCHandlerParams<TForContactInfoEditSchema>) => {
	try {
		const result = await prisma.orgWebsite.findMany({
			where: {
				...whereId(input),
			},
			select: {
				id: true,
				url: true,
				description: { select: { tsKey: { select: { text: true, key: true } } } },
				published: true,
				deleted: true,
			},
			orderBy: [{ published: 'desc' }, { deleted: 'asc' }],
		})
		const transformed = result.map(({ description, ...record }) => ({
			...record,
			description: description ? { key: description?.tsKey.key, defaultText: description?.tsKey.text } : null,
		}))
		return transformed
	} catch (error) {
		handleError(error)
	}
}
