import { trpcApiHandler } from '@weareinreach/api/trpc'
import { NextApiHandler } from 'next'

const handler: NextApiHandler = async (req, res) => trpcApiHandler(req, res)

export default handler
