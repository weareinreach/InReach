import { resendVerificationCode } from '@weareinreach/auth/resendCode'
import { handleError } from '~api/lib/errorHandler'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TResendCodeSchema } from './mutation.resendCode.schema'

const resendCode = async ({ input }: TRPCHandlerParams<TResendCodeSchema>) => {
	try {
		const result = await resendVerificationCode(input.email)
		return result
	} catch (error) {
		return handleError(error)
	}
}
export default resendCode
