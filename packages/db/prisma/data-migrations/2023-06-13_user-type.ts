import { namespace } from '~db/generated/namespaces'
import { type Prisma, prisma } from '~db/index'
import { isSuccess } from '~db/prisma/common'
import { type ListrJob } from '~db/prisma/dataMigrationRunner'
import { type JobDef, jobPostRunner, jobPreRunner } from '~db/prisma/jobPreRun'

/** Define the job metadata here. */
const jobDef: JobDef = {
	jobId: '2023-06-13_user-type',
	title: 'Update user types/signup attributes',
	createdBy: 'Joe Karow',
}

const servProTKeys: Prisma.TranslationKeyCreateManyInput[] = [
	{ ns: namespace.attribute, key: 'userserviceprovider.case-mananger', text: 'Case manager' },
	{ ns: namespace.attribute, key: 'userserviceprovider.lawyer', text: 'Lawyer' },
	{
		ns: namespace.attribute,
		key: 'userserviceprovider.paralegal',
		text: 'Paralegal or other legal support staff',
	},
	{ ns: namespace.attribute, key: 'userserviceprovider.social-worker', text: 'Social worker' },
	{ ns: namespace.attribute, key: 'userserviceprovider.teacher', text: 'Teacher' },
	{ ns: namespace.attribute, key: 'userserviceprovider.therapist-counselor', text: 'Therapist/counselor' },
	{ ns: namespace.attribute, key: 'userserviceprovider.other', text: 'Other (please specify)' },
]
const servProAttribs: Prisma.AttributeCreateManyInput[] = [
	{
		tsNs: namespace.attribute,
		name: 'Case Manager',
		tag: 'userserviceprovider.case-mananger',
		tsKey: 'userserviceprovider.case-mananger',
		id: 'attr_01H2TK83N5E52PPP828SD88KP8',
	},
	{
		tsNs: namespace.attribute,
		name: 'Lawyer',
		tag: 'userserviceprovider.lawyer',
		tsKey: 'userserviceprovider.lawyer',
		id: 'attr_01H2TM092CFVG6H0MR148AVAP7',
	},
	{
		tsNs: namespace.attribute,
		name: 'Paralegal or other legal support staff',
		tag: 'userserviceprovider.paralegal',
		tsKey: 'userserviceprovider.paralegal',
		id: 'attr_01H2TM09EG0G84NXH40G5TESB5',
	},
	{
		tsNs: namespace.attribute,
		name: 'Social worker',
		tag: 'userserviceprovider.social-worker',
		tsKey: 'userserviceprovider.social-worker',
		id: 'attr_01H2TM09RAK024ZDZQ6FSY0TXB',
	},
	{
		tsNs: namespace.attribute,
		name: 'Teacher',
		tag: 'userserviceprovider.teacher',
		tsKey: 'userserviceprovider.teacher',
		id: 'attr_01H2TM0A19DD6S97DNH76ZVP40',
	},
	{
		tsNs: namespace.attribute,
		name: 'Therapist/counselor',
		tag: 'userserviceprovider.therapist-counselor',
		tsKey: 'userserviceprovider.therapist-counselor',
		id: 'attr_01H2TM0AA4CZXJJHMXHE1PHMVV',
	},
	{
		tsNs: namespace.attribute,
		name: 'Other (please specify)',
		tag: 'userserviceprovider.other',
		tsKey: 'userserviceprovider.other',
		id: 'attr_01H2TM0AJHVK8TSR8JNFANFNZ7',
	},
]
const attribCategory: Prisma.AttributeToCategoryCreateManyInput[] = [
	{ categoryId: 'attc_01GW2HHFVSQWE2Y2RF3DT2VEYX', attributeId: 'attr_01H2TK83N5E52PPP828SD88KP8' },
	{ categoryId: 'attc_01GW2HHFVSQWE2Y2RF3DT2VEYX', attributeId: 'attr_01H2TM092CFVG6H0MR148AVAP7' },
	{ categoryId: 'attc_01GW2HHFVSQWE2Y2RF3DT2VEYX', attributeId: 'attr_01H2TM09EG0G84NXH40G5TESB5' },
	{ categoryId: 'attc_01GW2HHFVSQWE2Y2RF3DT2VEYX', attributeId: 'attr_01H2TM09RAK024ZDZQ6FSY0TXB' },
	{ categoryId: 'attc_01GW2HHFVSQWE2Y2RF3DT2VEYX', attributeId: 'attr_01H2TM0A19DD6S97DNH76ZVP40' },
	{ categoryId: 'attc_01GW2HHFVSQWE2Y2RF3DT2VEYX', attributeId: 'attr_01H2TM0AA4CZXJJHMXHE1PHMVV' },
	{ categoryId: 'attc_01GW2HHFVSQWE2Y2RF3DT2VEYX', attributeId: 'attr_01H2TM0AJHVK8TSR8JNFANFNZ7' },
]

