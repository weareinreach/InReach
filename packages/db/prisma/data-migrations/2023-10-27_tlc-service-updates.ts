import superjson from 'superjson'

import { prisma, type Prisma } from '~db/client'
import { namespace, namespaces } from '~db/generated/namespaces'
import { generateFreeText } from '~db/lib/generateFreeText'
import { formatMessage } from '~db/prisma/common'
import { type MigrationJob } from '~db/prisma/dataMigrationRunner'
import { createLogger, type JobDef, jobPostRunner } from '~db/prisma/jobPreRun'
import { JsonInputOrNull } from '~db/zod_util'
/** Define the job metadata here. */
const jobDef: JobDef = {
	jobId: '2023-10-27-tlc-service-updates',
	title: 'tlc service updates',
	createdBy: 'Joe Karow',
	/** Optional: Longer description for the job */
	description: undefined,
}
/** Job export - this variable MUST be UNIQUE */
export const job20231027_tlc_service_updates = {
	title: `[${jobDef.jobId}] ${jobDef.title}`,
	task: async (_ctx, task) => {
		/** Create logging instance */
		createLogger(task, jobDef.jobId)
		const log = (...args: Parameters<typeof formatMessage>) => (task.output = formatMessage(...args))
		/**
		 * Start defining your data migration from here.
		 *
		 * To log output, use `task.output = 'Message to log'`
		 *
		 * This will be written to `stdout` and to a log file in `/prisma/migration-logs/`
		 */

		// Do stuff

		const records: PendingRecords = {
			translationKey: [],
			freeText: [],
			orgService: [],
			serviceAccessAttribute: [],
			serviceAttribute: [],
			orgServiceTag: [],
			attributeSupplement: [],
		}
		const orgId = 'orgn_01GVH3V3SHC630JFFMNKJY8KM1'
		const organizationId = orgId

		const serv1Id = 'osvc_01HDRZ8WR6N3FGF6M7Z50T8TYX'
		const serv2Id = 'osvc_01HDRZ8WR7W4AKTBHW3QHPGR3F'
		const serv3Id = 'osvc_01HDRZ8WR7201KGHPGQSXYYAWC'

		const serv1Title = generateFreeText({
			type: 'svcName',
			orgId,
			itemId: serv1Id,
			text: 'Get legal information on laws and policies that affect transgender people',
			freeTextId: 'ftxt_01HDRZA6QX30K4T77SFWYSG8HZ',
		})
		const serv1Desc = generateFreeText({
			type: 'svcDesc',
			orgId,
			itemId: serv1Id,
			text: "The Legal Information Helpdesk provides basic information about laws and policies in the United States that affect transgender people across many areas, including employment, healthcare, housing, civil rights, immigration, prisoners' rights, and identity document changes. Individualized legal advice or representation is not provided via the Legal Information Helpdesk.",
			freeTextId: 'ftxt_01HDRZA6QXKCMJZ6CG1VWB50RF',
		})
		records.translationKey.push(serv1Title.translationKey)
		records.translationKey.push(serv1Desc.translationKey)
		records.freeText.push(serv1Title.freeText)
		records.freeText.push(serv1Desc.freeText)

		const serv2Title = generateFreeText({
			type: 'svcName',
			orgId,
			itemId: serv2Id,
			text: 'Attend a youth leadership and storytelling program for trans and gender non-conforming youth',
			freeTextId: 'ftxt_01HDRZA6QXX5AMCJP42CSHY21A',
		})
		const serv2Desc = generateFreeText({
			type: 'svcDesc',
			orgId,
			itemId: serv2Id,
			text: `The Gender Justice Leadership Program is a collaboration between Transgender Law Center and the GSA Network. It is a national trans and gender non-conforming youth leadership and storytelling program that aims to build empathy, understanding, and a movement for youth to share their stories in their own words and in their own way. Within the GJLP are three programs--TRUTH, Roses, and Stortelling. TRUTH aims to help young people and their families who shared their stories with the media to receive the resources they needed to stay safe and healthy. The Roses Program is committed to serving trans girls of color, and aims to lift their voices and power. Stortelling helps amplify the voices of trans, gender non-conforming, and Two-Spirit youth through various projects, including storytelling workshops. The project gives youth a space to share their stories in the face of anti-trans legislation and rhetoric.`,
			freeTextId: 'ftxt_01HDRZA6QXQGH7HT97TQW16B2F',
		})
		records.translationKey.push(serv2Title.translationKey)
		records.translationKey.push(serv2Desc.translationKey)
		records.freeText.push(serv2Title.freeText)
		records.freeText.push(serv2Desc.freeText)

		const serv3Title = generateFreeText({
			type: 'svcName',
			orgId,
			itemId: serv3Id,
			text: 'Reach out to a Prison Mail Program for incacerated transgender and gender-nonconforming people',
			freeTextId: 'ftxt_01HDRZA6QX2R0E8YAZ5FF02JX4',
		})
		const serv3Desc = generateFreeText({
			type: 'svcDesc',
			orgId,
			itemId: serv3Id,
			text: `Transgender Law Center works to end the abuses transgender and gender nonconforming (TGNC) people experience in all forms of detention including prisons, jails, immigration detention, and state hospitals. They receive hundreds of letters from incarcerated TGNC people each year, and their Prison Mail Program ensures that each letter receives a thoughtful response with helpful legal resources. They encourage incarcerated transgender and gender-nonconforming people to reach out to them directly. While their ability to provide legal support is limited, they have access to a wide range of legal information including relevant policies, sample legal documents, and guides, both general and state- or agency-specific. Your loved one may reach them by writing to Transgender Law Center at P.O. Box 70976, Oakland, CA 94612. They may also call their collect line for people in prison and detention: 510-380-8229. *Note: their ability to staff this line is limited, and postal mail is the most dependable method of contacting them. They have seen an upward trend in incarcerated people’s access to monitored email systems. Unfortunately, they are currently unable to connect with incarcerated people via those email systems, because they do not allow for private, privileged communications.`,
			freeTextId: 'ftxt_01HDRZA6QX4M8THSCCENQ71D2F',
		})
		records.translationKey.push(serv3Title.translationKey)
		records.translationKey.push(serv3Desc.translationKey)
		records.freeText.push(serv3Title.freeText)
		records.freeText.push(serv3Desc.freeText)

		records.orgService.push({
			id: serv1Id,
			organizationId,
			published: true,
			descriptionId: serv1Desc.freeText.id,
			serviceNameId: serv1Title.freeText.id,
		})
		records.orgService.push({
			id: serv2Id,
			organizationId,
			published: true,
			descriptionId: serv2Desc.freeText.id,
			serviceNameId: serv2Title.freeText.id,
		})
		records.orgService.push({
			id: serv3Id,
			organizationId,
			published: true,
			descriptionId: serv3Desc.freeText.id,
			serviceNameId: serv3Title.freeText.id,
		})

		const serv1Tags = [
			'svtg_01GW2HHFBQSF73S87ZRENXHKQV',
			'svtg_01GW2HHFBQEVJCBZC1KSSEB8WN',
			'svtg_01GW2HHFBQ78QZGW7YAPDZ2YJS',
			'svtg_01GW2HHFBRB8R4AQVR2FYE72EC',
			'svtg_01GW2HHFBQ02KJQ7E5NPM3ERNE',
		]
		const serv2Tags = ['svtg_01H2738F1W23TZXB23VNPR9JM3', 'svtg_01GW2HHFBSPTXA7Q4W5RKFP53W']
		const serv3Tags = ['svtg_01H273CH9YC9PXQWJ5RV349T2F']

		serv1Tags.forEach((tagId) => records.orgServiceTag.push({ serviceId: serv1Id, tagId }))
		serv2Tags.forEach((tagId) => records.orgServiceTag.push({ serviceId: serv2Id, tagId }))
		serv3Tags.forEach((tagId) => records.orgServiceTag.push({ serviceId: serv3Id, tagId }))

		const servAccessLink = 'attr_01GW2HHFVMYXMS8ARA3GE7HZFD'

		records.serviceAccessAttribute.push({ attributeId: servAccessLink, serviceId: serv1Id })
		records.attributeSupplement.push({
			id: 'atts_01HDRZSTMWTY33KS0WFMJQ43Q3',
			data: JsonInputOrNull.parse(
				superjson.serialize({
					access_type: 'link',
					access_value: 'https://transgenderlawcenter.org/get-help/',
				})
			),
			serviceAccessAttributeServiceId: serv1Id,
			serviceAccessAttributeAttributeId: servAccessLink,
		})
		records.serviceAccessAttribute.push({ attributeId: servAccessLink, serviceId: serv2Id })
		records.attributeSupplement.push({
			id: 'atts_01HDRZSTMXTAZSR3YTWYFQ793M',
			data: JsonInputOrNull.parse(
				superjson.serialize({
					access_type: 'link',
					access_value: 'https://ourtranstruth.org/roses-initiative/',
				})
			),
			serviceAccessAttributeServiceId: serv2Id,
			serviceAccessAttributeAttributeId: servAccessLink,
		})
		records.serviceAccessAttribute.push({ attributeId: servAccessLink, serviceId: serv3Id })
		records.attributeSupplement.push({
			id: 'atts_01HDRZSTMX24KSFHZW4EVGWET4',
			data: JsonInputOrNull.parse(
				superjson.serialize({
					access_type: 'link',
					access_value: 'https://transgenderlawcenter.org/prison-mail-program/',
				})
			),
			serviceAccessAttributeAttributeId: servAccessLink,
			serviceAccessAttributeServiceId: serv3Id,
		})

		const targetPop = 'attr_01GW2HHFVJDKVF1HV7559CNZCY'
		const ageElig = 'attr_01GW2HHFVGSAZXGR4JAVHEK6ZC'
		const costFree = 'attr_01GW2HHFVGDTNW9PDQNXK6TF1T'
		const confidentialityPolicy = 'attr_01GW2HHFV3BADK80TG0DXXFPMM'
		const remote = 'attr_01GW2HHFV5Q7XN2ZNTYFR1AD3M'
		const langsOffered = 'attr_01GW2HHFVJ8K180CNX339BTXM2'
		const langs = {
			en: 'lang_0000000000N3K70GZXE29Z03A4',
			es: 'lang_0000000000EBJ3V9T0RJP07R5G',
		}

		const serv1Target = generateFreeText({
			type: 'attSupp',
			orgId,
			itemId: 'atts_01HDS02VWP12VYZWXC2ASQGX1K',
			text: 'Transgender people in the U.S.',
			freeTextId: 'ftxt_01HDS04HZ14G262FQ6GXSFR0VN',
		})
		records.serviceAttribute.push({ orgServiceId: serv1Id, attributeId: targetPop })
		records.translationKey.push(serv1Target.translationKey)
		records.freeText.push(serv1Target.freeText)
		records.attributeSupplement.push({
			id: 'atts_01HDS02VWP12VYZWXC2ASQGX1K',
			serviceAttributeOrgServiceId: serv1Id,
			serviceAttributeAttributeId: targetPop,
			textId: serv1Target.freeText.id,
		})

		records.serviceAttribute.push({ orgServiceId: serv1Id, attributeId: costFree })
		records.serviceAttribute.push({ orgServiceId: serv1Id, attributeId: confidentialityPolicy })
		records.serviceAttribute.push({ orgServiceId: serv1Id, attributeId: remote })

		records.serviceAttribute.push({ orgServiceId: serv1Id, attributeId: langsOffered })
		records.attributeSupplement.push({
			id: 'atts_01HDS0KP8J0GABQKX91GQ78BFE',
			languageId: langs.en,
			serviceAttributeOrgServiceId: serv1Id,
			serviceAttributeAttributeId: langsOffered,
		})
		records.attributeSupplement.push({
			id: 'atts_01HDS0KP8JK44N37ESXR1CKG52',
			languageId: langs.es,
			serviceAttributeOrgServiceId: serv1Id,
			serviceAttributeAttributeId: langsOffered,
		})

		const serv2Target = generateFreeText({
			type: 'attSupp',
			orgId,
			itemId: 'atts_01HDS02VWPQRP082NNJ6RZ3EKX',
			text: 'LGBTQ+ youth; Black, Brown and Indigenous trans girls',
			freeTextId: 'ftxt_01HDS04HZ122MMJ9BYF14BYGSC',
		})
		records.serviceAttribute.push({ orgServiceId: serv2Id, attributeId: targetPop })
		records.translationKey.push(serv2Target.translationKey)
		records.freeText.push(serv2Target.freeText)
		records.attributeSupplement.push({
			id: 'atts_01HDS02VWPQRP082NNJ6RZ3EKX',
			serviceAttributeOrgServiceId: serv2Id,
			serviceAttributeAttributeId: targetPop,
			textId: serv2Target.freeText.id,
		})

		records.serviceAttribute.push({ orgServiceId: serv2Id, attributeId: remote })
		records.serviceAttribute.push({ orgServiceId: serv2Id, attributeId: ageElig })
		records.attributeSupplement.push({
			id: 'atts_01HDS0KP8JTM6QCXZFXM6R00YF',
			serviceAttributeOrgServiceId: serv2Id,
			serviceAttributeAttributeId: remote,
			data: JsonInputOrNull.parse(
				superjson.serialize({
					min: 14,
					max: 18,
				})
			),
		})

		const serv3Target = generateFreeText({
			type: 'attSupp',
			orgId,
			itemId: 'atts_01HDS02VWPKMD09QCTPZTGKF78',
			text: 'Incarcerated transgender and gender-nonconforming people',
			freeTextId: 'ftxt_01HDS04HZ1Z2BHHT4PBGB7JWHS',
		})
		records.serviceAttribute.push({ orgServiceId: serv3Id, attributeId: targetPop })
		records.translationKey.push(serv3Target.translationKey)
		records.freeText.push(serv3Target.freeText)
		records.attributeSupplement.push({
			id: 'atts_01HDS02VWPKMD09QCTPZTGKF78',
			serviceAttributeOrgServiceId: serv3Id,
			serviceAttributeAttributeId: targetPop,
			textId: serv3Target.freeText.id,
		})

		records.serviceAttribute.push({ orgServiceId: serv3Id, attributeId: costFree })
		records.serviceAttribute.push({ orgServiceId: serv3Id, attributeId: confidentialityPolicy })
		records.serviceAttribute.push({ orgServiceId: serv3Id, attributeId: remote })
		records.serviceAttribute.push({ orgServiceId: serv3Id, attributeId: langsOffered })
		records.attributeSupplement.push({
			id: 'atts_01HDS0TGE5KFJVY0ENZZR8CK3X',
			serviceAttributeOrgServiceId: serv3Id,
			serviceAttributeAttributeId: langsOffered,
			languageId: langs.en,
		})
		records.attributeSupplement.push({
			id: 'atts_01HDS0TGE5DF3XZJA0YZ17N0BY',
			serviceAttributeOrgServiceId: serv3Id,
			serviceAttributeAttributeId: langsOffered,
			languageId: langs.es,
		})

		const newTranslationKeys = await prisma.translationKey.createMany({
			data: records.translationKey,
			skipDuplicates: true,
		})
		log(
			`Translation Keys --> Submitted: ${records.attributeSupplement.length}, Created: ${newTranslationKeys.count}`
		)

		const newFreeText = await prisma.freeText.createMany({
			data: records.freeText,
			skipDuplicates: true,
		})
		log(`Free Text --> Submitted: ${records.freeText.length}, Created: ${newFreeText.count}`)

		const newServices = await prisma.orgService.createMany({
			data: records.orgService,
			skipDuplicates: true,
		})
		log(`Services --> Submitted: ${records.orgService.length}, Created: ${newServices.count}`)

		const newServAccess = await prisma.serviceAccessAttribute.createMany({
			data: records.serviceAccessAttribute,
			skipDuplicates: true,
		})
		log(
			`Service Access Attributes --> Submitted: ${records.serviceAccessAttribute.length}, Created: ${newServAccess.count}`
		)

		const newServAttr = await prisma.serviceAttribute.createMany({
			data: records.serviceAttribute,
			skipDuplicates: true,
		})
		log(`Service Attributes --> Submitted: ${records.serviceAttribute.length}, Created: ${newServAttr.count}`)

		const newServTag = await prisma.orgServiceTag.createMany({
			data: records.orgServiceTag,
			skipDuplicates: true,
		})
		log(`Service Tags --> Submitted: ${records.orgServiceTag.length}, Created: ${newServTag.count}`)

		const newAttrSupp = await prisma.attributeSupplement.createMany({
			data: records.attributeSupplement,
			skipDuplicates: true,
		})
		log(
			`Attribute Supplements --> Submitted: ${records.attributeSupplement.length}, Created: ${newAttrSupp.count}`
		)

		const servUpdate = await prisma.orgService.update({
			where: { id: 'osvc_01GVH3VDX62SZ3NK37NDQWBYYV' },
			data: {
				published: false,
				deleted: true,
			},
		})
		log(`Set orgService ${servUpdate.id} to published=false and deleted=true`)
		const removeTag = await prisma.organizationAttribute.delete({
			where: {
				organizationId_attributeId: {
					attributeId: 'attr_01GW2HHFVN3JX2J7REFFT5NAMS',
					organizationId,
				},
			},
		})
		removeTag && log(`Removed 'black-led' tag`)

		const orgAttr = await prisma.organizationAttribute.create({
			data: { attributeId: 'attr_01GW2HHFVQVEGH6W3A2ANH1QZE', organizationId },
		})
		orgAttr && log(`Added 'trans-youth-focus' tag`)

		const ns = namespace.orgData
		const textToUpdate: Prisma.TranslationKeyUpdateArgs[] = [
			{
				where: {
					ns_key: { ns, key: 'orgn_01GVH3V3SHC630JFFMNKJY8KM1.osvc_01GVH3VDX62SZ3NK37NDQWBYYV.name' },
				},
				data: {
					text: 'Call a legal hotline for transgender people and gender non-conforming people',
				},
			},
			{
				where: {
					ns_key: { ns, key: 'orgn_01GVH3V3SHC630JFFMNKJY8KM1.osvc_01GVH3VDX916YS22JV1DKGV38F.name' },
				},
				data: {
					text: 'Access free general legal clinics for transgender and gender non-conforming people',
				},
			},
		]

		const textUpdates = await prisma.$transaction(
			textToUpdate.map((args) => prisma.translationKey.update(args))
		)
		log(`Updated ${textUpdates.length} translations`)

		/**
		 * DO NOT REMOVE BELOW
		 *
		 * This writes a record to the DB to register that this migration has run successfully.
		 */
		await jobPostRunner(jobDef)
	},
	def: jobDef,
} satisfies MigrationJob

interface PendingRecords {
	translationKey: Prisma.TranslationKeyCreateManyInput[]
	freeText: Prisma.FreeTextCreateManyInput[]
	orgService: Prisma.OrgServiceCreateManyInput[]
	orgServiceTag: Prisma.OrgServiceTagCreateManyInput[]
	serviceAccessAttribute: Prisma.ServiceAccessAttributeCreateManyInput[]
	attributeSupplement: Prisma.AttributeSupplementCreateManyInput[]
	serviceAttribute: Prisma.ServiceAttributeCreateManyInput[]
}
