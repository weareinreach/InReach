import { prisma } from '../../index'
import { generateEthnicities } from '../data/ethnicity'

export const seedEthnicities = async () => {
	const queue = await generateEthnicities()
	let i = 1
	for (const item of queue) {
		console.log(
			`(${i}/${queue.length}) Upserting Ethnicity: (${item.create.language?.connect?.langCode}) ${item.create.ethnicity}`
		)
		await prisma.userEthnicity.upsert(item)
		i++
	}
}
