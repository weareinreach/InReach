import { Prisma, SourceType } from '@prisma/client'
import slugify from 'slugify'
import invariant from 'tiny-invariant'

import { OrganizationsJSONCollection } from '~/datastore/v1/mongodb/output-types/organizations'
import { prisma } from '~/index'
import { createMeta, userEmail } from '~/seed/data'

const uniqueSlug = async (name: string, city?: string, state?: string) => {
	const check = async (slug: string) => {
		const existing = await prisma.organization.findUnique({
			where: {
				slug,
			},
			select: {
				slug: true,
			},
		})
		return existing?.slug ? false : true
	}
	const slugs = [slugify(name), slugify(`${name} ${state}`), slugify(`${name} ${city} ${state}`)]
	for (const slug of slugs) {
		if (await check(slug)) return slug
	}
	throw new Error('Unable to generate unique slug')
}
const langCodes = ['en', 'es'] as const
type LangCodes = typeof langCodes[number]
const langMap = new Map<LangCodes, string>()

type LangIdObj =
	| {
			localeCode: LangCodes
			id: string
	  }
	| undefined
const getLangIds = async () => {
	const langQuery = (await prisma.language.findMany({
		where: {
			localeCode: {
				in: ['en', 'es'],
			},
		},
		select: {
			id: true,
			localeCode: true,
		},
	})) as LangIdObj[]
	for (const lang of langCodes) {
		const { id } = langQuery.find((record) => record?.localeCode === lang) ?? { id: undefined }
		if (!id) throw new Error(`DB is missing entry for Locale: ${lang}`)
		langMap.set(lang, id)
	}
}

const getCreateMetaIds = async () => {
	const { id } = await prisma.user.findUniqueOrThrow({
		where: {
			email: userEmail,
		},
		select: {
			id: true,
		},
	})
	return {
		createdById: id,
		updatedById: id,
	}
}
type Create = 'create'
type Update = 'update'
type OrgDescCreate = Prisma.OrgDescriptionCreateManyOrganizationInputEnvelope
type OrgDescCreateData = OrgDescCreate['data']

type OrgDescUpdate = Prisma.OrgDescriptionUpdateArgs
type OrgDescUpdateData = Prisma.OrgDescriptionUpdateArgs['data']

type GenerateDescReturn<T> = T extends Create ? OrgDescCreate : OrgDescUpdate

export const upsertOrg = async (org: OrganizationsJSONCollection) => {
	const orgExists = async (legacyId: string) => {
		const check = await prisma.organization.findUnique({
			where: { legacyId },
			select: { legacyId: true, id: true },
		})
		return check?.legacyId ? { exists: true, id: check.id } : false
	}
	const exists = await orgExists(org._id.$oid)
	await getLangIds()
	const langIds = {
		en: langMap.get('en'),
		es: langMap.get('es'),
	}
	invariant(langIds.en && langIds.es)

	const createMetaIds = await getCreateMetaIds()

	const primaryLocation = org.locations.find((location) => location.is_primary)
	const slug = await uniqueSlug(org.name, primaryLocation?.city, primaryLocation?.state)
	const source = `migration` as string

	const generateDescription = <T extends Create | Update>(type: T): GenerateDescReturn<T> | undefined => {
		const status = {
			en: !!org.description ? org.description : false,
			es: !!org.description_ES ? org.description_ES : false,
		}
		if (!status.en && !status.es) return undefined
		const create = type === 'create'
		type Data = typeof create extends true ? OrgDescCreateData[] : OrgDescUpdateData[]
		const data = [] as Data
		for (const lang in status) {
			const text = status[lang]
			const langId = langCodes[lang]
			if (typeof text === 'string' && typeof langId === 'string') {
				const meta = create ? createMetaIds : { updatedById: createMetaIds.updatedById }
				data.push({ text, langId, ...meta })
			}
		}
	}

	if (!exists) {
		return {
			exists,
			transaction: Prisma.validator<Prisma.OrganizationCreateArgs>()({
				data: {
					legacyId: org._id.$oid,
					name: org.name,
					slug,
					...createMeta,
					createdAt: org.created_at.$date,
					updatedAt: org.updated_at.$date,
					source: {
						connectOrCreate: {
							where: {
								source,
							},
							create: {
								source,
								type: 'SYSTEM' as SourceType,
								...createMeta,
							},
						},
					},
					description: org.description
						? {
								createMany: {
									data: [],
									skipDuplicates: true,
								},
						  }
						: undefined,
				},
			}),
		}
	}
}
