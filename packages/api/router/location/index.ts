import { mergeRouters } from '~api/lib/trpc'

import { mutations } from './mutations'
import { queries } from './queries'

export const locationRouter = mergeRouters(queries, mutations)
