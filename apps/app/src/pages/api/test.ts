import type { NextApiRequest, NextApiResponse } from 'next'

const handler = (req: NextApiRequest, res: NextApiResponse) => {
	if (req.method === 'POST') res.status(200).end()
	else res.status(400).end()
}
export default handler
