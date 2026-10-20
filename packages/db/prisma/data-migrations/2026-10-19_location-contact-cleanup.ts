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
		'"needs review" note on the ones a person has to decide. Undecided phones are also marked, and items ' +
		'marked location-only but linked to no location are unmarked, so every org page looks the same as ' +
		'before until someone decides. Every change gets an internal note saying why. Preview: ' +
		'pnpm --filter @weareinreach/db db:audit-location-contacts. Needs the location-only display rules for ' +
		'emails and phones (orgEmail/orgPhone.forContactInfo) deployed with it.',
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
		const toUnmark = plan.unmark.map(({ item }) => item)

		const notes = [
			...plan.mark.map(({ item, note }) => ({ item, text: note })),
			...plan.unmark.map(({ item, note }) => ({ item, text: note })),
			...plan.needsReview.map((item) => ({ item, text: CLEANUP_NOTE.needsReview })),
		].map(({ item, text }) => ({ id: generateId('internalNote'), text, [noteLink[item.type]]: item.id }))

		const flag = (type: ContactType, items: ClassifiedItem[], value: boolean) => {
			const where = { id: { in: idsOf(items, type) } }
			switch (type) {
				case 'phone': {
					return prisma.orgPhone.updateMany({ where, data: { locationOnly: value } })
				}
				case 'email': {
					return prisma.orgEmail.updateMany({ where, data: { locationOnly: value } })
				}
				case 'website': {
					return prisma.orgWebsite.updateMany({ where, data: { orgLocationOnly: value } })
				}
				case 'socialMedia': {
					return prisma.orgSocialMedia.updateMany({ where, data: { orgLocationOnly: value } })
				}
			}
		}
		const types: ContactType[] = ['phone', 'email', 'website', 'socialMedia']

		// One transaction: either every flag and note is written, or none are.
		const counts = (
			await prisma.$transaction([
				...types.map((type) => flag(type, toMark, true)),
				...types.map((type) => flag(type, toUnmark, false)),
				prisma.internalNote.createMany({ data: notes }),
			])
		).map(({ count }) => count)
		const [phones = 0, emails = 0, websites = 0, socials = 0] = counts
		const unmarked = counts.slice(types.length, types.length * 2).reduce((sum, count) => sum + count, 0)
		const created = counts.at(-1) ?? 0

		log(
			`Marked location-only: ${phones} phones, ${emails} emails, ${websites} websites, ${socials} social ` +
				`media. Mark cleared (no location, until reviewed): ${unmarked}.`
		)
		log(
			`✅ Wrote ${created} notes - ${plan.needsReview.length} items need review, across ` +
				`${new Set(plan.needsReview.map(({ orgId }) => orgId)).size} organizations.`
		)

		await jobPostRunner(jobDef)
	},
	def: jobDef,
} satisfies MigrationJob
