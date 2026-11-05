import { type NextApiRequest, type NextApiResponse } from 'next'

import { getEnv } from '@weareinreach/env'
import { createLoggerInstance } from '@weareinreach/util/logger'
import { safeEqual } from '@weareinreach/util/security'

const log = createLoggerInstance('Crowdin webhook')

export default function handler(req: NextApiRequest, res: NextApiResponse) {
	if (req.method !== 'POST') {
		res.status(405).end()
		return
	}

	const expected = getEnv('CROWDIN_WEBHOOK_SECRET')
	const provided = req.query.secret
	if (!expected || typeof provided !== 'string' || !safeEqual(provided, expected)) {
		res.status(401).end()
		return
	}

	// Previously logged the full request body unconditionally - that's whatever source text/translation
	// content a project collaborator or Crowdin itself put in the event, not something that belongs in
	// server logs. Nothing currently reads this webhook's payload, so there's nothing to act on here beyond
	// confirming receipt.
	log.info('Received Crowdin webhook event')

	res.status(200).end()
}
