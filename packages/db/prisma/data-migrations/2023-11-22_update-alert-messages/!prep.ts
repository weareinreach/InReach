import { z } from 'zod'

import fs from 'fs'
import path from 'path'

import { prisma, type Prisma } from '~db/client'

const sourceSchema = z
	.object({
		organizationId: z.string(),
		attributeId: z.string(),
		supplementId: z.string(),
		name: z.string(),
		slug: z.string(),
		shouldDelete: z.boolean(),
		updateAlert: z.string().nullable(),
	})
	.array()

const run = async () => {
	const source = fs.readFileSync(path.join(__dirname, 'source.json'), 'utf-8')
	const data = sourceSchema.parse(JSON.parse(source))
	const supplementData = await prisma.attributeSupplement.findMany({
		where: {
			id: { in: data.map(({ supplementId }) => supplementId) },
		},
		select: {
			id: true,
			text: { select: { key: true, ns: true } },
		},
	})

	const alertUpdates: Prisma.TranslationKeyUpdateArgs[] = []
	const alertDeactivateOrgIds: string[] = []
	const alertDeactivate: Prisma.OrganizationAttributeUpdateManyArgs = {
		where: {
			attributeId: 'attr_01GYSVX1NAMR6RDV6M69H4KN3T',
			organizationId: { in: alertDeactivateOrgIds },
		},
		data: { active: false },
	}

	for (const record of data) {
		if (record.shouldDelete) {
			alertDeactivateOrgIds.push(record.organizationId)
		}
		if (record.updateAlert) {
			const { key, ns } = supplementData.find(({ id }) => id === record.supplementId)?.text ?? {}
			if (!key || !ns) throw new Error('Cannot find key/ns')
			alertUpdates.push({ where: { ns_key: { key, ns } }, data: { text: record.updateAlert } })
		}
	}

	fs.writeFileSync(path.resolve(__dirname, 'data.json'), JSON.stringify({ alertDeactivate, alertUpdates }))
}
run()
