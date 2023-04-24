import { initTRPC } from '@trpc/server'
import superjson from 'superjson'
import { type TRPCPanelMeta } from 'trpc-panel'

import { Permission } from '~api/generated/permission'

import { type Context } from './context'

export interface Meta extends TRPCPanelMeta {
	hasPerm?: Permission | Permission[]
}

export const t = initTRPC
	.context<Context>()
	.meta<Meta>()
	.create({
		transformer: superjson,
		errorFormatter({ shape }) {
			return shape
		},
	})
