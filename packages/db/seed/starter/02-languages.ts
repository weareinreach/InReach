import { prisma } from '../../index'
import { seedLanguageData } from '../data/languages'

export const seedLanguages = async () => {
	let i = 1
	for (const item of seedLanguageData) {
		console.log(`(${i}/${seedLanguageData.length}) Upserting Language: ${item.create.languageName}`)
		await prisma.language.upsert(item)
		i++
	}
}
