import { prisma } from '~/index'

import { logFile } from '../logger'
import { ListrTask } from '../starterData'
import { keySlug, namespaces } from './00-namespaces'

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
	const queue = ethnicityData.map((item, i) => {
		const logMessage = `(${i}/${ethnicityData.length}) Added Ethnicity transaction to queue: ${item}`
		logFile.log(logMessage)
		task.output = logMessage

		return prisma.userEthnicity.upsert({
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
								name: namespaces.user,
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
		})
	})

	return queue
}
