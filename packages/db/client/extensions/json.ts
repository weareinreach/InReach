import { Prisma } from '@prisma/client'

import { isSuperJSONResult, superjson } from '@weareinreach/util/transformer'
import { JsonInputOrNullSuperJSON } from '~db/zod_util/prismaJson'

const deserialize = (data: unknown) => (isSuperJSONResult(data) ? superjson.deserialize(data) : data)

const processData = <T>(data: T) => (data ? JsonInputOrNullSuperJSON.parse(data) : data)

export const jsonExtension = Prisma.defineExtension({
	name: 'SuperJSON Serializer',
	result: {
		attributeSupplement: {
			data: {
				needs: { data: true },
				compute({ data }) {
					return deserialize(data)
				},
			},
		},
		suggestion: {
			data: {
				needs: { data: true },
				compute({ data }) {
					return deserialize(data)
				},
			},
		},
	},
	query: {
		attributeSupplement: {
			create({ args, query }) {
				args.data.data = processData(args.data.data)
				return query(args)
			},
			createMany({ args, query }) {
				args.data = Array.isArray(args.data) ? args.data : [args.data]
				for (const item of args.data) {
					item.data = processData(item.data)
				}
				return query(args)
			},
			update({ args, query }) {
				args.data.data = processData(args.data.data)
				return query(args)
			},
			updateMany({ args, query }) {
				args.data.data = processData(args.data.data)
				return query(args)
			},
			upsert({ args, query }) {
				args.create.data = processData(args.create.data)
				args.update.data = processData(args.update.data)
				return query(args)
			},
		},
		suggestion: {
			create({ args, query }) {
				args.data.data = processData(args.data.data)
				return query(args)
			},
			createMany({ args, query }) {
				args.data = Array.isArray(args.data) ? args.data : [args.data]
				for (const item of args.data) {
					item.data = processData(item.data)
				}
				return query(args)
			},
			update({ args, query }) {
				args.data.data = processData(args.data.data)
				return query(args)
			},
			updateMany({ args, query }) {
				args.data.data = processData(args.data.data)
				return query(args)
			},
			upsert({ args, query }) {
				args.create.data = processData(args.create.data)
				args.update.data = processData(args.update.data)
				return query(args)
			},
		},
	},
})
