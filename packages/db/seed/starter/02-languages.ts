import { Subscriber } from 'rxjs'

import { prisma } from '~/client'

import { seedLanguageData } from '../data/languages'
import { logFile } from '../logger'

export const seedLanguages = async (subscriber: Subscriber<string>) => {
	try {
		let i = 1
		for (const item of seedLanguageData) {
			logFile.log(`(${i}/${seedLanguageData.length}) Upserting Language: ${item.create.languageName}`)
			subscriber.next(`(${i}/${seedLanguageData.length}) Upserting Language: ${item.create.languageName}`)
			await prisma.language.upsert(item)
			i++
		}
		subscriber.complete()
	} catch (err) {
		throw subscriber.error(err)
	}
}
