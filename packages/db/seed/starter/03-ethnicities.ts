import { Subscriber } from 'rxjs'

import { prisma } from '~/client'

import { generateEthnicities } from '../data/ethnicity'
import { logFile } from '../logger'

export const seedEthnicities = async (subscriber: Subscriber<string>) => {
	try {
		const queue = await generateEthnicities()
		let i = 1
		for (const item of queue) {
			logFile.log(
				`(${i}/${queue.length}) Upserting Ethnicity: (${item.create.language?.connect?.localeCode}) ${item.create.ethnicity}`
			)
			subscriber.next(
				`(${i}/${queue.length}) Upserting Ethnicity: (${item.create.language?.connect?.localeCode}) ${item.create.ethnicity}`
			)
			await prisma.userEthnicity.upsert(item)
			i++
		}
		subscriber.complete()
	} catch (err) {
		throw subscriber.error(err)
	}
}
