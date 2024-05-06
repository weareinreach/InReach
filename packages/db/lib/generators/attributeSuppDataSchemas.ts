import { type JsonSchemaObject, jsonSchemaToZod } from 'json-schema-to-zod'

import { type Context, type ListrTask } from '~db/lib/generateData'

export const generateDataSchemas = async (ctx: Context, task: ListrTask) => {
	const { prisma, writeOutput } = ctx
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

	export const isAttributeSupplementSchema = (schema?: string | null): schema is AttributeSupplementSchemas => typeof schema === 'string' && schema in attributeSupplementSchema

	export type AttributeSupplementSchemas = keyof typeof attributeSupplementSchema
	`
	await writeOutput('attributeSupplementSchema', out)
	task.title = `${task.title} (${data.length} items)`
}
