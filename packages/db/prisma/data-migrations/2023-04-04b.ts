import { prisma, Prisma } from '~db/index'
import { batchRunner } from '~db/prisma/batchRunner'
import { type ListrJob, type ListrTask } from '~db/prisma/dataMigrationRunner'
import { jobPreRunner, type JobDef } from '~db/prisma/jobPreRun'

const jobDef: JobDef = {
	jobId: '2022-04-04-single-location-links',
	title: 'Single location orgs - link fields to location',
	createdBy: 'Joe Karow',
}

const job: ListrTask = async (_ctx, task) => {
	const runJob = await jobPreRunner(jobDef)
	if (!runJob) {
		return task.skip(`${jobDef.jobId} - Migration has already been run.`)
	}
	const orgs = await prisma.organization.findMany({
		select: {
			id: true,
			locations: { select: { id: true } },
			emails: { select: { orgEmailId: true } },
			hours: { select: { id: true } },
			phones: { select: { phoneId: true } },
			socialMedia: { select: { id: true } },
			services: { select: { id: true } },
			serviceAreas: { select: { id: true } },
			photos: { select: { id: true } },
		},
	})
	const orgLocationEmail: Prisma.OrgLocationEmailCreateManyInput[] = []
	const orgLocationPhone: Prisma.OrgLocationPhoneCreateManyInput[] = []
	const orgLocationService: Prisma.OrgLocationServiceCreateManyInput[] = []
	const serviceAreas: Prisma.ServiceAreaUpdateManyArgs[] = []
	const orgHours: Prisma.OrgHoursUpdateManyArgs[] = []

	for (const org of orgs) {
		if (org.locations.length !== 1) continue
		const orgLocationId = org.locations[0]?.id
		if (!orgLocationId) continue

		orgLocationEmail.push(...org.emails.map(({ orgEmailId }) => ({ orgLocationId, orgEmailId })))
		orgLocationPhone.push(...org.phones.map(({ phoneId }) => ({ orgLocationId, phoneId })))
		orgLocationService.push(...org.services.map(({ id: serviceId }) => ({ orgLocationId, serviceId })))
		orgHours.push({ where: { organizationId: org.id }, data: { orgLocId: orgLocationId } })
		serviceAreas.push({ where: { organizationId: org.id }, data: { orgLocationId } })
	}
	task.output = `Records Generated:`
	task.output = `\t[createMany] OrgLocationEmail: ${orgLocationEmail.length}`
	task.output = `\t[createMany] OrgLocationPhone: ${orgLocationPhone.length}`
	task.output = `\t[createMany] OrgLocationService: ${orgLocationService.length}`
	task.output = `\t[updateMany] ServiceAreas: ${serviceAreas.length}`
	task.output = `\t[updateMany] OrgHours: ${orgHours.length}`

	await prisma.$transaction(
		async (tx) => {
			task.output = `Running transactions...`
			try {
				const emails = await tx.orgLocationEmail.createMany({ data: orgLocationEmail, skipDuplicates: true })
				task.output = `OrgLocationEmail: ${emails.count}`
				const phones = await tx.orgLocationPhone.createMany({ data: orgLocationPhone, skipDuplicates: true })
				task.output = `OrgLocationPhone: ${phones.count}`
				const services = await tx.orgLocationService.createMany({
					data: orgLocationService,
					skipDuplicates: true,
				})
				task.output = `OrgLocationService: ${services.count}`
				task.output = `Committing transactions...`
			} catch (error) {
				console.error(error)
			}
		},
		{ timeout: 300_000 }
	)
	task.output = `Processing updates...`
	const servAreaBatch = serviceAreas.map((args) => prisma.serviceArea.updateMany(args))
	const orgHoursBatch = orgHours.map((args) => prisma.orgHours.updateMany(args))

	const servAreaResult = await batchRunner(servAreaBatch, task)
	task.output = `ServiceAreas: ${servAreaResult}`

	const orgHoursResult = await batchRunner(orgHoursBatch, task)
	task.output = `OrgHours: ${orgHoursResult}`
}

// export job - this must be unique
export const job20230404b = {
	title: `${jobDef.jobId} - ${jobDef.title}`,
	task: job,
} satisfies ListrJob
