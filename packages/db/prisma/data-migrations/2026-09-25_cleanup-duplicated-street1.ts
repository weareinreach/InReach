import { findCleanedStreet1 } from '~db/lib/detectCorruptedStreet1'
import { type MigrationJob } from '~db/prisma/dataMigrationRunner'
import { type JobDef } from '~db/prisma/jobPreRun'

/** Define the job metadata here. */
const jobDef: JobDef = {
	jobId: '2026-09-25_cleanup-duplicated-street1',
	title: 'Clean up OrgLocation street1 values corrupted by the address-autocomplete duplication bug',
	createdBy: 'Developer',
	/** Optional: Longer description for the job */
	description:
		'GH #2093: the address-autocomplete field used to write the full "street, city, state, country" ' +
		'prediction text into street1 instead of just the street portion (fixed in ' +
		'packages/ui/components/data-portal/{AddressDrawer,AddressAutocomplete}/index.tsx). That fix only ' +
		"stops new corruption going forward - this strips the location's own city (and everything after " +
		'it) back out of any street1 that already has it duplicated in, for every row written before the ' +
		'fix existed. Detection/preview: pnpm --filter @weareinreach/db db:audit-street1.',
}

/**
 * Job export - this variable MUST be UNIQUE
 */
export const job20260925_cleanupDuplicatedStreet1 = {
	title: `[${jobDef.jobId}] ${jobDef.title}`,
	task: async (ctx, task) => {
		const { createLogger, formatMessage, jobPostRunner, prisma } = ctx
		/** Create logging instance */
		createLogger(task, jobDef.jobId)
		const log = (...args: Parameters<typeof formatMessage>) => (task.output = formatMessage(...args))

		log('🚀 Starting street1 cleanup...')

		const candidates = await prisma.orgLocation.findMany({
			where: { street1: { not: null }, city: { not: '' } },
			select: { id: true, street1: true, city: true },
		})

		let updated = 0
		for (const loc of candidates) {
			const cleaned = findCleanedStreet1(loc.street1, loc.city)
			if (!cleaned) {
				continue
			}
			await prisma.orgLocation.update({ where: { id: loc.id }, data: { street1: cleaned } })
			log(`Cleaned ${loc.id}: ${JSON.stringify(loc.street1)} -> ${JSON.stringify(cleaned)}`)
			updated += 1
		}

		log(`✅ Cleanup complete. ${updated} location(s) updated out of ${candidates.length} checked.`)

		await jobPostRunner(jobDef)
	},
	def: jobDef,
} satisfies MigrationJob
