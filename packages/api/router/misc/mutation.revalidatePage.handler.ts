import { type TRPCHandlerParams } from '~api/types/handler'

import { type TRevalidatePageSchema } from './mutation.revalidatePage.schema'

const revalidatePage = async ({ ctx, input }: TRPCHandlerParams<TRevalidatePageSchema, 'protected'>) => {
	try {
		if (!ctx.res) {
			return {
				revalidated: false,
				error: 'Response object is not available',
			}
		}
		await ctx.res.revalidate(input.path)
		return {
			revalidated: true,
		}
	} catch (error) {
		return {
			revalidated: false,
			error,
		}
	}
}
export default revalidatePage
