import { initTRPC } from '@trpc/server'
import { type TRPCPanelMeta } from 'trpc-panel'
import { ZodError } from 'zod'

import { type Permission } from '@weareinreach/db/generated/permission'
import { transformer } from '@weareinreach/util/transformer'

import { type Context } from './context'

export interface Meta extends TRPCPanelMeta {
	hasPerm?: Permission | Permission[]
}

export const t = initTRPC
	.context<Context>()
	.meta<Meta>()
	.create({
		transformer,
		errorFormatter({ shape, error }) {
			return {
				...shape,
				data: {
					...shape.data,
					cause: error.cause instanceof ZodError ? error.cause.flatten() : error.cause,
				},
			}
		},
	})
