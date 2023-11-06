import { type NextApiRequest, type NextApiResponse } from 'next'

import { appRouter } from '@weareinreach/api'
import { getEnv } from '@weareinreach/env'

export default async function handler(_: NextApiRequest, res: NextApiResponse) {
	if (getEnv('NODE_ENV') === 'development') {
		const { renderTrpcPanel } = await import('trpc-panel')
		res.status(200).send(
			renderTrpcPanel(appRouter, {
				url: 'http://localhost:3000/api/trpc',
				transformer: 'superjson',
			})
		)
	} else {
		res.status(403).end()
	}
}
