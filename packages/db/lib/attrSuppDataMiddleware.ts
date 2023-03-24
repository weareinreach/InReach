import { Prisma } from '@prisma/client'
import superjson from 'superjson'
import { SuperJSONResult } from 'superjson/dist/types'

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

const processRead = (data: unknown) => {
	if (isSuperJSON(data)) {
		return superjson.deserialize(data)
	}
	return superjson.parse(JSON.stringify(data))
}
const processWrite = (data: unknown) => {
	if (data === Prisma.DbNull || data === Prisma.JsonNull) {
		return data
	}
	return superjson.serialize(data)
}

const processData = (data: unknown, action: Prisma.PrismaAction) =>
	actions.read.includes(action) ? processRead(data) : processWrite(data)

export const attrSuppDataMiddleware: Prisma.Middleware = async (params, next) => {
	const start = Date.now()
	if (params.model === 'AttributeSupplement') {
		const { args, action } = params
		if (actions.write.includes(action)) {
			if (Array.isArray(args.data)) {
				args.data.map((record: Record<string, unknown>) =>
					record.data ? { ...record, data: processData(record.data, action) } : record
				)
			} else if (args.data.data) {
				args.data.data = processData(args.data.data, action)
			}
			const end = Date.now()
			console.log(`Attribute Supplement Middleware: ${action} ${end - start}ms (Array)`)
			return next(params)
		} else if (actions.read.includes(action)) {
			let result = await next(params)
			if (Array.isArray(result)) {
				result = result.map((record) =>
					record.data ? { ...record, data: processData(record.data, action) } : record
				)
			} else if (result.data) {
				result.data = processData(result.data, action)
			}
			const end = Date.now()
			console.log(`Attribute Supplement Middleware: ${action} ${end - start}ms`)
			return result
		}
	}
}
