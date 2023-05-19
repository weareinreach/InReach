import { type Prisma } from '@prisma/client'
import compact from 'just-compact'
import { Listr, ListrTaskEventType, PRESET_TIMER } from 'listr2'
import prettybytes from 'pretty-bytes'
import { stringify } from 'superjson'

import fs from 'fs'
import path from 'path'

import { prisma } from '~db/.'
import { createLogger } from '~db/prisma/jobPreRun'

import { orgDataSchema } from './!DataTypes'

const sourceFile = fs.readFileSync(
	path.resolve(__dirname, '../../../', './datastore/out-data/2023-05-18/orgs.json'),
	'utf-8'
)
const data = orgDataSchema.parse(JSON.parse(sourceFile))

const outFile = path.resolve(__dirname, './data.json')
const exceptionFile = path.resolve(__dirname, './exceptions.json')

const jobTitle = 'Generate Data'
const totalRecords = data.length
const padding = totalRecords.toString().length
const padZeros = (str: string | number) => str.toString().padStart(padding, '0')
const padSpaces = (str: string) => str.padStart(str.length + padding * 2 + 4, ' ')

const lookupArgs = (ids: Set<string>) => ({
	where: { legacyId: { in: [...ids] } },
	select: { id: true, legacyId: true, published: true, deleted: true },
})

