import compact from 'just-compact'
import superjson from 'superjson'

import fs from 'fs'
import path from 'path'

import { prisma } from '~db/client'
import { attachLogger } from '~db/seed/recon/lib/logger'
import { type ListrJob } from '~db/seed/recon/lib/types'

// import { createLogger } from './logger'

const writeSuperJSON = (filename: string, data: unknown) => {
	fs.writeFileSync(path.resolve(__dirname, `../generated/${filename}.json`), superjson.stringify(data))
}

const typeOutput: string[] = []

// #region Countries
export const generateCountryMap = {
	title: 'Generate Country Map',
	task: async (_ctx, task) => {
		attachLogger(task)
		const countries = await prisma.country.findMany({
			where: { activeForOrgs: true },
			select: { cca2: true, id: true },
		})
		task.output = `Countries retrieved: ${countries.length}`
		const countryMap = new Map<string, string>(countries.map((c) => [c.cca2.toLowerCase(), c.id]))

		writeSuperJSON('countryMap', countryMap)
	},
} satisfies ListrJob

typeOutput.push('export type CountryMap = Map<string, string>')

// #endregion

// #region Districts
export const generateDistList = {
	title: 'Generate Governing District List & Map',
	task: async (_ctx, task) => {
		attachLogger(task)
		const countries = ['AS', 'CA', 'GU', 'MP', 'MX', 'PR', 'PW', 'UM', 'US', 'VI']
		const dists = await prisma.govDist.findMany({
			where: { country: { cca2: { in: countries } } },
			select: { id: true, slug: true },
			orderBy: { slug: 'asc' },
		})
		task.output = `Districts retrieved: ${dists.length}`
		writeSuperJSON('distList', dists)
		writeSuperJSON('distMap', new Map(dists.map((d) => [d.slug, d.id])))
	},
} satisfies ListrJob

typeOutput.push('export type DistList = { id: string; slug: string }[]')
typeOutput.push('export type DistMap = Map<string, string>')

// #endregion

// #region Organization IDs

export const generateOrgIdMap = {
	title: 'Generate Organization ID Map',
	task: async (_ctx, task) => {
		attachLogger(task)
		const orgs = await prisma.organization.findMany({
			select: { id: true, legacyId: true },
		})
		task.output = `Organizations retrieved: ${orgs.length}`
		const orgIdMap = new Map<string, string>(
			compact(orgs.map((o) => (o.legacyId ? [o.legacyId, o.id] : undefined)))
		)

		writeSuperJSON('orgIdMap', orgIdMap)
	},
} satisfies ListrJob

typeOutput.push('export type OrgIdMap = Map<string, string>')

// #endregion

// #region Organization Slugs
export const generateOrgSlugSet = {
	title: 'Generate Organization Slug Set',
	task: async (_ctx, task) => {
		attachLogger(task)
		const orgs = await prisma.organization.findMany({
			select: { slug: true },
		})
		task.output = `Organizations retrieved: ${orgs.length}`
		const orgSlugSet = new Set<string>(orgs.map(({ slug }) => slug))

		writeSuperJSON('orgSlugSet', orgSlugSet)
	},
} satisfies ListrJob

typeOutput.push('export type OrgSlugSet = Set<string>')

// #endregion

// #region Location IDs
export const generateLocationIdMap = {
	title: 'Generate Location ID Map',
	task: async (_ctx, task) => {
		attachLogger(task)
		const locations = await prisma.orgLocation.findMany({
			select: { id: true, legacyId: true },
		})
		task.output = `Locations retrieved: ${locations.length}`
		const locationIdMap = new Map<string, string>(
			compact(locations.map((l) => (l.legacyId ? [l.legacyId, l.id] : undefined)))
		)
		writeSuperJSON('locationIdMap', locationIdMap)
	},
} satisfies ListrJob

typeOutput.push('export type LocationIdMap = Map<string, string>')

// #endregion

// #region Service IDs

export const generateServiceIdMap = {
	title: 'Generate Service ID Map',
	task: async (_ctx, task) => {
		attachLogger(task)
		const services = await prisma.orgService.findMany({
			select: { id: true, legacyId: true },
		})
		task.output = `Services retrieved: ${services.length}`
		const serviceIdMap = new Map<string, string>(
			compact(services.map((s) => (s.legacyId ? [s.legacyId, s.id] : undefined)))
		)
		writeSuperJSON('serviceIdMap', serviceIdMap)
	},
} satisfies ListrJob

typeOutput.push('export type ServiceIdMap = Map<string, string>')

// #endregion

// #region Service Tags
export const generateServiceTagMap = {
	title: 'Generate Service Tag Map',
	task: async (_ctx, task) => {
		attachLogger(task)
		const tags = await prisma.serviceTag.findMany({ select: { id: true, tsKey: true } })
		task.output = `Service Tags retrieved: ${tags.length}`
		const serviceTagMap = new Map<string, string>(tags.map((t) => [t.tsKey, t.id]))
		writeSuperJSON('serviceTagMap', serviceTagMap)
	},
} satisfies ListrJob

typeOutput.push('export type ServiceTagMap = Map<string, string>')

// #endregion

// #region Attributes

