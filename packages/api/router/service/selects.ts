import { type Prisma } from '@weareinreach/db'
import { globalSelect } from '~api/selects/global'

export const select = {
	attributes() {
		return {
			attribute: {
				select: {
					id: true,
					tsKey: true,
					tsNs: true,
					icon: true,
					iconBg: true,
					showOnLocation: true,
					categories: {
						select: {
							category: {
								select: {
									tag: true,
									icon: true,
								},
							},
						},
					},
					_count: {
						select: {
							parents: true,
							children: true,
						},
					},
				},
			},
			supplement: {
				select: {
					id: true,
					country: globalSelect.country(),
					language: {
						select: {
							languageName: true,
							nativeName: true,
						},
					},
					text: globalSelect.freeText(),
					govDist: globalSelect.govDistExpanded(),
					boolean: true,
					data: true,
				},
			},
		} satisfies Prisma.ServiceAttributeSelect
	},
}
