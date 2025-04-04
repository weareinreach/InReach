import { type Context, type ListrTask } from '~db/lib/generateData'

export const generateUserTypes = async (ctx: Context, task: ListrTask) => {
	const { prisma, writeOutput } = ctx
	const userTypes = await prisma.userType.findMany({
		select: {
			id: true,
			type: true,
		},
		orderBy: { type: 'asc' },
	})

	const typeNames = userTypes.map((record) => record.type)

	const out = `
	export const userTypes = ${JSON.stringify(typeNames)} as const
	\n
	export const userTypesWithId = ${JSON.stringify(userTypes)} as const
	\n
	export type UserTypeTags = typeof userTypes[number]
	\n
	export type UserTypesWithId = typeof userTypesWithId[number]
	`
	await writeOutput('userType', out)
	task.title = `${task.title} (${userTypes.length} items)`
}
