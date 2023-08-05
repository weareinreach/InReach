import { mergeRouters } from '~api/lib/trpc'

import { mutations } from './mutations'
import { queries } from './queries'
// import * as schema from './schemas'

export const HandlerCache: Partial<LocationHandlerCache> = {}

export const locationRouter = mergeRouters(queries, mutations)

type LocationHandlerCache = {
	getById: typeof import('./query.getById.handler').getById
}
