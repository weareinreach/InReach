import { type JsonSchemaObject, jsonSchemaToZod } from 'json-schema-to-zod'

import { prisma } from '~db/client'
import { type ListrTask } from '~db/lib/generateData'

import { writeOutput } from './common'

export const generateDataSchemas = async (task: ListrTask) => {
	const data = await prisma.attributeSupplementDataSchema.findMany({
		where: {
			active: true,
		},
		select: {
			tag: true,
			schema: true,
		},
		orderBy: { tag: 'asc' },
	})
	const schemas = data.map(({ tag, schema }) => {
		return `"${tag}": ${jsonSchemaToZod(schema as JsonSchemaObject)},`
	})

	const out = `
	import { z } from 'zod';
	export const attributeSupplementSchema = {
		${schemas.join('\n')}
	}

	export const isAttributeSupplementSchema = (schema: string): schema is AttributeSupplementSchemas => Object.keys(attributeSupplementSchema).includes(schema)

	export type AttributeSupplementSchemas = keyof typeof attributeSupplementSchema
	`
	await writeOutput('attributeSupplementSchema', out)
	task.title = `${task.title} (${data.length} items)`
}
