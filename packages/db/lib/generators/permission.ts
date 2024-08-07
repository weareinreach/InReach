import { type Context, type ListrTask } from '~db/lib/generateData'

export const generatePermissions = async (ctx: Context, task: ListrTask) => {
	const { prisma, writeOutput } = ctx
	const permissions = await prisma.permission.findMany({
		select: {
			name: true,
		},
		orderBy: { name: 'asc' },
	})
	const permArray = permissions.map((perm) => perm.name)

	const out = `export const permissions = ${JSON.stringify(
		permArray
	)} as const\n\nexport type Permission = typeof permissions[number]`

	await writeOutput('permission', out)

	task.title = `${task.title} (${permArray.length} items)`
}
