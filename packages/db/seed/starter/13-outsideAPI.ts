import { prisma } from '~db/index'
import { logFile } from '~db/seed/logger'
import { ListrTask } from '~db/seed/starterData'

export const seedOutsideAPI = async (task: ListrTask) => {
	const logMessage = 'Upserting Outside API Service record: foursquare'
	task.output = logMessage
	logFile.info(logMessage)

	await prisma.outsideAPIService.upsert({
		where: {
			service: 'foursquare',
		},
		create: {
			service: 'foursquare',
			description: 'Foursquare Photos',
			urlPattern: '',
		},
		update: {},
	})
	task.title = 'Outside API Services (1 record)'
}
