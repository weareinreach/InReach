import { z } from 'zod'

import { type IdPrefix, idPrefix } from '@weareinreach/db/lib/idGen'

export const prefixedId = (model: IdPrefix | IdPrefix[]) => {
	const regEx = Array.isArray(model)
		? new RegExp(`^(?:${model.map((m) => idPrefix[m]).join('|')})_\\w+$`)
		: new RegExp(`^${idPrefix[model]}_\\w+$`)
	return z.string().regex(regEx)
}
export { idPrefix, type IdPrefix }
