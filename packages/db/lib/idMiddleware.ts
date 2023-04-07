import { Prisma } from '@prisma/client'

import { generateId, idPrefix, type IdPrefix } from './idGen'

export const idMiddleware: Prisma.Middleware = async (params, next) => {
	const { action, model } = params
	if ((action === 'create' || action === 'createMany' || action === 'upsert') && model !== undefined) {
		const modelName = model.charAt(0).toLowerCase() + model.slice(1)
		if (modelName in idPrefix) {
			switch (action) {
				case 'create': {
					if (!params.args.data.id) {
						params.args.data.id = generateId(modelName as IdPrefix)
					}
					break
				}
				case 'upsert': {
					if (!params.args.create.id) {
						params.args.create.id = generateId(modelName as IdPrefix)
					}
					break
				}
				case 'createMany': {
					if (Array.isArray(params.args.data)) {
						params.args.data = params.args.data.map((record: Record<string, unknown>) => ({
							id: record.id ? record.id : generateId(modelName as IdPrefix),
							...record,
						}))
					}
					break
				}
			}
		}
	}
	return next(params)
}
