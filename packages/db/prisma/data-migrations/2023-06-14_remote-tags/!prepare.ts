import compact from 'just-compact'
import { z } from 'zod'

import fs from 'fs'
import path from 'path'

import { prisma } from '~db/client'

const Schema = z
	.object({
		legacyId: z.string(),
		legacyServiceId: z.string(),
	})
	.array()

const main = async () => {
	const raw = fs.readFileSync(path.resolve(__dirname, 'data.json'), 'utf-8')

	const data = Schema.parse(JSON.parse(raw))

	const orgIds = await prisma.organization.findMany({ select: { id: true, legacyId: true } })
	const servIds = await prisma.orgService.findMany({ select: { id: true, legacyId: true } })

	const orgIdMap = new Map(orgIds.map(({ id, legacyId }) => [legacyId, id]))
	const servIdMap = new Map(servIds.map(({ id, legacyId }) => [legacyId, id]))
	const rejected: { legacyId: string; legacyServiceId: string }[] = []

	const output = compact(
		data.map(({ legacyId, legacyServiceId }) => {
			const organizationId = orgIdMap.get(legacyId)
			const serviceId = servIdMap.get(legacyServiceId)

			if (organizationId && serviceId) {
				return { organizationId, serviceId }
			} else {
				rejected.push({ legacyId, legacyServiceId })
				return
			}
		})
	)

	fs.writeFileSync(path.resolve(__dirname, 'data.json'), JSON.stringify(output))
	fs.writeFileSync(path.resolve(__dirname, 'exceptions.json'), JSON.stringify(rejected))
}

main()
