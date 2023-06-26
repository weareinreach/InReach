import { type Prisma } from '@prisma/client'
import compact from 'just-compact'
import { z } from 'zod'

import fs from 'fs'
import path from 'path'

import { prisma } from '~db/client'

export const googleExportSchema = z
	.object({
		legacyId: z.string(),
		name: z.string(),
		'orgleader.bipoc-led': z.boolean().nullable(),
		'orgleader.black-led': z.boolean().nullable(),
		'srvfocus.bipoc-comm': z.boolean().nullable(),
		'orgleader.immigrant-led': z.boolean().nullable(),
		'srvfocus.immigrant-comm': z.boolean().nullable(),
		'srvfocus.asylum-seekers': z.boolean().nullable(),
		'srvfocus.resettled-refugees': z.boolean().nullable(),
		'orgleader.trans-led': z.boolean().nullable(),
		'srvfocus.trans-comm': z.boolean().nullable(),
		'srvfocus.trans-youth-focus': z.boolean().nullable(),
		'srvfocus.trans-masc': z.boolean().nullable(),
		'srvfocus.trans-fem': z.boolean().nullable(),
		'srvfocus.gender-nc': z.boolean().nullable(),
		'srvfocus.lgbtq-youth-focus': z.boolean().nullable(),
		'srvfocus.spanish-speakers': z.boolean().nullable(),
		'srvfocus.hiv-comm': z.boolean().nullable(),
	})
	.array()

const main = async () => {
	const data = JSON.parse(fs.readFileSync(path.resolve(__dirname, '!google-export.json'), 'utf-8'))
	const parsed = googleExportSchema.parse(data)

	const orgs = await prisma.organization.findMany({ select: { id: true, name: true, legacyId: true } })
	const attributes = await prisma.attribute.findMany({ select: { id: true, tsKey: true } })

	const rejected: Rejected[] = []
	const output: Prisma.OrganizationAttributeCreateManyInput[] = []
	for (const item of parsed) {
		const { legacyId, name, ...tags } = item

		const orgId = orgs.find((org) => org.legacyId === legacyId)?.id

		const attribsToAdd = compact(
			Object.entries(tags)
				.filter(([key, value]) => value === true)
				.map(([key]) => attributes.find((attr) => attr.tsKey === key)?.id)
		)
		if (attribsToAdd.length === 0) continue

		if (!orgId) {
			rejected.push({ legacyId, name, attributes: attribsToAdd })
		} else {
			output.push(...attribsToAdd.map((id) => ({ organizationId: orgId, attributeId: id })))
		}
	}
	fs.writeFileSync(path.resolve(__dirname, 'output.json'), JSON.stringify(output, null, 2))
	fs.writeFileSync(path.resolve(__dirname, 'rejected.json'), JSON.stringify(rejected, null, 2))
}

main()
interface Rejected {
	legacyId: string
	name: string
	attributes: string[]
}
