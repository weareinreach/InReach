import { Prisma } from '~db/index'

const numMinMaxOrRange = {
	anyOf: [
		{
			type: 'object',
			properties: { min: { type: 'number' } },
			required: ['min'],
		},
		{
			type: 'object',
			properties: { max: { type: 'number' } },
			required: ['max'],
		},
		{
			type: 'object',
			properties: {
				min: { type: 'number' },
				max: { type: 'number' },
			},
			required: ['min', 'max'],
		},
	],
	$schema: 'http://json-schema.org/draft-07/schema#',
}

const numRange = {
	type: 'object',
	properties: {
		min: { type: 'number' },
		max: { type: 'number' },
	},
	required: ['min', 'max'],
	$schema: 'http://json-schema.org/draft-07/schema#',
}

const accessInstructions = {
	type: 'object',
	properties: {
		access_value: { type: ['string', 'null'] },
		access_type: {
			type: 'string',
			enum: ['email', 'file', 'link', 'location', 'other', 'phone'],
		},
		instructions: { type: 'string' },
	},
	required: ['access_type', 'instructions'],
	$schema: 'http://json-schema.org/draft-07/schema#',
}
const numMax = {
	type: 'object',
	properties: {
		max: { type: 'number' },
	},
	required: ['max'],
	$schema: 'http://json-schema.org/draft-07/schema#',
}
const numMin = {
	type: 'object',
	properties: {
		min: { type: 'number' },
	},
	required: ['min'],
	$schema: 'http://json-schema.org/draft-07/schema#',
}
const number = {
	type: 'object',
	properties: {
		num: { type: 'number' },
	},
	required: ['num'],
	$schema: 'http://json-schema.org/draft-07/schema#',
}
const incompatibleData = {
	type: 'array',
	items: { type: 'object', additionalProperties: {} },
	$schema: 'http://json-schema.org/draft-07/schema#',
}
const otherDescribe = {
	type: 'object',
	properties: {
		other: { type: 'string' },
	},
	required: ['other'],
	$schema: 'http://json-schema.org/draft-07/schema#',
}

export const schemas: Prisma.AttributeSupplementDataSchemaCreateInput[] = [
	{
		definition: numMinMaxOrRange,
		tag: 'numMinMaxOrRange',
		name: 'Number - Min, Max, or Range',
		id: 'asds_01GYX872BWWCGTZREHDT2AFF9D',
	},
	{
		definition: numRange,
		tag: 'numRange',
		name: 'Number - Range',
		id: 'asds_01GYX872BYZQ6CC344S1SWTJ97',
	},
	{
		definition: numMin,
		tag: 'numMin',
		name: 'Number - Min',
		id: 'asds_01GYX872BZE4TN1MJHMTGVAYZ0',
	},
	{
		definition: numMax,
		tag: 'numMax',
		name: 'Number - Max',
		id: 'asds_01GYX872BZNT0F6WH50XJQWM9G',
	},
	{
		definition: number,
		tag: 'number',
		name: 'Number',
		id: 'asds_01GYX872BZKJPVH6VHC0ABFH8A',
	},
	{
		definition: accessInstructions,
		tag: 'accessInstructions',
		name: 'Access Instructions',
		id: 'asds_01GYX872BZDD4V7Z94VVAQN7TJ',
	},
	{
		definition: incompatibleData,
		tag: 'incompatibleData',
		name: 'Data Migration - Incompatible data',
		id: 'asds_01GYX872BZSMTHYM4HYYTCENZM',
	},
	{
		definition: otherDescribe,
		tag: 'otherDescribe',
		name: 'Other - Describe',
		id: 'asds_01GYX872BZ7V6VQ3NE6KSVVRKH',
	},
]

export const schemaMapping: Prisma.AttributeUpdateManyArgs[] = [
	{
		where: {
			tag: { in: ['accessemail', 'accessfile', 'accesslink', 'accesslocation', 'accessphone'] },
		},
		data: {
			// accessInstructions
			requiredSchemaId: 'asds_01GYX872BZDD4V7Z94VVAQN7TJ',
		},
	},
	{
		where: {
			tag: { in: ['cost-fees', 'elig-age'] },
		},
		data: {
			// numMinMaxOrRange
			requiredSchemaId: 'asds_01GYX872BWWCGTZREHDT2AFF9D',
		},
	},
	{
		where: { tag: 'incompatible-info' },
		data: {
			// incompatible
			requiredSchemaId: 'asds_01GYX872BZSMTHYM4HYYTCENZM',
		},
	},
	{
		where: { tag: 'law-other' },
		data: {
			// otherDescribe
			requiredSchemaId: 'asds_01GYX872BZ7V6VQ3NE6KSVVRKH',
		},
	},
]
