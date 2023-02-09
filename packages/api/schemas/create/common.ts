import { GenerateAuditLog } from './auditLog'

export const createMany = <T extends Array<any>>(data: T) => ({
	createMany: {
		data,
		skipDuplicates: true,
	},
})
export const createManyOrUndefined = <T extends Array<any> | undefined>(data: T) =>
	!data
		? undefined
		: {
				createMany: {
					data,
					skipDuplicates: true,
				},
		  }

export const createManyWithAudit = <T extends Array<any> | undefined>(data: T, actorId: string) =>
	!data
		? undefined
		: {
				create: data.map((record) => ({
					...record,
					auditLogs: GenerateAuditLog({ actorId, operation: 'CREATE', to: record }),
				})),
		  }
