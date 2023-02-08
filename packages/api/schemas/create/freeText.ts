import { namespaces } from '@weareinreach/db/seed/data'

export const createFreeText = (slug: string, text?: string) => {
	if (!text) return undefined
	return {
		create: {
			tsKey: {
				create: {
					key: slug,
					namespace: {
						connect: {
							name: namespaces.orgDescription,
						},
					},
					text: text,
				},
			},
		},
	}
}
