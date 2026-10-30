import { troubleLoggingIn } from '@weareinreach/auth/troubleLoggingIn'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TTroubleLoggingInSchema } from './mutation.troubleLoggingIn.schema'

/**
 * Public, unauthenticated self-service entry point backing the login form's "Trouble logging in?" link - see
 * `troubleLoggingIn` for the full account-state handling. Deliberately never reveals which of the three real
 * states (no account / unconfirmed / confirmed) was true.
 */
const troubleLoggingInHandler = ({ input }: TRPCHandlerParams<TTroubleLoggingInSchema>) => {
	return troubleLoggingIn(input.email)
}
export default troubleLoggingInHandler
