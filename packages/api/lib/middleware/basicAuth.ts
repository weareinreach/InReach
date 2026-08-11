import { TRPCError } from '@trpc/server'

import { checkPermissions } from './permissions'
import { t } from '../initTRPC'

export const isAuthed = t.middleware(({ ctx, meta, next }) => {
	if (!ctx.session || !ctx.session.user || (meta && !checkPermissions(meta, ctx))) {
		return reject()
	}
	return next({
		ctx: {
			// infers the `session` as non-nullable
			session: { ...ctx.session, user: ctx.session.user },
			actorId: ctx.session.user.id,
			skipCache: true,
		},
	})
})

/** Send unauthorized rejection via middleware */
export const reject = () => {
	throw new TRPCError({ code: 'UNAUTHORIZED' })
}
