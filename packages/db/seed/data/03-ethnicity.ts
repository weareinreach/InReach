import { Prisma, UserEthnicity } from '@prisma/client'

import { prisma } from '~/index'

import { logFile } from '../logger'
import { ListrTask } from '../starterData'
import { keySlug } from './00-namespaces'
import { translationNamespace } from './01-user'

type EthnicityData = string[]

const ethnicityData: EthnicityData = [
	'Black',
	'Middle Eastern/North African',
	'Asian',
	'Latino/a/x/Hispanic',
	'South Asian',
	'Biracial/Multiracial',
	'American Indian/Native American/Indigenous Person',
	'Native Hawaiian/Pacific Islander',
	'White',
	'Other',
	'Prefer not to say',
]

export const generateEthnicityRecords = (task: ListrTask) => {
	const queue: Prisma.Prisma__UserEthnicityClient<Partial<UserEthnicity>>[] = []
	let i = 1
	for (const item of ethnicityData) {
		const transaction = prisma.userEthnicity.upsert({
			where: {
				ethnicity: item,
			},
			create: {
				ethnicity: item,
				key: {
					create: {
						key: `eth-${keySlug(item)}`,
						text: item,
						namespace: {
							connect: {
								name: translationNamespace,
							},
						},
					},
				},
			},
			update: {
				key: {
					update: {
						key: `eth-${keySlug(item)}`,
						text: item,
					},
				},
			},
			select: {
				id: true,
			},
		})

		queue.push(transaction)
		const logMessage = `(${i}/${ethnicityData.length}) Added Ethnicity transaction to queue: ${item}`
		logFile.log(logMessage)
		task.output = logMessage
		i++
	}
	return queue
}
