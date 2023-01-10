import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server'

import type { AppRouter } from './src/router'

export type { AppRouter } from './src/router'
export { appRouter } from './src/router'

export { createContext } from './src/context'
export type { Context } from './src/context'

export type ApiInput = inferRouterInputs<AppRouter>
export type ApiOutput = inferRouterOutputs<AppRouter>
