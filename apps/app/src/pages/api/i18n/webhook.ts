import { NextApiRequest, NextApiResponse } from 'next'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
	console.dir(req.body, { depth: 7 })

	res.status(200).end()
}
