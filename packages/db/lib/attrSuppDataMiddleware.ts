import { Prisma } from '@prisma/client'
import superjson from 'superjson'
import { SuperJSONResult } from 'superjson/dist/types'
import { z } from 'zod'

import { AttributeSupplementSchema, NullableJsonValue } from '../zod-schemas'

const ResultSchema = z
	.object({
		data: z.any(),
	})
	.passthrough()
type Results = z.infer<typeof ResultSchema>

const ArgsSchema = z
	.object({
		data: AttributeSupplementSchema,
	})
	.passthrough()
type ArgsRecord = z.infer<typeof ArgsSchema>

const ArgsSchemaArr = z
	.object({
		data: AttributeSupplementSchema.array(),
	})
	.passthrough()
type ArgsRecordArr = z.infer<typeof ArgsSchemaArr>

const actions: ActionMap = {
	readOne: ['delete', 'findFirst', 'findUnique'],
	writeOne: ['create', 'update', 'upsert'],
	readMany: ['deleteMany', 'findMany'],
	writeMany: ['createMany', 'updateMany'],
	read: ['delete', 'findFirst', 'findUnique', 'deleteMany', 'findMany'],
	write: ['create', 'update', 'upsert', 'createMany', 'updateMany'],
}
type ActionKeys = 'read' | 'write' | 'readOne' | 'writeOne' | 'readMany' | 'writeMany'

type ActionMap = {
	[k in ActionKeys]: Prisma.PrismaAction[]
}

const isSuperJSON = (data: unknown): data is SuperJSONResult =>
	typeof data === 'object' && data !== null && Object.hasOwn(data, 'json')

// const isSuppRecord = (data: unknown): data is z.infer<typeof AttributeSupplementSchema> =>
// AttributeSupplementSchema.safeParse(data).success
const isSuppArgs = (args: unknown): args is ArgsRecord => ArgsSchema.safeParse(args).success
const isSuppArgsArr = (args: unknown): args is ArgsRecordArr => ArgsSchemaArr.safeParse(args).success
const hasSuppData = (result: unknown): result is Results => ResultSchema.safeParse(result).success
const hasSuppDataArr = (result: unknown): result is Results[] =>
	ResultSchema.array().safeParse(result).success

const processRead = (data?: z.infer<typeof NullableJsonValue>) => {
	if (isSuperJSON(data)) {
		return superjson.deserialize(data)
	}
	return superjson.parse(JSON.stringify(data))
}
const processWrite = (data?: z.infer<typeof NullableJsonValue>) => {
	if (data === Prisma.DbNull || data === Prisma.JsonNull) {
		return data
	}
	return superjson.serialize(data) as unknown as z.infer<typeof NullableJsonValue>
}

const processData = (data: z.infer<typeof NullableJsonValue> | undefined, action: Prisma.PrismaAction) =>
	actions.read.includes(action) ? processRead(data) : processWrite(data)

export const attrSuppDataMiddleware: Prisma.Middleware = async (params, next) => {
	const start = Date.now()
	if (params.model === 'AttributeSupplement') {
		const { args, action } = params
		if (actions.write.includes(action)) {
			if (isSuppArgsArr(args)) {
				args.data = args.data.map((record) =>
					record.data ? { ...record, data: processWrite(record.data) } : record
				)
			} else if (isSuppArgs(args)) {
				args.data.data = processWrite(args.data.data)
			}
			const end = Date.now()
			console.log(`Attribute Supplement Middleware: ${action} ${end - start}ms (Array)`)
			return next({ ...params, args })
		} else if (actions.read.includes(action)) {
			let result = await next(params)
			if (hasSuppDataArr(result)) {
				result = result.map((record) =>
					typeof record === 'object' && Object.hasOwn(record, 'data')
						? { ...record, data: processData(record.data, action) }
						: record
				)
			} else if (hasSuppData(result)) {
				result.data = processData(result.data, action)
			}
			const end = Date.now()
			console.log(`Attribute Supplement Middleware: ${action} ${end - start}ms`)
			return result
		}
	}
	return next(params)
}
