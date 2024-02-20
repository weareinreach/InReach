import { isIdFor, type Prisma, prisma } from '@weareinreach/db'
import { handleError } from '~api/lib/errorHandler'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TForContactInfoEditSchema } from './query.forContactInfoEdit.schema'

const whereId = (input: TForContactInfoEditSchema): Prisma.OrgEmailWhereInput => {
	switch (true) {
		case isIdFor('organization', input.parentId): {
			return { organization: { some: { organization: { id: input.parentId } } } }
		}
		case isIdFor('orgLocation', input.parentId): {
			return { locations: { some: { location: { id: input.parentId } } } }
		}
		case isIdFor('orgService', input.parentId): {
			return { services: { some: { service: { id: input.parentId } } } }
		}
		default: {
			return {}
		}
	}
}

export const forContactInfoEdit = async ({ ctx, input }: TRPCHandlerParams<TForContactInfoEditSchema>) => {
	try {
		const result = await prisma.orgEmail.findMany({
			where: {
				...whereId(input),
			},
			select: {
				id: true,
				email: true,
				primary: true,
				title: { select: { key: { select: { key: true } } } },
				description: { select: { tsKey: { select: { text: true, key: true } } } },
				locationOnly: true,
				serviceOnly: true,
				published: true,
				deleted: true,
			},
			orderBy: [{ published: 'desc' }, { deleted: 'asc' }],
		})
		const transformed = result.map(({ description, title, ...record }) => ({
			...record,
			title: title ? { key: title?.key?.key } : null,
			description: description
				? { key: description?.tsKey?.key, defaultText: description?.tsKey?.text }
				: null,
		}))
		return transformed
	} catch (error) {
		handleError(error)
	}
}

export default forContactInfoEdit