const jobs = new Listr(
	[
		{
			title: jobTitle,
			task: async (_ctx, task) => {
				createLogger(task, '2023-05-18_generate-data')

				const recordIds: Record<keyof DataOutput, Set<string>> = {
					organization: new Set(),
					orgEmail: new Set(),
					orgLocation: new Set(),
					orgPhone: new Set(),
					orgService: new Set(),
				}
				task.output = `Records in:`
				task.output = `  Organizations: ${recordIds.organization.size}`
				task.output = `  Emails: ${recordIds.orgEmail.size}`
				task.output = `  Locations: ${recordIds.orgLocation.size}`
				task.output = `  Phones: ${recordIds.orgPhone.size}`
				task.output = `  Services: ${recordIds.orgService.size}`

				for (const record of data) {
					const { emails, locations, phones, services } = record
					recordIds.organization.add(record._id.$oid)
					emails.forEach(({ _id }) => recordIds.orgEmail.add(_id.$oid))
					locations.forEach(({ _id }) => recordIds.orgLocation.add(_id.$oid))
					phones.forEach(({ _id }) => recordIds.orgPhone.add(_id.$oid))
					services.forEach(({ _id }) => recordIds.orgService.add(_id.$oid))
				}

				const existingData = {
					organization: await prisma.organization.findMany(lookupArgs(recordIds.organization)),
					orgEmail: await prisma.orgEmail.findMany(lookupArgs(recordIds.orgEmail)),
					orgLocation: await prisma.orgLocation.findMany(lookupArgs(recordIds.orgLocation)),
					orgPhone: await prisma.orgPhone.findMany(lookupArgs(recordIds.orgPhone)),
					orgService: await prisma.orgService.findMany(lookupArgs(recordIds.orgService)),
				}
				task.output = `Existing records to compare:`
				task.output = `  Organizations: ${existingData.organization.length}`
				task.output = `  Emails: ${existingData.orgEmail.length}`
				task.output = `  Locations: ${existingData.orgLocation.length}`
				task.output = `  Phones: ${existingData.orgPhone.length}`
				task.output = `  Services: ${existingData.orgService.length}`

				const output: DataOutput = {
					organization: [],
					orgEmail: [],
					orgLocation: [],
					orgPhone: [],
					orgService: [],
				}
				const exceptions: { legacyId: string; name: string }[] = []
				let i = 1

				for (const record of data) {
					const { emails, locations, phones, services } = record
					task.title = `${jobTitle} [${padZeros(i)}/${totalRecords}] - ${record.name}`
					task.output = `[${padZeros(i)}/${totalRecords}] ${record.name}`

					const existingOrg = existingData.organization.find(({ legacyId }) => record._id.$oid === legacyId)
					if (!existingOrg) {
						exceptions.push({ legacyId: record._id.$oid, name: record.name })
						continue
					}

					if (existingOrg.deleted !== record.is_deleted || existingOrg.published !== record.is_published) {
						output.organization.push({
							where: { legacyId: record._id.$oid },
							data: {
								...(existingOrg.published === record.is_published
									? {}
									: {
											published:
												record.is_published === undefined || record.is_published === null
													? false
													: record.is_published,
									  }),
								...(existingOrg.deleted === record.is_deleted
									? {}
									: {
											deleted:
												record.is_deleted === undefined || record.is_deleted === null
													? false
													: record.is_deleted,
									  }),
							},
						})
						task.output = padSpaces(`Added organization record`)
					}

					const orgEmails = compact(
						emails.map(({ _id, show_on_organization }) => {
							const existingRecord = existingData.orgEmail.find(({ legacyId }) => _id.$oid === legacyId)
							if (!existingRecord || existingRecord?.published === show_on_organization) {
								return
							}

							return {
								where: { legacyId: _id.$oid },
								data: {
									published:
										show_on_organization === undefined || show_on_organization === null
											? false
											: show_on_organization,
								},
							}
						})
					)
					task.output = padSpaces(`Email records: ${orgEmails.length}`)
					output.orgEmail.push(...orgEmails)

					const orgLocations = compact(
						locations.map(({ _id, show_on_organization }) => {
							const existingRecord = existingData.orgLocation.find(({ legacyId }) => _id.$oid === legacyId)
							if (!existingRecord || existingRecord?.published === show_on_organization) {
								return
							}

							return {
								where: { legacyId: _id.$oid },
								data: {
									published:
										show_on_organization === undefined || show_on_organization === null
											? false
											: show_on_organization,
								},
							}
						})
					)
					task.output = padSpaces(`Location records: ${orgLocations.length}`)
					output.orgLocation.push(...orgLocations)

					const orgPhones = compact(
						phones.map(({ _id, show_on_organization }) => {
							const existingRecord = existingData.orgPhone.find(({ legacyId }) => _id.$oid === legacyId)
							if (!existingRecord || existingRecord?.published === show_on_organization) {
								return
							}

							return {
								where: { legacyId: _id.$oid },
								data: {
									published:
										show_on_organization === undefined || show_on_organization === null
											? false
											: show_on_organization,
								},
							}
						})
					)
					task.output = padSpaces(`Phone records: ${orgPhones.length}`)
					output.orgPhone.push(...orgPhones)

					const orgServices = compact(
						services.map(({ _id, is_deleted, is_published }) => {
							const existingRecord = existingData.orgService.find(({ legacyId }) => _id.$oid === legacyId)
							if (
								!existingRecord ||
								(existingRecord?.published === is_published && existingRecord?.deleted === is_deleted)
							) {
								return
							}

							return {
								where: { legacyId: _id.$oid },
								data: {
									...(existingOrg.published === is_published
										? {}
										: {
												published: is_published === undefined || is_published === null ? false : is_published,
										  }),
									...(existingOrg.deleted === is_deleted
										? {}
										: {
												deleted: is_deleted === undefined || is_deleted === null ? false : is_deleted,
										  }),
								},
							}
						})
					)
					task.output = padSpaces(`Service records: ${orgServices.length}`)
					output.orgService.push(...orgServices)

					i++
				}
				task.output = `Total records to update:`
				task.output = `  Organizations: ${output.organization.length}`
				task.output = `  Emails: ${output.orgEmail.length}`
				task.output = `  Locations: ${output.orgLocation.length}`
				task.output = `  Phones: ${output.orgPhone.length}`
				task.output = `  Services: ${output.orgService.length}`

				task.title = `${jobTitle} - Writing files...`
				task.output = `Writing pending updates to file`
				fs.writeFileSync(outFile, stringify(output))
				const fileStats = fs.statSync(outFile)
				task.output = `${outFile} written! (${prettybytes(fileStats.size)})`
				if (exceptions.length) {
					task.output = `Writing exceptions to file (${exceptions.length} records)`
					fs.writeFileSync(exceptionFile, JSON.stringify(exceptions, undefined, 2))
					const stats = fs.statSync(exceptionFile)
					task.output = `${exceptionFile} written! (${prettybytes(stats.size)})`
				}
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
