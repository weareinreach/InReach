// import { Prisma, SourceType } from '@prisma/client'
import cuid from 'cuid'
import { flatten } from 'flat'
import slugify from 'slugify'

import { Prisma, SourceType } from '~/client'
import { OrganizationsJSONCollection } from '~/datastore/v1/mongodb/output-types/organizations'
import { prisma } from '~/index'
import { namespaces } from '~/seed/data'

/**
 * It takes a name, city, and state, and returns a unique slug based on those values
 *
 * @param {string} name - The name of the organization
 * @param {string} [city] - The city of the organization
 * @param {string} [state] - The state the organization is located in
 * @returns A function that takes in a name, city, and state and returns a unique slug.
 */
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

type KeyType = 'desc' | 'svc'
type DescKey = { type: 'desc'; orgSlug: string; text: string }
type SvcKey = { type: 'svc'; orgSlug: string; text: string; subtype: 'access' | 'desc' }
type GenerateKey<T> = (params: T extends 'desc' ? DescKey : SvcKey) => Promise<{ id: string; key: string }>

/**
 * It takes in a `params` object, and returns a `Promise` that resolves to a `TranslationKey` object
 *
 * @param params - {
 * @returns The key and id of the translation key
 */
const generateKey: GenerateKey<KeyType> = async (params) => {
	const { type, orgSlug, text } = params
	let ns = ''
	let key = ''
	switch (type) {
		case 'desc':
			ns = namespaces.orgDescription
			key = orgSlug
			break
		case 'svc':
			ns = namespaces.orgService
			key = params.subtype === 'access' ? `${orgSlug}.access` : `${orgSlug}.desc`
			break
	}
	return await prisma.translationKey.upsert({
		where: {
			ns_key: {
				ns,
				key,
			},
		},
		create: {
			key,
			text,
			namespace: {
				connect: {
					name: ns,
				},
			},
		},
		update: {
			text,
		},
		select: {
			key: true,
			id: true,
		},
	})
}

const serviceTags = await prisma.serviceCategory.findMany({
	select: {
		category: true,
		services: {
			select: {
				id: true,
				name: true,
			},
		},
	},
})
const attributeList = await prisma.attribute.findMany({
	select: {
		id: true,
		tag: true,
		requireCountry: true,
		requireLanguage: true,
		requireSupplemental: true,
		requireText: true,
	},
})

type GenerateServices = (
	services: OrganizationsJSONCollection['services']
) => Prisma.OrgServiceCreateNestedManyWithoutOrganizationInput
const generateServices: GenerateServices = (services) => {
	const servIds = {}
	serviceTags.forEach((serv) => {
		serv.services.forEach((x) => (servIds[`${serv.category}.${x.name}`] = x.id))
	})
	console.log(servIds)

	const data: Prisma.OrgServiceCreateInput[] = services.map((service) => {
		const servId = cuid()
		const flatServ: Record<string, string> = flatten(service.tags)

		const tagIds = Object.keys(flatServ).map((serv) => {
			let id = ''
			const servKey = serv.substring(serv.indexOf('.') + 1, serv.length)
			if (Object.keys(servIds).includes(servKey)) {
				id = servIds[servKey]
			}
			return { id }
		})
		const unsupportedAttribute = {}
		if (typeof service.properties === 'object' && Object.keys(service.properties).length) {
			const attributes = Object.keys(service.properties).map((prop) => {
				const tag = prop
				if (attributeList.some((x) => x.tag === tag)) {
					return {}
				}
			})
		}
		return {
			id: servId,
			service: {
				connect: tagIds,
			},
		}
	})
	return { create: data }
}

export const upsertOrg = async (org: OrganizationsJSONCollection) => {
	const orgExists = async (legacyId: string) => {
		const check = await prisma.organization.findUnique({
			where: { legacyId },
			select: { legacyId: true, id: true },
		})
		return !!check?.legacyId ? { exists: true, id: check.id } : false
	}
	const exists = await orgExists(org._id.$oid)

	const primaryLocation = org.locations.find((location) => location.is_primary)
	const slug = await uniqueSlug(org.name, primaryLocation?.city, primaryLocation?.state)
	const source = `migration` as string

	if (!exists) {
		const sourceCreate = { create: { source, type: 'SYSTEM' as SourceType } }
		/* Generate Description stub */
		const { id: descKeyId } = org.description
			? await generateKey({ type: 'desc', orgSlug: slug, text: org.description })
			: { id: undefined }
		const description = descKeyId ? { create: { key: { connect: { id: descKeyId } } } } : undefined
		/* Generate Services stub */
		const services = org.services.length ? generateServices(org.services) : undefined
		return {
			exists,
			org: prisma.organization.create({
				data: {
					legacyId: org._id.$oid,
					name: org.name,
					slug,
					createdAt: org.created_at.$date,
					updatedAt: org.updated_at.$date,
					source: sourceCreate,
					description,
					services,
				},
			}),
		}
	}
}
