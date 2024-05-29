import { z } from 'zod'
import { zodToJsonSchema } from 'zod-to-json-schema'

import { type MigrationJob } from '~db/prisma/dataMigrationRunner'
import { type JobDef } from '~db/prisma/jobPreRun'
import { JsonInputOrNull } from '~db/zod_util'
import { FieldType } from '~db/zod_util/attributeSupplement'

/** Define the job metadata here. */
const jobDef: JobDef = {
	jobId: '2024-03-21_attribute-supplement-schemas',
	title: 'attribute supplement schemas',
	createdBy: 'Joe Karow',
	/** Optional: Longer description for the job */
	description: undefined,
}

const schemas = {
	currency: z.object({
		cost: z.number(),
		currency: z.string().nullish(),
	}),
	numMinMaxOrRange: z
		.union([
			z.object({ min: z.number(), max: z.never() }),
			z.object({ min: z.never(), max: z.number() }),
			z.object({ min: z.number(), max: z.number() }),
		])
		.refine(({ min, max }) => (min && max ? min < max : true), {
			message: 'min must be less than  max',
		}),
}
/**
 * Job export - this variable MUST be UNIQUE
 */
export const job20240321_attribute_supplement_schemas = {
	title: `[${jobDef.jobId}] ${jobDef.title}`,
	task: async (ctx, task) => {
		const { createLogger, formatMessage, jobPostRunner, prisma } = ctx
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

		const newSchemas = await prisma.attributeSupplementDataSchema.createMany({
			data: [
				{
					id: 'asds_01HSGTSP6SKA5NZS9J42Z8S5BT',
					tag: 'currency',
					name: 'Currency',
					definition: [
						{
							key: 'cost',
							name: 'cost',
							type: FieldType.number,
							label: 'Cost',
						},
						{
							key: 'currency',
							name: 'currency',
							type: FieldType.text,
							label: 'Currency',
						},
					],
					schema: JsonInputOrNull.parse(zodToJsonSchema(schemas.currency)),
				},
			],
			skipDuplicates: true,
		})
		log(`Created ${newSchemas.count} Attribute Supplement Schema records.`)
		const updateMinMax = await prisma.attributeSupplementDataSchema.update({
			where: { id: 'asds_01GYX872BWWCGTZREHDT2AFF9D' },
			data: {
				schema: JsonInputOrNull.parse(zodToJsonSchema(schemas.numMinMaxOrRange)),
			},
		})
		log(`Updated Attribute Supplement Schema: ${updateMinMax.name}.`)
		/**
		 * DO NOT REMOVE BELOW
		 *
		 * This writes a record to the DB to register that this migration has run successfully.
		 */
		await jobPostRunner(jobDef)
	},
	def: jobDef,
} satisfies MigrationJob
