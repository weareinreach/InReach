import mapObjectVals from 'just-map-values'

import { prisma } from '@weareinreach/db'
import { transformer } from '~api/lib/transformer'
import { globalSelect, globalWhere } from '~api/selects/global'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TForServiceDrawerSchema } from './query.forServiceDrawer.schema'
import { select } from './selects'

export const forServiceDrawer = async ({ input }: TRPCHandlerParams<TForServiceDrawerSchema>) => {
	const results = await prisma.orgService.findMany({
		where: input,
		select: {
			id: true,
			attributes: {
				where: { active: true, attribute: globalWhere.attributesByTag(['offers-remote-services']) },
				select: select.attributes(),
			},
			serviceName: globalSelect.freeText(),

			services: {
				where: { tag: { active: true } },
				select: {
					tag: {
						select: {
							category: { select: { tsKey: true, tsNs: true, id: true } },
							tsKey: true,
							tsNs: true,
							active: true,
						},
					},
				},
			},

			locations: {
				where: { location: globalWhere.isPublic() },
				select: {
					location: {
						select: {
							name: true,
						},
					},
				},
			},
		},
	})

	let servObj: ServObj = {}
	for (const service of results) {
		servObj = service.services.reduce((items: ServObj, record) => {
			const key = record.tag.category.tsKey
			if (!items[key]) {
				items[key] = new Set()
			}
			const itemToAdd = {
				id: service.id,
				name: {
					tsNs: service.serviceName?.ns,
					tsKey: service.serviceName?.key,
					defaultText: service.serviceName?.tsKey.text,
				},
				locations: service.locations.map(({ location }) => location.name),
				attributes: service.attributes.map(({ attribute }) => {
					const { id, tsKey, tsNs } = attribute
					return { id, tsKey, tsNs }
				}),
			} satisfies ServItem

			items[key]?.add(transformer.stringify(itemToAdd))
			return items
		}, servObj)
	}
	const transformed = mapObjectVals(servObj, (value) =>
		[...value].map((item) => transformer.parse<ServItem>(item))
	)
	return transformed
}

type ServObj = { [k: string]: Set<string> }
type ServItem = {
	id: string
	name: {
		tsNs?: string
		tsKey?: string
		defaultText?: string
	}
	locations: (string | null)[]
	attributes: { id: string; tsKey: string; tsNs: string }[]
}
