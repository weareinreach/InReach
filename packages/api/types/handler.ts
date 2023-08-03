import { type Context } from '~api/lib/context'

export type TRPCHandlerParams<TInput = undefined> = {
	ctx: Context
} & (undefined extends TInput ? { input?: never } : { input: TInput })
