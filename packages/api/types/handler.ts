import { type Context } from '~api/lib/context'

export type TRPCHandlerParams<T> = {
	ctx: Context
	input: T
}
