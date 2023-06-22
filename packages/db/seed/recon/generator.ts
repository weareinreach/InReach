import compact from 'just-compact'
import superjson from 'superjson'

import fs from 'fs'
import path from 'path'

import { prisma, type Prisma } from '~db/client'
import { attachLogger } from '~db/seed/recon/logger'
import { type ListrJob } from '~db/seed/recon/types'

// import { createLogger } from './logger'

const writeSuperJSON = (filename: string, data: unknown) => {
	fs.writeFileSync(path.resolve(__dirname, `./generated/${filename}.json`), superjson.stringify(data))
}

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

export const generateDistList = {
	title: 'Generate Governing District List',
	task: async (_ctx, task) => {
		attachLogger(task)
		const countries = ['AS', 'UM', 'MX', 'MP', 'CA', 'VI', 'US', 'PR', 'GU']
		const dists = await prisma.govDist.findMany({
			where: { country: { cca2: { in: countries } } },
			select: { id: true, slug: true },
			orderBy: { slug: 'asc' },
		})
		task.output = `Districts retrieved: ${dists.length}`
		writeSuperJSON('distList', dists)
	},
} satisfies ListrJob

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

export const generateAttributeMap = {
	title: 'Generate Attribute Map',
	task: async (_ctx, task) => {
		attachLogger(task)
		const attributes = await prisma.attribute.findMany({
			select: {
				id: true,
				tsKey: true,
				requireText: true,
				requireLanguage: true,
				requireGeo: true,
				requireBoolean: true,
				requireData: true,
			},
		})
		task.output = `Attributes retrieved: ${attributes.length}`
		const attributeMap = new Map<string, Omit<(typeof attributes)[number], 'tsKey'>>(
			attributes.map(({ tsKey, ...rest }) => [tsKey, rest])
		)
		writeSuperJSON('attributeMap', attributeMap)
	},
} satisfies ListrJob

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
