import { z } from 'zod'
import { zodToJsonSchema } from 'zod-to-json-schema'

import { prisma } from '~db/client'
import { formatMessage } from '~db/prisma/common'
import { type MigrationJob } from '~db/prisma/dataMigrationRunner'
import { createLogger, type JobDef, jobPostRunner } from '~db/prisma/jobPreRun'
import { JsonInputOrNull } from '~db/zod_util'
import { FieldType } from '~db/zod_util/attributeSupplement'

/** Define the job metadata here. */
const jobDef: JobDef = {
	jobId: '2024-04-03_access-instruction-schemas',
	title: 'access instruction schemas',
	createdBy: 'Joe Karow',
	/** Optional: Longer description for the job */
	description: undefined,
}

const schemas = {
	email: z.object({
		access_type: z.literal('email').optional().default('email'),
		access_value: z.string().email().nullish(),
		instructions: z.string().optional(),
	}),
	file: z.object({
		access_type: z.literal('file').optional().default('file'),
		access_value: z.string().url().nullish(),
		instructions: z.string().optional(),
	}),
	link: z.object({
		access_type: z.literal('link').optional().default('link'),
		access_value: z.string().url().nullish(),
		instructions: z.string().optional(),
	}),
	location: z.object({
		access_type: z.literal('location').optional().default('location'),
		access_value: z.string().nullish(),
		instructions: z.string().optional(),
	}),
	other: z.object({
		access_type: z.literal('other').optional().default('other'),
		access_value: z.string().nullish(),
		instructions: z.string().optional(),
	}),
	phone: z.object({
		access_type: z.literal('phone').optional().default('phone'),
		access_value: z.string().nullish(),
		instructions: z.string().optional(),
	}),
	sms: z.object({
		access_type: z.literal('sms').optional().default('sms'),
		sms_body: z.string().optional(),
		access_value: z.string().nullish(),
		instructions: z.string().optional(),
	}),
	whatsapp: z.object({
		access_type: z.literal('whatsapp').optional().default('whatsapp'),
		access_value: z.string().nullish(),
		instructions: z.string().optional(),
	}),
	publicTransport: z.object({
		access_type: z.literal('publicTransit').optional().default('publicTransit'),
		access_value: z.string().nullish(),
		instructions: z.string().optional(),
	}),
}
const numMinMaxOrRange = z
	.union([
		z.object({ min: z.number(), max: z.never().optional() }),
		z.object({ min: z.never().optional(), max: z.number() }),
		z.object({ min: z.number(), max: z.number() }),
	])
	.refine(({ min, max }) => (min && max ? min < max : true), {
		message: 'min must be less than  max',
	})

/**
 * Job export - this variable MUST be UNIQUE
 */
