import {
	type ClassifiedItem,
	classifyLocationContacts,
	CLEANUP_NOTE,
	type ContactType,
	loadLocationLinkedContacts,
	planCleanup,
} from '~db/lib/locationContactCleanup'
import { type MigrationJob } from '~db/prisma/dataMigrationRunner'
import { type JobDef } from '~db/prisma/jobPreRun'

/** Define the job metadata here. */
const jobDef: JobDef = {
	jobId: '2026-10-19_location-contact-cleanup',
	title: 'Mark existing location-specific phones, emails, websites and social media as location-only',
	createdBy: 'Developer',
	/** Optional: Longer description for the job */
	description:
		"An organization's page shows its contact items except location-only ones; a location's page shows " +
		'everything linked to it. Items saved before that rule were never marked, so this marks the clear-cut ' +
		"ones (a location's copy of an org-level item; an email added from a location) and leaves a " +
		'"needs review" note on the ones a person has to decide. Undecided phones are also marked so the ' +
		"org's page looks the same as before. Every change gets an internal note saying why. Preview: " +
		'pnpm --filter @weareinreach/db db:audit-location-contacts. Needs the location-only email display fix ' +
		'(orgEmail.forContactInfo) deployed with or before it.',
}

const noteLink: Record<ContactType, 'orgPhoneId' | 'orgEmailId' | 'orgWebsiteId' | 'orgSocialMediaId'> = {
	phone: 'orgPhoneId',
	email: 'orgEmailId',
	website: 'orgWebsiteId',
	socialMedia: 'orgSocialMediaId',
}
const idsOf = (items: ClassifiedItem[], type: ContactType) =>
	items.filter((item) => item.type === type).map(({ id }) => id)

/**
 * Job export - this variable MUST be UNIQUE
 */
export const job20261019_locationContactCleanup = {
	title: `[${jobDef.jobId}] ${jobDef.title}`,
	task: async (ctx, task) => {
		const { createLogger, formatMessage, jobPostRunner, prisma, generateId } = ctx
		/** Create logging instance */
		createLogger(task, jobDef.jobId)
		const log = (...args: Parameters<typeof formatMessage>) => (task.output = formatMessage(...args))

		log('🚀 Classifying location-linked contact items...')
		const { items, orgs } = await loadLocationLinkedContacts(prisma)
		const plan = planCleanup(classifyLocationContacts(items, orgs))
		const toMark = plan.mark.map(({ item }) => item)

		const notes = [
			...plan.mark.map(({ item, note }) => ({ item, text: note })),
			...plan.needsReview.map((item) => ({ item, text: CLEANUP_NOTE.needsReview })),
		].map(({ item, text }) => ({ id: generateId('internalNote'), text, [noteLink[item.type]]: item.id }))

		// One transaction: either every flag and note is written, or none are.
		const [phones, emails, websites, socials, created] = await prisma.$transaction([
			prisma.orgPhone.updateMany({
				where: { id: { in: idsOf(toMark, 'phone') } },
				data: { locationOnly: true },
			}),
			prisma.orgEmail.updateMany({
				where: { id: { in: idsOf(toMark, 'email') } },
				data: { locationOnly: true },
			}),
			prisma.orgWebsite.updateMany({
				where: { id: { in: idsOf(toMark, 'website') } },
				data: { orgLocationOnly: true },
			}),
			prisma.orgSocialMedia.updateMany({
				where: { id: { in: idsOf(toMark, 'socialMedia') } },
				data: { orgLocationOnly: true },
			}),
			prisma.internalNote.createMany({ data: notes }),
		])

		log(
			`Marked location-only: ${phones.count} phones, ${emails.count} emails, ${websites.count} websites, ` +
				`${socials.count} social media.`
		)
		log(
			`✅ Wrote ${created.count} notes - ${plan.needsReview.length} items need review, across ` +
				`${new Set(plan.needsReview.map(({ orgId }) => orgId)).size} organizations.`
		)

		await jobPostRunner(jobDef)
	},
	def: jobDef,
} satisfies MigrationJob
