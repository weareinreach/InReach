import { prisma } from '@weareinreach/db'
import { type SocialMediaLink } from '@weareinreach/ui/components/layout/Footer'
import dotenv from 'dotenv'

import fs from 'fs'

import { ListrTask } from 'lib/generate'

dotenv.config()

export const generateSocialMediaLinks = async (task: ListrTask) => {
	const data = await prisma.socialMediaLink.findMany({
		select: {
			href: true,
			icon: true,
			service: {
				select: { name: true },
			},
		},
	})
	let logMessage = ''
	const output: SocialMediaLink[] = []
	for (const record of data) {
		const {
			href,
			service: { name: key },
		} = record
		const icon = record.icon
		output.push({ key, href, icon })
	}
	logMessage = `socialMedia.json generated with ${output.length} items`
	fs.writeFileSync(`src/data/socialMedia.json`, JSON.stringify(output, null, 2))
	task.output = logMessage
	task.title = `Social Media Links [${output.length} items]`
}
