import { Prisma, UserEthnicity } from '@prisma/client'

import { prisma } from '~/index'

import { logFile } from '../logger'
import { ListrTask } from '../starter'
import { keySlug } from './namespaces'
import { connectUser, translationNamespace } from './user'

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
]

export const generateEthnicityRecords = (task: ListrTask) => {
	const queue: Prisma.Prisma__UserEthnicityClient<UserEthnicity>[] = []
	let i = 1
	for (const item of ethnicityData) {
		const transaction: Prisma.Prisma__UserEthnicityClient<UserEthnicity> = prisma.userEthnicity.upsert({
			where: {
				ethnicity: item,
			},
			create: {
				ethnicity: item,
				translationKey: {
					create: {
						key: `eth-${keySlug(item)}`,
						text: item,
						namespace: {
							connect: {
								name: translationNamespace,
							},
						},
						createdBy: connectUser,
						updatedBy: connectUser,
					},
				},
				createdBy: connectUser,
				updatedBy: connectUser,
			},
			update: {
				updatedBy: connectUser,
				translationKey: {
					update: {
						key: `eth-${keySlug(item)}`,
						text: item,
						updatedBy: connectUser,
					},
				},
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
