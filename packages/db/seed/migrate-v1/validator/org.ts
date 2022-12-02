// // import { Prisma, SourceType } from '@prisma/client'
// import slugify from 'slugify'
// import invariant from 'tiny-invariant'

// import { Prisma, SourceType } from '~/client'
// import { OrganizationsJSONCollection } from '~/datastore/v1/mongodb/output-types/organizations'
// import { prisma } from '~/index'
// import { namespaces } from '~/seed/data'

// /**
//  * It takes a name, city, and state, and returns a unique slug based on those values
//  *
//  * @param {string} name - The name of the organization
//  * @param {string} [city] - The city of the organization
//  * @param {string} [state] - The state the organization is located in
//  * @returns A function that takes in a name, city, and state and returns a unique slug.
//  */
// const uniqueSlug = async (name: string, city?: string, state?: string) => {
// 	const check = async (slug: string) => {
// 		const existing = await prisma.organization.findUnique({
// 			where: {
// 				slug,
// 			},
// 			select: {
// 				slug: true,
// 			},
// 		})
// 		return existing?.slug ? false : true
// 	}
// 	const slugs = [slugify(name), slugify(`${name} ${state}`), slugify(`${name} ${city} ${state}`)]
// 	for (const slug of slugs) {
// 		if (await check(slug)) return slug
// 	}
// 	throw new Error('Unable to generate unique slug')
// }

// const langCodes = ['en', 'es'] as const
// type LangCodes = typeof langCodes[number]
// const langMap = new Map<LangCodes, string>()

// /**
//  * > It takes the language codes from the `langCodes` array, and uses them to query the database for the
//  * > corresponding language ids
//  */
// const getLangIds = async () => {
// 	const langQuery = (await prisma.language.findMany({
// 		where: {
// 			localeCode: {
// 				in: ['en', 'es'],
// 			},
// 		},
// 		select: {
// 			id: true,
// 			localeCode: true,
// 		},
// 	})) as LangIdObj[]
// 	for (const lang of langCodes) {
// 		const { id } = langQuery.find((record) => record?.localeCode === lang) ?? { id: undefined }
// 		if (!id) throw new Error(`DB is missing entry for Locale: ${lang}`)
// 		langMap.set(lang, id)
// 	}
// }
// type LangIdObj =
// 	| {
// 			localeCode: LangCodes
// 			id: string
// 	  }
// 	| undefined

// type KeyType = 'desc' | 'svc'
// type DescKey = { type: 'desc'; orgSlug: string; text: string }
// type SvcKey = { type: 'svc'; orgSlug: string; text: string; subtype: 'access' | 'desc' }
// type GenerateKey<T> = (params: T extends 'desc' ? DescKey : SvcKey) => Promise<{ id: string; key: string }>

// /**
//  * It takes in a `params` object, and returns a `Promise` that resolves to a `TranslationKey` object
//  *
//  * @param params - {
//  * @returns The key and id of the translation key
//  */
// const generateKey: GenerateKey<KeyType> = async (params) => {
// 	const { type, orgSlug, text } = params
// 	let ns = ''
// 	let key = ''
// 	switch (type) {
// 		case 'desc':
// 			ns = namespaces.orgDescription
// 			key = orgSlug
// 			break
// 		case 'svc':
// 			ns = namespaces.orgService
// 			key = params.subtype === 'access' ? `${orgSlug}-access` : `${orgSlug}-desc`
// 			break
// 	}
// 	return await prisma.translationKey.upsert({
// 		where: {
// 			ns_key: {
// 				ns,
// 				key,
// 			},
// 		},
// 		create: {
// 			key,
// 			text,
// 			namespace: {
// 				connectOrCreate: {
// 					where: {
// 						name: ns,
// 					},
// 					create: {
// 						name: ns,
// 					},
// 				},
// 			},
// 		},
// 		update: {
// 			text,
// 		},
// 		select: {
// 			key: true,
// 			id: true,
// 		},
// 	})
// }

