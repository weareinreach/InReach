import { prisma } from '@weareinreach/db'
import { handleError } from '~api/lib/errorHandler'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TGetAttributesSchema } from './query.getAttributes.schema'

const getAttributesFromDb = async (input: TGetAttributesSchema) => {
	const { id, slug, category, includeUnsupported } = input
	const orgId =
		id ?? (await prisma.organization.findUniqueOrThrow({ where: { slug }, select: { id: true } })).id
	const result = await prisma.organizationAttribute.findMany({
		where: {
			attribute: {
				active: true,
				...(!includeUnsupported ? { tag: { not: 'incompatible-info' } } : {}),
				categories: { some: { category: { active: true, tag: category } } },
			},
			organization: { id: orgId },
			active: true,
		},
		select: {
			attribute: {
				select: {
					id: true,
					tag: true,
					icon: true,
					iconBg: true,
					tsKey: true,
					tsNs: true,
					categories: {
						select: { category: { select: { id: true, tag: true, icon: true, renderVariant: true } } },
					},
				},
			},
			supplement: {
				where: { active: true },
				select: {
					id: true,
					data: true,
					boolean: true,
					text: { select: { key: true, ns: true, tsKey: { select: { text: true } } } },
					country: { select: { cca2: true, id: true, tsKey: true, tsNs: true } },
					govDist: { select: { abbrev: true, id: true, tsKey: true, tsNs: true } },
					language: { select: { id: true, languageName: true, nativeName: true } },
				},
			},
		},
	})
	const flattened = result.flatMap(({ attribute, supplement }) => {
		const { categories, ...attributeData } = attribute
		return categories.map(({ category }) => ({
			categoryId: category.id,
			categoryTag: category.tag,
			categoryIcon: category.icon,
			categoryRenderVariant: category.renderVariant,
			...attributeData,
			supplement,
		}))
	})
	return flattened
}
type DatabaseResult = Awaited<ReturnType<typeof getAttributesFromDb>>
type SingleResult = DatabaseResult[number]
type GroupedResult = {
	id: SingleResult['categoryId']
	tag: SingleResult['categoryTag']
	icon: SingleResult['categoryIcon']
	renderVariant: SingleResult['categoryRenderVariant']
	attributes: Omit<SingleResult, 'categoryId' | 'categoryIcon' | 'categoryTag' | 'categoryRenderVariant'>[]
}

const groupByCategory = (result: DatabaseResult) => {
	const grouped = result.reduce<GroupedResult[]>((prev, curr) => {
		const { categoryIcon, categoryId, categoryTag, categoryRenderVariant, ...attribute } = curr
		const existingIdx = prev.findIndex(({ id }) => id === categoryId)
		if (existingIdx < 0) {
			return [
				...prev,
				{
					id: curr.categoryId,
					tag: curr.categoryTag,
					icon: curr.categoryIcon,
					renderVariant: curr.categoryRenderVariant,
					attributes: [{ ...attribute }],
				},
			]
		}
		prev[existingIdx]?.attributes.push(attribute)
		return prev
	}, [])
	return grouped
}

export const getAttributes = async ({ input }: TRPCHandlerParams<TGetAttributesSchema>) => {
	try {
		const dbResult = await getAttributesFromDb(input)
		const formattedResult = groupByCategory(dbResult)
		return formattedResult
	} catch (error) {
		handleError(error)
	}
}
