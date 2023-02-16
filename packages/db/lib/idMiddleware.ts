import { Prisma } from '@prisma/client'

import { generateId, idPrefix, type IdPrefix } from './idGen'

export const idMiddleware: Prisma.Middleware = async (params, next) => {
	const { action, model } = params
	if ((action === 'create' || action === 'createMany') && model !== undefined) {
		const modelName = model.charAt(0).toLowerCase() + model.slice(1)
		if (modelName in idPrefix) {
			if (action === 'create') {
				if (!params.args.data.id) {
					params.args.data.id = generateId(modelName as IdPrefix)
				}
			} else if (Array.isArray(params.args.data)) {
				params.args.data = params.args.data.map((record) => ({
					id: record.id ? record.id : generateId(modelName as IdPrefix),
					...record,
				}))
			}
		}
	}
	return next(params)
}
