import { TRPCError } from '@trpc/server'

import { checkPermissions } from './'
import { t } from '../trpc'

export const isAuthed = t.middleware(({ ctx, meta, next }) => {
	if (!ctx.session || !ctx.session.user || !checkPermissions(meta, ctx)) {
		return reject()
	}
	return next({
		ctx: {
			// infers the `session` as non-nullable
			session: { ...ctx.session, user: ctx.session.user },
		},
	})
})

/** Send unauthorized rejection via middleware */
export const reject = () => {
	throw new TRPCError({ code: 'UNAUTHORIZED' })
}
