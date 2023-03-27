import { Prisma } from '@weareinreach/db'

const serviceSome = (ids: string[]) => ({ services: { some: { tagId: { in: ids } } } })
const attribSome = (ids: string[]) => ({ attributes: { some: { attributeId: { in: ids } } } })

export const serviceFilter = (ids?: string[]): Prisma.OrganizationWhereInput | undefined =>
	ids?.length
		? {
				OR: [
					{ services: { some: serviceSome(ids) } },
					{ locations: { some: { services: { some: { service: serviceSome(ids) } } } } },
				],
		  }
		: undefined

export const attributeFilter = (ids?: string[]): Prisma.OrganizationWhereInput | undefined =>
	ids?.length
		? {
				OR: [
					attribSome(ids),
					{ locations: { some: attribSome(ids) } },
					{ services: { some: attribSome(ids) } },
				],
		  }
		: undefined