// // type Create = 'create'
// // type Update = 'update'
// // type CreateUpdate = 'create' | 'update'
// // type OrgDescCreate = Prisma.OrgDescriptionCreateNestedManyWithoutOrganizationInput
// // type OrgDescUpdate = Prisma.OrgDescriptionUpsertWithWhereUniqueWithoutOrganizationInput

// // type GenerateDescReturn<T> = T extends 'create' ? OrgDescCreate : OrgDescUpdate
// // type GenerateDescription<T> = (action: T) => Promise<GenerateDescReturn<T> | undefined>

// export const upsertOrg = async (org: OrganizationsJSONCollection) => {
// 	const orgExists = async (legacyId: string) => {
// 		const check = await prisma.organization.findUnique({
// 			where: { legacyId },
// 			select: { legacyId: true, id: true },
// 		})
// 		return !!check?.legacyId ? { exists: true, id: await check.id } : false
// 	}
// 	const exists = await orgExists(org._id.$oid)
// 	await getLangIds()
// 	const langIds = {
// 		en: langMap.get('en'),
// 		es: langMap.get('es'),
// 	}
// 	invariant(langIds.en && langIds.es)

// 	const primaryLocation = org.locations.find((location) => location.is_primary)
// 	const slug = await uniqueSlug(org.name, primaryLocation?.city, primaryLocation?.state)
// 	const source = `migration` as string

// 	/**
// 	 * It takes a type of `create` or `update` and returns a Prisma input object for the `description` field of
// 	 * the `Organization` type
// 	 *
// 	 * @param type - The type of operation we're doing. This is either 'create' or 'update'.
// 	 * @returns An object with a key of create or update, and a value of an object with a key of create or
// 	 *   upsert, and a value of an object with a key of key and a value of an object with a key of connect and a
// 	 *   value of an object with a key of key and a value of the key variable.
// 	 */
// 	// const generateDescription /*: GenerateDescription<CreateUpdate>*/ = async (type: string) => {
// 	// 	if (!org.description) return undefined
// 	// 	const { key } = await generateKey({ type: 'desc', orgSlug: slug, text: org.description })
// 	// 	switch (type) {
// 	// 		case 'create': {
// 	// 			return {
// 	// 				create: {
// 	// 					key: {
// 	// 						connect: {
// 	// 							key,
// 	// 						},
// 	// 					},
// 	// 				},
// 	// 			}
// 	// 		}

// 	// 		// case 'update': {
// 	// 		// 	return {
// 	// 		// 		upsert: {
// 	// 		// 			where: {
// 	// 		// 				key: {
// 	// 		// 					key,
// 	// 		// 				},
// 	// 		// 			},
// 	// 		// 			create: {
// 	// 		// 				key: {
// 	// 		// 					connect: {
// 	// 		// 						key,
// 	// 		// 					},
// 	// 		// 				},
// 	// 		// 			},
// 	// 		// 			update: {},
// 	// 		// 		},
// 	// 		// 	}
// 	// 		// }
// 	// 	}
// 	// }

// 	if (!exists) {
// 		const sourceCreate = { create: { source, type: 'SYSTEM' as SourceType } }
// 		const { id: keyId } = org.description
// 			? await generateKey({ type: 'desc', orgSlug: slug, text: org.description })
// 			: { id: undefined }
// 		const description = keyId ? { create: { key: { connect: { id: keyId } } } } : undefined
// 		return {
// 			exists,
// 			transaction: Prisma.validator<Prisma.OrganizationCreateArgs>()({
// 				data: {
// 					legacyId: org._id.$oid,
// 					name: org.name,
// 					slug,
// 					createdAt: org.created_at.$date,
// 					updatedAt: org.updated_at.$date,
// 					source: sourceCreate,
// 					description,
// 				},
// 			}),
// 		}
// 	}
// }
export {}
