// src/pages/api/examples.ts
import type { NextApiRequest, NextApiResponse } from 'next'

import { prisma } from '@weareinreach/db'

const examples = async (_req: NextApiRequest, res: NextApiResponse) => {
	const examples = await prisma.user.findMany()
	res.status(200).json(examples)
}

export default examples