export const job20240403_access_instruction_schemas = {
	title: `[${jobDef.jobId}] ${jobDef.title}`,
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

		const newSchemas = await prisma.attributeSupplementDataSchema.createMany({
			data: [
				{
					id: 'asds_01HTJ6EZ419CVQCY4N8KAYYCMB',
					tag: 'access-instruction-email',
					name: 'Access Instruction - Email',
					definition: [
						{
							key: 'access_value',
							name: 'access_value',
							type: FieldType.text,
							label: 'Email Address',
						},
					],
					schema: JsonInputOrNull.parse(zodToJsonSchema(schemas.email)),
				},
				{
					id: 'asds_01HTJ6EZ42H4YZ68RM1WDSEK89',
					tag: 'access-instruction-file',
					name: 'Access Instruction - File',
					definition: [
						{
							key: 'access_value',
							name: 'access_value',
							type: FieldType.text,
							label: 'File URL',
						},
					],
					schema: JsonInputOrNull.parse(zodToJsonSchema(schemas.file)),
				},
				{
					id: 'asds_01HTJ6EZ42PTQZG4SPQDBHM8BN',
					tag: 'access-instruction-link',
					name: 'Access Instruction - Link',
					definition: [
						{
							key: 'access_value',
							name: 'access_value',
							type: FieldType.text,
							label: 'Link URL',
						},
					],
					schema: JsonInputOrNull.parse(zodToJsonSchema(schemas.link)),
				},
				{
					id: 'asds_01HTJ6EZ42YHJT3CY7SK8N2WW6',
					tag: 'access-instruction-location',
					name: 'Access Instruction - Location',
					definition: [
						{
							key: 'access_value',
							name: 'access_value',
							type: FieldType.text,
							label: 'Location',
						},
					],
					schema: JsonInputOrNull.parse(zodToJsonSchema(schemas.location)),
				},
				{
					id: 'asds_01HTJ6EZ42HTHRFAH0JDC2ZXG1',
					tag: 'access-instruction-other',
					name: 'Access Instruction - Other',
					definition: [
						{
							key: 'access_value',
							name: 'access_value',
							type: FieldType.text,
							label: 'Other',
						},
					],
					schema: JsonInputOrNull.parse(zodToJsonSchema(schemas.other)),
				},
				{
					id: 'asds_01HTJ6EZ42TRHK12DVNDK8ZT02',
					tag: 'access-instruction-phone',
					name: 'Access Instruction - Phone',
					definition: [
						{
							key: 'access_value',
							name: 'access_value',
							type: FieldType.text,
							label: 'Phone Number',
						},
					],
					schema: JsonInputOrNull.parse(zodToJsonSchema(schemas.phone)),
				},
				{
					id: 'asds_01HTJ6EZ42GGZJ0R4S73T5KCNK',
					tag: 'access-instruction-sms',
					name: 'Access Instruction - SMS',
					definition: [
						{
							key: 'access_value',
							name: 'access_value',
							type: FieldType.text,
							label: 'SMS Details',
						},
					],
					schema: JsonInputOrNull.parse(zodToJsonSchema(schemas.sms)),
				},
				{
					id: 'asds_01HTJ6EZ42V93736GW3DPM34V8',
					tag: 'access-instruction-whatsapp',
					name: 'Access Instruction - WhatsApp',
					definition: [
						{
							key: 'access_value',
							name: 'access_value',
							type: FieldType.text,
							label: 'WhatsApp Number',
						},
					],
					schema: JsonInputOrNull.parse(zodToJsonSchema(schemas.whatsapp)),
				},
				{
					id: 'asds_01HTJ6EZ42KNM6A4BC02PXZFJH',
					tag: 'access-instruction-publicTransport',
					name: 'Access Instruction - Public Transport',
					definition: [
						{
							key: 'access_value',
							name: 'access_value',
							type: FieldType.text,
							label: 'Public Transport Details',
						},
					],
					schema: JsonInputOrNull.parse(zodToJsonSchema(schemas.publicTransport)),
				},
			],
			skipDuplicates: true,
		})

		log(`Created ${newSchemas.count} Access Instruction Schema records.`)

		const updateData: UpdateData[] = [
			{
				where: 'attr_01GW2HHFVKFM4TDY4QRK4AR2ZW',
				schemaId: 'asds_01HTJ6EZ419CVQCY4N8KAYYCMB',
			},
			{
				where: 'attr_01GW2HHFVKMRHFD8SMDAZM3SSM',
				schemaId: 'asds_01HTJ6EZ42H4YZ68RM1WDSEK89',
			},
			{
				where: 'attr_01GW2HHFVMYXMS8ARA3GE7HZFD',
				schemaId: 'asds_01HTJ6EZ42PTQZG4SPQDBHM8BN',
			},
			{
				where: 'attr_01GW2HHFVMH6AE94EXN7T5A87C',
				schemaId: 'asds_01HTJ6EZ42YHJT3CY7SK8N2WW6',
			},
			{
				where: 'attr_01GW2HHFVMKTFWCKBVVFJ5GMY0',
				schemaId: 'asds_01HTJ6EZ42TRHK12DVNDK8ZT02',
			},
			{
				where: 'attr_01GW2HHFVMSX7T1WDNZ5QEHKWT',
				schemaId: 'asds_01HTJ6EZ42KNM6A4BC02PXZFJH',
			},
			{
				where: 'attr_01H6PRPT32KX1JPGJSHAF2D89C',
				schemaId: 'asds_01HTJ6EZ42GGZJ0R4S73T5KCNK',
			},
			{
				where: 'attr_01GW2HHFVMMF19AX2KPBTMV6P3',
				schemaId: 'asds_01HTJ6EZ42HTHRFAH0JDC2ZXG1',
			},
			{
				where: 'attr_01H6PRPTWRS80XFM77EMHKZ787',
				schemaId: 'asds_01HTJ6EZ42V93736GW3DPM34V8',
			},
		]

		const updateDefinitions = await prisma.$transaction([
			...updateData.map(({ where, schemaId }) =>
				prisma.attribute.update({
					where: { id: where },
					data: { requiredSchemaId: schemaId },
				})
			),
			prisma.attributeSupplementDataSchema.update({
				where: { id: 'asds_01GYX872BWWCGTZREHDT2AFF9D' },
				data: { schema: JsonInputOrNull.parse(zodToJsonSchema(numMinMaxOrRange)) },
			}),
		])
		log(`Updated ${updateDefinitions.length} Attribute records.`)

		/**
		 * DO NOT REMOVE BELOW
		 *
		 * This writes a record to the DB to register that this migration has run successfully.
		 */
		await jobPostRunner(jobDef)
	},
	def: jobDef,
} satisfies MigrationJob

type UpdateData = {
	where: string
	schemaId: string
}
