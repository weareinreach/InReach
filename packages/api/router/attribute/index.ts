import { mergeRouters } from '~api/lib/trpc'

// import { mutations } from './mutations'
import { queries } from './queries'

export const attributeRouter = mergeRouters(queries /*mutations*/)
