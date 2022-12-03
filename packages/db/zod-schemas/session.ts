import * as z from 'zod'

import * as imports from '../zod-util'
import { CompleteUser, UserModel } from './index'

export const _SessionModel = z.object({
	id: imports.cuid,
	sessionToken: z.string(),
	expires: z.date(),
	userId: imports.cuid,
})

export interface CompleteSession extends z.infer<typeof _SessionModel> {
	user: CompleteUser
}

/**
 * SessionModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const SessionModel: z.ZodSchema<CompleteSession> = z.lazy(() =>
	_SessionModel.extend({
		user: UserModel,
	})
)
