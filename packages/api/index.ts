import { type inferRouterProxyClient } from '@trpc/client'
import { type inferReactQueryProcedureOptions } from '@trpc/react-query'
import { type inferRouterInputs, type inferRouterOutputs } from '@trpc/server'

import { type AppRouter } from './router'

export type { AppRouter } from './router'
export { appRouter } from './router'

export { trpc } from './trpc/client'

export { createContext } from './lib/context'
export type { Context } from './lib/context'

export type ApiInput = inferRouterInputs<AppRouter>
export type ApiOutput = inferRouterOutputs<AppRouter>
export type ReactQueryOptions = inferReactQueryProcedureOptions<AppRouter>
export type RouterProxyClient = inferRouterProxyClient<AppRouter>
