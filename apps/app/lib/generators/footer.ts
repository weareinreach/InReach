import { prisma } from '@weareinreach/db'
import { type FooterLink } from '@weareinreach/ui/components/layout/Footer'
import dotenv from 'dotenv'

import fs from 'fs'

import { ListrTask } from 'lib/generate'

dotenv.config()

export const generateFooterLinks = async (task: ListrTask) => {
	const data = await prisma.footerLink.findMany({
		select: {
			href: true,
			icon: true,
			key: {
				select: { key: true },
			},
		},
	})
	let logMessage = ''
	const output: FooterLink[] = []
	for (const record of data) {
		const {
			href,
			key: { key },
		} = record
		output.push({ key, href })
	}
	logMessage = `footer.json generated with ${output.length} items`
	fs.writeFileSync(`src/data/footer.json`, JSON.stringify(output, null, 2))
	task.output = logMessage
	task.title = `Footer Links [${output.length} items]`
}
