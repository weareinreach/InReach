import { Prisma } from '@prisma/client'
import { z } from 'zod'

import fs from 'fs'
import path from 'path'

import { prisma } from '~db/index'
import { type ListrJob, type ListrTask, type MigrationJob } from '~db/prisma/dataMigrationRunner'
import { type JobDef, jobPostRunner, jobPreRunner } from '~db/prisma/jobPreRun'

import { namespaces } from '../../../seed/data'

const getJSON = (file: string) => JSON.parse(fs.readFileSync(path.resolve(__dirname, file), 'utf-8'))

/** Define the job metadata here. */
const jobDef: JobDef = {
	jobId: '2023-06-05_2-add-tags',
	title: 'Create new tags/attributes & add to existing org/services',
	createdBy: 'Joe Karow',
}
/**
 * Job export - this variable MUST be UNIQUE
 *
 * Use the format `jobYYYYMMDD` and append a letter afterwards if there is already a job with this name.
 *
 * @example `job20230404`
 *
 * @example `job20230404b`
 */
export const job20230605b = {
	title: `${jobDef.jobId} - ${jobDef.title}`,
	task: async (_ctx, task) => {
		/**
		 * Do not edit this part
		 *
		 * This ensures that jobs are only run once
		 */
		if (await jobPreRunner(jobDef, task)) {
			return task.skip(`${jobDef.jobId} - Migration has already been run.`)
		}
		/**
		 * Start defining your data migration from here.
		 *
		 * To log output, use `task.output = 'Message to log'`
		 *
		 * This will be written to `stdout` and to a log file in `/prisma/migration-logs/`
		 */

		// Do stuff

		const fileOrgAttributes = getJSON('data-orgAttributes.json')

		const dataOrgAttributes = Prisma.validator<Prisma.OrganizationAttributeCreateManyArgs>()({
			data: fileOrgAttributes,
			skipDuplicates: true,
		})
		const dataServAttributes = Prisma.validator<Prisma.ServiceAttributeCreateManyArgs>()({
			data: getJSON('data-servAttributes.json'),
			skipDuplicates: true,
		})
		const dataServiceTags = Prisma.validator<Prisma.OrgServiceTagCreateManyArgs>()({
			data: getJSON('data-serviceTags.json'),
			skipDuplicates: true,
		})

		const newServices: Prisma.ServiceTagCreateInput[] = [
			{
				id: 'svtg_01H2738F1W23TZXB23VNPR9JM3',
				name: 'Community & Social Groups',
				// okay to be active
				category: {
					connect: {
						id: 'svct_01GW2HHEVCXGK9GPK6SAZ2Q7E3',
					},
				},
				key: {
					connectOrCreate: {
						where: { ns_key: { key: 'community-support.community-social-groups', ns: namespaces.services } },
						create: {
							key: 'community-support.community-social-groups',
							namespace: { connect: { name: namespaces.services } },
							text: 'Community & Social Groups',
						},
					},
				},
			},
			{
				id: 'svtg_01H273BXC1T475GPEW4TXZ3Z20',
				name: 'Art, Music, & Literature',
				// okay to be active
				category: {
					connect: {
						id: 'svct_01GW2HHEVPE008PHCPNHZDAWMS',
					},
				},
				key: {
					connectOrCreate: {
						where: {
							ns_key: { key: 'sports-and-entertainment.art-music-literature', ns: namespaces.services },
						},
						create: {
							key: 'sports-and-entertainment.art-music-literature',
							namespace: { connect: { name: namespaces.services } },
							text: 'Art, Music, & Literature',
						},
					},
				},
			},
			{
				id: 'svtg_01H273CH9YC9PXQWJ5RV349T2F',
				// do not publish yet
				name: 'Re-entry services',
				category: {
					connect: {
						id: 'svct_01GW2HHEVCXGK9GPK6SAZ2Q7E3',
					},
				},
				key: {
					connectOrCreate: {
						where: { ns_key: { key: 'community-support.reentry-services', ns: namespaces.services } },
						create: {
							key: 'community-support.reentry-services',
							namespace: { connect: { name: namespaces.services } },
							text: 'Re-entry services',
						},
					},
				},
			},
		]
		const newServBatch = await prisma.$transaction(
			newServices.map((service) =>
				prisma.serviceTag.upsert({ where: { id: service.id }, create: service, update: {} })
			)
		)
		task.output = `Created ${newServBatch.length} new services`

		const newAttributes /*: Prisma.AttributeToCategoryCreateInput[] */ = [
			{
				category: { connect: { id: 'attc_01GW2HHFVNXMNJNV47BF2BPM1R' } },
				attribute: {
					connectOrCreate: {
						where: { tag: 'women-focus' },
						create: {
							id: 'attr_01H273DMQ22TVP3RA36M1XWFBA',
							name: 'Focused on Women',
							tag: 'women-focus',
							key: {
								create: {
									key: 'srvfocus.women',
									text: 'Focused on Women',
									namespace: { connect: { name: namespaces.attribute } },
								},
							},
						},
					},
				},
			},
			{
				category: { connect: { id: 'attc_01GW2HHFVNXMNJNV47BF2BPM1R' } },
				attribute: {
					connectOrCreate: {
						where: { tag: 'disabled-focus' },
						create: {
							id: 'attr_01H273ETEX43K0BR6FG3G7MZ4S',
							name: 'Disabled Community',
							tag: 'disabled-focus',
							key: {
								create: {
									key: 'srvfocus.disabled',
									text: 'Disabled Community',
									namespace: { connect: { name: namespaces.attribute } },
								},
							},
						},
					},
				},
			},
			{
				category: { connect: { id: 'attc_01GW2HHFVNXMNJNV47BF2BPM1R' } },
				attribute: {
					connectOrCreate: {
						where: { tag: 'elder-focus' },
						create: {
							id: 'attr_01H273FCJ8NNG1T1BV300CN702',
							name: 'Focused on Elders',
							tag: 'elder-focus',
							key: {
								create: {
									key: 'srvfocus.elder',
									text: 'Focused on Elders',
									namespace: { connect: { name: namespaces.attribute } },
								},
							},
						},
					},
				},
			},
			{
				category: { connect: { id: 'attc_01GW2HHFVNXMNJNV47BF2BPM1R' } },
				attribute: {
					connectOrCreate: {
						where: { tag: 'incarcerated-focus' },
						create: {
							id: 'attr_01H273FPTCFKTVBNK158HE9M42',
							name: 'Incarcerated Community',
							tag: 'incarcerated-focus',
							key: {
								create: {
									key: 'srvfocus.incarcerated',
									text: 'Incarcerated Community',
									namespace: { connect: { name: namespaces.attribute } },
								},
							},
						},
					},
				},
			},
			{
				category: { connect: { id: 'attc_01GW2HHFVNXMNJNV47BF2BPM1R' } },
				attribute: {
					connectOrCreate: {
						where: { tag: 'caregivers-focus' },
						create: {
							id: 'attr_01H273G39A14TGHT4DA1T0DW5M',
							name: 'Caregivers Community',
							tag: 'caregivers-focus',
							key: {
								create: {
									key: 'srvfocus.caregivers',
									text: 'Caregivers Community',
									namespace: { connect: { name: namespaces.attribute } },
								},
							},
						},
					},
				},
			},
			{
				category: { connect: { id: 'attc_01GW2HHFV3DJ380F351SKB0B74' } },
				attribute: {
					connectOrCreate: {
						where: { tag: 'private-practice' },
						create: {
							id: 'attr_01H273GHADR15DGYH06SSN5XVG',
							name: 'Private Practice',
							tag: 'private-practice',
							key: {
								create: {
									key: 'additional.private-practice',
									text: 'Private Practice',
									namespace: { connect: { name: namespaces.attribute } },
								},
							},
						},
					},
				},
			},
			{
				category: { connect: { id: 'attc_01GW2HHFVMNHV2ZS5875JWCRJ7' } },
				attribute: {
					connectOrCreate: {
						where: { tag: 'women-led' },
						create: {
							id: 'attr_01H273GW0GN44GZ5RK1F51Z1QZ',
							name: 'Women-led',
							tag: 'women-led',
							key: {
								create: {
									key: 'orgleader.women-led',
									text: 'Women-led',
									namespace: { connect: { name: namespaces.attribute } },
								},
							},
						},
					},
				},
			},
		] as const
		const newAttribBatch = await prisma.$transaction(
			newAttributes.map((attribute) =>
				prisma.attributeToCategory.upsert({
					where: {
						attributeId_categoryId: {
							attributeId: attribute.attribute.connectOrCreate.create.id,
							categoryId: attribute.category.connect.id,
						},
					},
					create: attribute,
					update: {},
				})
			)
		)
		task.output = `Created ${newAttribBatch.length} new attributes`

		const updatedAttributes = await prisma.$transaction([
			prisma.attribute.update({ where: { tag: 'trans-fem' }, data: { name: 'Trans Women/Trans Feminine' } }),
			prisma.translationKey.update({
				where: { ns_key: { key: 'srvfocus.trans-fem', ns: namespaces.attribute } },
				data: { text: 'Trans Women/Trans Feminine' },
			}),
			prisma.attribute.update({ where: { tag: 'trans-masc' }, data: { name: 'Trans Men/Trans Masculine' } }),
			prisma.translationKey.update({
				where: { ns_key: { key: 'srvfocus.trans-masc', ns: namespaces.attribute } },
				data: { text: 'Trans Men/Trans Masculine' },
			}),
			prisma.attribute.update({ where: { tag: 'gender-nc' }, data: { name: 'Gender Non-Conforming' } }),
			prisma.translationKey.update({
				where: { ns_key: { key: 'srvfocus.gender-nc', ns: namespaces.attribute } },
				data: { text: 'Gender Non-Conforming' },
			}),
			prisma.attribute.update({ where: { tag: 'religiously-affiliated' }, data: { active: false } }),
		])
		task.output = `Updated ${updatedAttributes.length} attributes`

		const hiddenServiceTags = await prisma.serviceTag.updateMany({
			where: {
				id: {
					in: [
						'svtg_01GW2HHFBPV0NV6R04MR84X9H6',
						'svtg_01GW2HHFBPHEBB94KEDQXEA8AC',
						'svtg_01GW2HHFBN7M36NVSDWR6M9K20',
						'svtg_01GW2HHFBRYMX5EH2J05SREANF',
						'svtg_01GW2HHFBRSQG19TQ4G5EVP3AQ',
						'svtg_01GW2HHFBRK22BMD8KX9DZ9JA5',
						'svtg_01GW2HHFBS6STMXJT0GK4F4YQS',
						'svtg_01GW2HHFBR4WXR0SMNAKZAHFGK',
					],
				},
			},
			data: { active: false },
		})
		task.output = `Updated ${hiddenServiceTags.count} service tags`

		const linkOrgAttributes = await prisma.organizationAttribute.createMany(dataOrgAttributes)
		const linkServAttributes = await prisma.serviceAttribute.createMany(dataServAttributes)
		const linkServiceTags = await prisma.orgServiceTag.createMany(dataServiceTags)
		task.output = `Created ${linkOrgAttributes.count} organization-attribute links`
		task.output = `Created ${linkServAttributes.count} service-attribute links`
		task.output = `Created ${linkServiceTags.count} service-tag links`

		/**
		 * DO NOT REMOVE BELOW
		 *
		 * This writes a record to the DB to register that this migration has run successfully.
		 */
		await jobPostRunner(jobDef)
	},
	def: jobDef,
} satisfies MigrationJob
