import { type GetServerSidePropsContext, type NextApiRequest, type NextApiResponse } from 'next'
import { getServerSession as nextauthServerSession } from 'next-auth'

import { authOptions } from './auth-options'

export const getServerSession = async (
	ctx:
		| {
				req: GetServerSidePropsContext['req']
				res: GetServerSidePropsContext['res']
		  }
		| { req: NextApiRequest; res: NextApiResponse }
) => {
	return await nextauthServerSession(ctx.req, ctx.res, authOptions)
}