/**
 * Job export - this variable MUST be UNIQUE
 *
 * Use the format `jobYYYYMMDD` and append a letter afterwards if there is already a job with this name.
 *
 * @example `job20230404`
 *
 * @example `job20230404b`
 */
export const job20230613a = {
	title: `${jobDef.jobId} - ${jobDef.title}`,
	task: async (_ctx, task) => {
		/**
		 * Do not edit this part
		 *
		 * This ensures that jobs are only run once
		 */
		if (await jobPreRunner(jobDef, task)) {
			return task.skip(`${jobDef.jobId} - Migration has already been run.`)
		}
		/**
		 * Start defining your data migration from here.
		 *
		 * To log output, use `task.output = 'Message to log'`
		 *
		 * This will be written to `stdout` and to a log file in `/prisma/migration-logs/`
		 */

		// Do stuff
		const userTypeIndiv = await prisma.userType.update({
			where: { type: 'seeker' },
			data: { type: 'individual', key: { update: { text: 'Individual', key: 'type-individual' } } },
		})
		task.output = `${isSuccess(userTypeIndiv)} Update 'Individual' user type`

		const [servProTranslations, servProAttr, servProLinks] = await prisma.$transaction([
			prisma.translationKey.createMany({ data: servProTKeys, skipDuplicates: true }),
			prisma.attribute.createMany({ data: servProAttribs, skipDuplicates: true }),
			prisma.attributeToCategory.createMany({ data: attribCategory, skipDuplicates: true }),
		])

		task.output = `Add attributes -> Attributes: ${servProAttr.count}, Translation Keys: ${servProTranslations.count}, Category links: ${servProLinks.count}`

		const attribUpdates = await prisma.$transaction([
			prisma.attribute.update({
				where: { id: 'attr_01GW2HHFVTMFN73X6NVR0M9BZJ' },
				data: { active: false, tag: 'userserviceprovider.friend-family' },
			}),
			prisma.attribute.update({
				where: { id: 'attr_01GW2HHFVSVSBFQ700RMJ19BVH' },
				data: { active: false, tag: 'userserviceprovider.govt-agency' },
			}),
			prisma.attribute.update({
				where: { id: 'attr_01GW2HHFVTMVQ7W2X26ZRK81FR' },
				data: { active: false, tag: 'userserviceprovider.grassroots-direct' },
			}),
			prisma.attribute.update({
				where: { id: 'attr_01GW2HHFVSPXWJJPFG9DKXESEK' },
				data: { tag: 'userserviceprovider.healthcare' },
			}),
			prisma.attribute.update({
				where: { id: 'attr_01GW2HHFVTTZ83PZR61M37R8R7' },
				data: {
					tag: 'userserviceprovider.community-org',
					name: 'Volunteer/staff at a community organization',
					key: {
						update: {
							key: 'userserviceprovider.community-org',
							text: 'Volunteer/staff at a community organization',
						},
					},
				},
			}),
			prisma.attribute.update({
				where: { id: 'attr_01GW2HHFVTN6MSCMBW740Y7HN1' },
				data: {
					tag: 'userserviceprovider.student-club',
					name: 'Student club leader/administrator',
					key: { update: { text: 'Student club leader/administrator' } },
				},
			}),
		])
		task.output = `Attributes updated: ${attribUpdates.length}`

		/**
		 * DO NOT REMOVE BELOW
		 *
		 * This writes a record to the DB to register that this migration has run successfully.
		 */
		await jobPostRunner(jobDef)
	},
} satisfies ListrJob
