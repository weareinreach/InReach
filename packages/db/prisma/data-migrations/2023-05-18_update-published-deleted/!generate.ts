import { type Prisma } from '@prisma/client'
import { Listr, ListrTaskEventType, PRESET_TIMER } from 'listr2'
import prettybytes from 'pretty-bytes'
import { stringify } from 'superjson'

import fs from 'fs'
import path from 'path'

import { createLogger } from '~db/prisma/jobPreRun'

import { orgDataSchema } from './!DataTypes'

const sourceFile = fs.readFileSync(
	path.resolve(__dirname, '../../../', './datastore/out-data/2023-05-18/orgs.json'),
	'utf-8'
)
const data = orgDataSchema.parse(JSON.parse(sourceFile))

const outFile = path.resolve(__dirname, './data.json')

const jobTitle = 'Generate Data'
const totalRecords = data.length
const padding = totalRecords.toString().length
const padZeros = (str: string | number) => str.toString().padStart(padding, '0')
const padSpaces = (str: string) => str.padStart(str.length + padding * 2 + 4, ' ')

const jobs = new Listr(
	[
		{
			title: jobTitle,
			task: (_ctx, task) => {
				createLogger(task, '2023-05-18_generate-data')
				const output: DataOutput = {
					organization: [],
					orgEmail: [],
					orgLocation: [],
					orgPhone: [],
					orgService: [],
				}
				let i = 1

				for (const record of data) {
					const { emails, locations, phones, services } = record
					task.title = `${jobTitle} [${padZeros(i)}/${totalRecords}] - ${record.name}`

					output.organization.push({
						where: { legacyId: record._id.$oid },
						data: { published: record.is_published, deleted: record.is_deleted },
					})
					task.output = `[${padZeros(i)}/${totalRecords}] ${record.name}`
					const orgEmails = emails.map(({ _id, show_on_organization }) => ({
						where: { legacyId: _id.$oid },
						data: { published: show_on_organization },
					}))
					task.output = padSpaces(`Email records: ${orgEmails.length}`)
					output.orgEmail.push(...orgEmails)

					const orgLocations = locations.map(({ _id, show_on_organization }) => ({
						where: { legacyId: _id.$oid },
						data: { published: show_on_organization },
					}))
					task.output = padSpaces(`Location records: ${orgLocations.length}`)
					output.orgLocation.push(...orgLocations)

					const orgPhones = phones.map(({ _id, show_on_organization }) => ({
						where: { legacyId: _id.$oid },
						data: { published: show_on_organization },
					}))
					task.output = padSpaces(`Phone records: ${orgPhones.length}`)
					output.orgPhone.push(...orgPhones)

					const orgServices = services.map(({ _id, is_deleted, is_published }) => ({
						where: { legacyId: _id.$oid },
						data: { published: is_published, deleted: is_deleted },
					}))
					task.output = padSpaces(`Service records: ${orgServices.length}`)
					output.orgService.push(...orgServices)

					i++
				}
				task.title = `${jobTitle} - Writing file...`
				task.output = `Writing to file`
				fs.writeFileSync(outFile, stringify(output))
				const fileStats = fs.statSync(outFile)
				task.output = `${outFile} written! (${prettybytes(fileStats.size)})`
				task.title = jobTitle
				task.task.off(ListrTaskEventType.OUTPUT)
			},
			options: { bottomBar: 10, persistentOutput: true },
		},
	],
	{
		rendererOptions: {
			formatOutput: 'wrap',
			timer: PRESET_TIMER,
		},
		fallbackRendererOptions: {
			timer: PRESET_TIMER,
		},
	}
)
jobs.run()

export interface DataOutput {
	organization: Prisma.OrganizationUpdateArgs[]
	orgEmail: Prisma.OrgEmailUpdateArgs[]
	orgLocation: Prisma.OrgLocationUpdateArgs[]
	orgPhone: Prisma.OrgPhoneUpdateArgs[]
	orgService: Prisma.OrgServiceUpdateArgs[]
}
