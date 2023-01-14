/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { prisma } from '~/index'
import { permissionData } from '~/seed/data'
import { logFile } from '~/seed/logger'
import { ListrTask } from '~/seed/starterData'

export const seedPermissions = async (task: ListrTask) => {
	let count = 1
	const total = permissionData.length
	for (const permission of permissionData) {
		const logMessage = permission.description
			? `[${count}/${total}] Adding permission to queue: ${permission.name} (${permission.description})`
			: `[${count}/${total}] Adding permission to queue: ${permission.name}`
		task.output = logMessage
		logFile.info(logMessage)
		count++
	}

	const result = await prisma.permission.createMany({
		data: permissionData,
		skipDuplicates: true,
	})
	task.title = `Permissions (${result.count} created, ${total - result.count} skipped as duplicate)`
}
