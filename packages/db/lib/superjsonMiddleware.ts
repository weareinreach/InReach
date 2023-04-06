import { Prisma } from '@prisma/client'
import superjson from 'superjson'
import { SuperJSONResult } from 'superjson/dist/types'
import { Logger } from 'tslog'
import { z } from 'zod'

import { NullableJsonValue } from '../zod-schemas'

const MODELS_TO_RUN: Prisma.ModelName[] = ['AttributeSupplement', 'Suggestion']

const logger = new Logger({ name: 'SuperJSON middleware', minLevel: 3 })

const ResultSchema = z
	.object({
		data: z.any(),
	})
	.passthrough()
type Results = z.infer<typeof ResultSchema>

const DataRecord = z
	.object({
		data: z
			.object({
				data: NullableJsonValue,
			})
			.passthrough(),
	})
	.passthrough()
type DataRecord = z.infer<typeof DataRecord>

const DataArray = z
	.object({
		data: z.array(
			z
				.object({
					data: NullableJsonValue,
				})
				.passthrough()
		),
	})
	.passthrough()
type DataArray = z.infer<typeof DataArray>

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

const hasSuppData = (result: unknown): result is Results => ResultSchema.safeParse(result).success
const hasSuppDataArr = (result: unknown): result is Results[] =>
	ResultSchema.array().safeParse(result).success

const hasJsonData = (data: unknown): data is DataRecord => DataRecord.safeParse(data).success
const hasJsonDataArr = (data: unknown): data is DataArray => DataArray.safeParse(data).success

const processRead = (data?: z.infer<typeof NullableJsonValue>) => {
	try {
		if (isSuperJSON(data)) {
			return superjson.deserialize(data)
		}
		const output = superjson.parse(JSON.stringify(data))
		return output ?? data
	} catch (err) {
		logger.error(err)
		return data
	}
}
const processWrite = (data?: z.infer<typeof NullableJsonValue>) => {
	if (data === Prisma.DbNull || data === Prisma.JsonNull) {
		return data
	}
	return superjson.serialize(data) as unknown as z.infer<typeof NullableJsonValue>
}

const processData = (data: z.infer<typeof NullableJsonValue> | undefined, action: Prisma.PrismaAction) =>
	actions.read.includes(action) ? processRead(data) : processWrite(data)

export const superjsonMiddleware: Prisma.Middleware = async (params, next) => {
	const start = Date.now()
	if (params.model && MODELS_TO_RUN.includes(params.model)) {
		const { args, action } = params
		if (actions.write.includes(action)) {
			if (hasJsonDataArr(args)) {
				args.data = args.data.map((record) =>
					record.data ? { ...record, data: processWrite(record.data) } : record
				)
			} else if (hasJsonData(args)) {
				args.data.data = processWrite(args.data.data)
			}
			const end = Date.now()
			logger.trace(`SuperJSON Middleware: ${action} ${end - start}ms (Array)`)
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
			logger.trace(`SuperJSON Middleware: ${action} ${end - start}ms`)
			return result
		}
	}
	return next(params)
}