export const generateAttributeMap = {
	title: 'Generate Attribute Map',
	task: async (_ctx, task) => {
		attachLogger(task)
		const attributes = await prisma.attribute.findMany({
			select: {
				tsKey: true,
				tag: true,
				id: true,
				requireText: true,
				requireLanguage: true,
				requireGeo: true,
				requireBoolean: true,
				requireData: true,
			},
		})
		task.output = `Attributes retrieved: ${attributes.length}`
		const attributeMap = new Map<string, Omit<(typeof attributes)[number], 'tsKey' | 'tag'>>(
			attributes.flatMap(({ tsKey, tag, ...rest }) => [
				[tsKey, rest],
				[tag, rest],
			])
		)
		writeSuperJSON('attributeMap', attributeMap)
	},
} satisfies ListrJob

typeOutput.push(
	'export type AttributeMap = Map<string, {id: string, requireText: boolean, requireLanguage: boolean, requireGeo: boolean, requireBoolean: boolean, requireData: boolean}>'
)

// #endregion

// #region Languages
export const generateLanguageMap = {
	title: 'Generate Language Map',
	task: async (_ctx, task) => {
		attachLogger(task)
		const languages = await prisma.language.findMany({
			select: {
				id: true,
				languageName: true,
			},
		})
		task.output = `Languages retrieved: ${languages.length}`
		const languageMap = new Map<string, string>(
			languages.map(({ languageName, id }) => [languageName.toLowerCase(), id])
		)
		writeSuperJSON('languageMap', languageMap)
	},
} satisfies ListrJob

typeOutput.push('export type LanguageMap = Map<string, string>')

// #endregion

// #region Social Media Services
export const generateSocialMediaMap = {
	title: 'Generate Social Media Map',
	task: async (_ctx, task) => {
		attachLogger(task)
		const services = await prisma.socialMediaService.findMany({
			select: { name: true, id: true },
		})
		task.output = `Social Media Services retrieved: ${services.length}`
		const socialMediaMap = new Map<string, string>(services.map(({ name, id }) => [name.toLowerCase(), id]))
		writeSuperJSON('socialMediaMap', socialMediaMap)
	},
} satisfies ListrJob

typeOutput.push('export type SocialMediaMap = Map<string, string>')

// #endregion

// #region User Types

export const generateUserTypeMap = {
	title: 'Generate User Type Map',
	task: async (_ctx, task) => {
		attachLogger(task)
		const types = await prisma.userType.findMany({
			select: { type: true, id: true },
		})
		task.output = `User Types retrieved: ${types.length}`
		const userTypeMap = new Map<string, string>(types.map(({ type, id }) => [type, id]))
		writeSuperJSON('userTypeMap', userTypeMap)
	},
} satisfies ListrJob

typeOutput.push('export type UserTypeMap = Map<string, string>')

// #endregion

// #region User IDs

export const generateUserIdMap = {
	title: 'Generate User ID Map',
	task: async (_ctx, task) => {
		attachLogger(task)
		const users = await prisma.user.findMany({
			select: { id: true, legacyId: true },
		})
		task.output = `Users retrieved: ${users.length}`
		const userIdMap = new Map<string, string>(
			compact(users.map((u) => (u.legacyId ? [u.legacyId, u.id] : undefined)))
		)
		writeSuperJSON('userIdMap', userIdMap)
	},
} satisfies ListrJob

typeOutput.push('export type UserIdMap = Map<string, string>')

// #endregion

// #region Permissions

export const generatePermissionMap = {
	title: 'Generate Permission Map',
	task: async (_ctx, task) => {
		attachLogger(task)
		const permissions = await prisma.permission.findMany({
			select: { name: true, id: true },
		})
		task.output = `Permissions retrieved: ${permissions.length}`
		const permissionMap = new Map<string, string>(permissions.map(({ name, id }) => [name.toLowerCase(), id]))
		writeSuperJSON('permissionMap', permissionMap)
	},
} satisfies ListrJob

typeOutput.push('export type PermissionMap = Map<string, string>')

// #endregion

// #region Translation Keys

export const generateTranslationKeySet = {
	title: 'Generate Translation Key Set',
	task: async (_ctx, task) => {
		attachLogger(task)
		const keys = await prisma.translationKey.findMany({
			select: { key: true },
		})
		task.output = `Translation Keys retrieved: ${keys.length}`
		const translationKeySet = new Set<string>(keys.map(({ key }) => key))
		writeSuperJSON('translationKeySet', translationKeySet)
	},
} satisfies ListrJob

typeOutput.push('export type TranslationKeySet = Set<string>')

export const generateTranslationMap = {
	title: 'Generate Translation Key Set',
	task: async (_ctx, task) => {
		attachLogger(task)
		const items = await prisma.translationKey.findMany({
			select: { key: true, text: true },
		})
		task.output = `Translation Items retrieved: ${items.length}`
		const translationMap = new Map<string, string>(items.map(({ key, text }) => [key, text]))
		writeSuperJSON('translationMap', translationMap)
	},
} satisfies ListrJob

typeOutput.push('export type TranslationMap = Map<string, string>')

// #endregion

// #region Types

export const generateTypes = {
	title: 'Generate Types',
	task: async (_ctx, task) => {
		attachLogger(task)

		const output = typeOutput.join('\n\n')

		task.output = `Types exported: ${typeOutput.length}`
		fs.writeFileSync(path.resolve(__dirname, '../generated/', 'types.ts'), output)
	},
}

// #endregion
