import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server'

import type { AppRouter } from './router'

export type { AppRouter } from './router'
export { appRouter } from './router'

export { createContext } from './lib/context'
export type { Context } from './lib/context'

export type ApiInput = inferRouterInputs<AppRouter>
export type ApiOutput = inferRouterOutputs<AppRouter>
