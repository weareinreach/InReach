import dotenv from 'dotenv'
import fs from 'fs'
import { ListrTask } from 'lib/generate'

import { prisma } from '@weareinreach/db'
import type { NavItem } from '@weareinreach/ui/components/layout'

dotenv.config()

export const generateNavigation = async (task: ListrTask) => {
	const data = await prisma.navigation.findMany({
		select: {
			href: true,
			key: {
				select: { key: true },
			},
		},
	})
	let logMessage = ''
	const output: NavItem[] = []
	for (const record of data) {
		const {
			href,
			key: { key },
		} = record
		output.push({ key, href: href ?? '' })
	}
	logMessage = `navigation.json generated with ${output.length} items`
	fs.writeFileSync(`src/data/navigation.json`, JSON.stringify(output, null, 2))
	task.output = logMessage
	task.title = `Navigation [${output.length} items]`
}
