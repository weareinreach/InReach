import { defineRouter, importHandler, publicProcedure } from '~api/lib/trpc'

import { ZCreateSchema } from './mutation.create.schema'

const NAMESPACE = 'report'

const namespaced = (s: string) => `${NAMESPACE}.${s}`

export const reportRouter = defineRouter({
	create: publicProcedure.input(ZCreateSchema).mutation(async (opts) => {
		const handler = await importHandler(namespaced('create'), () => import('./mutation.create.handler'))
		return handler(opts)
	}),
})
