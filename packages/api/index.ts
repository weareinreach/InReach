import { type inferRouterProxyClient } from '@trpc/client'
import { type inferReactQueryProcedureOptions } from '@trpc/react-query'

import { type AppRouter } from './router'

export type { AppRouter } from './router'
export { appRouter } from './router'

export * from './trpc/client'

export { createContext } from './lib/context'
export type { Context } from './lib/context'

export type ReactQueryOptions = inferReactQueryProcedureOptions<AppRouter>
export type RouterProxyClient = inferRouterProxyClient<AppRouter>
