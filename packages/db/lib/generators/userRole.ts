import { type Context, type ListrTask } from '~db/lib/generateData'

export const generateUserRoles = async (ctx: Context, task: ListrTask) => {
	const { prisma, writeOutput } = ctx
	const roles = await prisma.userRole.findMany({
		select: {
			id: true,
			tag: true,
		},
		orderBy: { tag: 'asc' },
	})

	const roleNames = roles.map((role) => role.tag)

	const out = `
	export const userRoles = ${JSON.stringify(roleNames)} as const
	\n
	export const userRolesWithId = ${JSON.stringify(roles)} as const
	\n
	export type UserRoleTags = typeof userRoles[number]
	\n
	export type UserRolesWithId = typeof userRolesWithId[number]
	`
	await writeOutput('userRole', out)
	task.title = `${task.title} (${roles.length} items)`
}
