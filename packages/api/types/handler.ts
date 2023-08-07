import { type SetNonNullable } from 'type-fest'

import { type Context } from '~api/lib/context'

type ContextScenario = 'public' | 'protected'
type AuthedContext = SetNonNullable<Context, 'session'> & { actorId: string }

export type TRPCHandlerParams<TInput = undefined, TScenario extends ContextScenario = 'public'> = {
	ctx: TScenario extends 'public' ? Context : AuthedContext
} & (undefined extends TInput
	? [TInput] extends [undefined]
		? { input?: never }
		: { input: TInput }
	: { input: TInput })
