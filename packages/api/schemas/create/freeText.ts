import { namespace as namespaces } from '@weareinreach/db/generated/namespaces'

export const createFreeText = (slug: string, text?: string) => {
	if (!text) return undefined
	return {
		create: {
			tsKey: {
				create: {
					key: slug,
					namespace: {
						connect: {
							name: namespaces.orgData,
						},
					},
					text: text,
				},
			},
		},
	}
}
