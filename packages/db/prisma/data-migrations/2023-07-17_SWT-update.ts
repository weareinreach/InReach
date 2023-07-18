import superjson from 'superjson'

import { prisma } from '~db/client'
import { namespace } from '~db/generated/namespaces'
import { InputJsonValue } from '~db/lib/zod'
import { formatMessage, isSuccess } from '~db/prisma/common'
import { type MigrationJob } from '~db/prisma/dataMigrationRunner'
import { createLogger, type JobDef, jobPostRunner } from '~db/prisma/jobPreRun'

/** Define the job metadata here. */
const jobDef: JobDef = {
	jobId: '2023-07-17_SWT-update',
	title: 'Update Stand With Trans listing',
	createdBy: 'Joe Karow',
	/** Optional: Longer description for the job */
	description: undefined,
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
export const job20230717a = {
	title: `${jobDef.jobId} - ${jobDef.title}`,
	task: async (_ctx, task) => {
		/** Create logging instance */
		createLogger(task, jobDef.jobId)
		const log = (...args: Parameters<typeof formatMessage>) => (task.output = formatMessage(...args))
		/**
		 * Start defining your data migration from here.
		 *
		 * To log output, use `task.output = 'Message to log'`
		 *
		 * This will be written to `stdout` and to a log file in `/prisma/migration-logs/`
		 */

		// Do stuff

		const svctgrm = await prisma.orgServiceTag.delete({
			where: {
				serviceId_tagId: {
					serviceId: 'osvc_01GVH3WKAAMQF4DJMC8BZPXBA1',
					tagId: 'svtg_01GW2HHFBSTFJC21CK33S54BPZ',
				},
			},
		})
		log(`${isSuccess(svctgrm)} Deleted service tag from osvc_01GVH3WKAAMQF4DJMC8BZPXBA1`)

		const addsvctg = await prisma.orgServiceTag.createMany({
			data: [
				{ serviceId: 'osvc_01GVH3WKAAMQF4DJMC8BZPXBA1', tagId: 'svtg_01GW2HHFBS72MEA9GWN7FWYWQA' },
				{ serviceId: 'osvc_01GVH3WKAAMQF4DJMC8BZPXBA1', tagId: 'svtg_01H2738F1W23TZXB23VNPR9JM3' },
			],
		})
		log(`Service tags added to osvc_01GVH3WKAAMQF4DJMC8BZPXBA1: ${addsvctg.count}`)

		const newSvc = await prisma.orgService.create({
			data: {
				id: 'osvc_01H5J40HMMHCRAW1D5M1C0QFBJ',
				serviceName: {
					create: {
						id: 'ftxt_01H5J427Y1EWEKSB7WEXDPWY8H',
						tsKey: {
							create: {
								key: 'orgn_01GVH3VB07E1D12T186XGE9AGQ.osvc_01H5J40HMMHCRAW1D5M1C0QFBJ.name',
								namespace: { connect: { name: namespace.orgData } },
								text: 'Access a digital library of information for trans youth, their families and allies',
							},
						},
					},
				},
				description: {
					create: {
						id: 'ftxt_01H5J4AYQV2138MNF765PZQR90',
						tsKey: {
							create: {
								key: 'orgn_01GVH3VB07E1D12T186XGE9AGQ.osvc_01H5J40HMMHCRAW1D5M1C0QFBJ.description',
								text: 'The Trans Lifeline Library offers resources and information for parents of trans youth, trans youth, and allies on topics such as gender affirming shopping, books and videos, college resources, books and videos, and more.',
								namespace: { connect: { name: namespace.orgData } },
							},
						},
					},
				},
				attributes: {
					createMany: {
						data: [
							{ attributeId: 'attr_01GW2HHFV5Q7XN2ZNTYFR1AD3M' },
							{ attributeId: 'attr_01GW2HHFVGDTNW9PDQNXK6TF1T' },
							{ attributeId: 'attr_01GW2HHFVJDKVF1HV7559CNZCY' },
						],
					},
				},
				serviceAreas: {
					create: {
						id: 'svar_01H5J4NM5K7ZY196PWXZ8DTVH5',
						countries: { create: { countryId: 'ctry_01GW2HHDK9M26M80SG63T21SVH' } },
					},
				},
				accessDetails: { create: { attributeId: 'attr_01GW2HHFVMYXMS8ARA3GE7HZFD' } },
				services: {
					createMany: {
						data: [
							{ tagId: 'svtg_01GW2HHFBPVH03WA49B1ABGW0F' },
							{ tagId: 'svtg_01GW2HHFBPZFZF43FEHPV32JC8' },
							{ tagId: 'svtg_01GW2HHFBRB8R4AQVR2FYE72EC' },
						],
					},
				},
				published: true,
				organization: { connect: { id: 'orgn_01GVH3VB07E1D12T186XGE9AGQ' } },
			},
		})
		log(`${isSuccess(newSvc)} New service osvc_01H5J40HMMHCRAW1D5M1C0QFBJ created`)

		const targetPopText = await prisma.freeText.create({
			data: {
				id: 'ftxt_01H5J5K8EAXHC5S13NZFX6V1PG',
				tsKey: {
					create: {
						key: 'orgn_01GVH3VB07E1D12T186XGE9AGQ.attribute.atts_01H5J5F30VYDQ9QZHJNB5N7NHP',
						text: 'Trans youth, their parents/caregivers and allies looking for information.',
						namespace: { connect: { name: namespace.orgData } },
					},
				},
			},
		})

		const newAttribSupp = await prisma.attributeSupplement.createMany({
			data: [
				{
					id: 'atts_01H5J5EXSM97EFC3A291HC5Z78',
					serviceAccessAttributeAttributeId: 'attr_01GW2HHFVMYXMS8ARA3GE7HZFD',
					serviceAccessAttributeServiceId: 'osvc_01H5J40HMMHCRAW1D5M1C0QFBJ',
					data: InputJsonValue.parse(
						superjson.serialize({
							access_type: 'link',
							access_value: 'https://standwithtrans.org/trans-lifeline-library/',
							instructions: '',
						})
					),
				},
				{
					id: 'atts_01H5J5F30VYDQ9QZHJNB5N7NHP',
					serviceAttributeOrgServiceId: 'osvc_01H5J40HMMHCRAW1D5M1C0QFBJ',
					serviceAttributeAttributeId: 'attr_01GW2HHFVJDKVF1HV7559CNZCY',
					textId: targetPopText.id,
				},
			],
		})
		log(`Attribute Supplements created: ${newAttribSupp.count}`)

		/**
		 * DO NOT REMOVE BELOW
		 *
		 * This writes a record to the DB to register that this migration has run successfully.
		 */
		await jobPostRunner(jobDef)
	},
	def: jobDef,
} satisfies MigrationJob
