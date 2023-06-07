import { type Prisma } from '@prisma/client'
import compact from 'just-compact'
import { z } from 'zod'

import fs from 'fs'
import path from 'path'

import { prisma } from '~db/client'

const OrgAndServ = z.object({ orgLegacyId: z.string(), serviceLegacyId: z.string() }).array()
const OrgOnly = z.object({ legacyId: z.string() }).array()
const OrgAndMaybeServ = z.object({ orgLegacyId: z.string(), serviceLegacyId: z.string().nullish() }).array()

const getJSON = (file: string) => JSON.parse(fs.readFileSync(path.resolve(__dirname, file), 'utf-8'))

const writeOut = (data: unknown, file: string) =>
	fs.writeFileSync(path.resolve(__dirname, file), JSON.stringify(data))

const main = async () => {
	const serviceAttribOut: Prisma.ServiceAttributeCreateManyInput[] = []
	const orgAttribOut: Prisma.OrganizationAttributeCreateManyInput[] = []
	const serviceTagOut: Prisma.OrgServiceTagCreateManyInput[] = []
	const exceptions: Exceptions[] = []

	const orgData = await prisma.organization.findMany({ select: { legacyId: true, id: true } })
	const serviceData = await prisma.orgService.findMany({ select: { legacyId: true, id: true } })
	const idMap = new Map<string, string>([
		...(compact(orgData.map(({ id, legacyId }) => (legacyId ? [legacyId, id] : undefined))) satisfies [
			string,
			string
		][]),
		...(compact(serviceData.map(({ id, legacyId }) => (legacyId ? [legacyId, id] : undefined))) satisfies [
			string,
			string
		][]),
	])
	const addServiceTag = ({ orgLegacyId, serviceLegacyId, tagId, serviceTag }: AddServiceTag) => {
		const serviceId = idMap.get(serviceLegacyId)
		if (serviceId) {
			serviceTagOut.push({ serviceId, tagId })
		} else {
			exceptions.push({ orgLegacyId, serviceLegacyId, tagId, serviceTag })
		}
	}
	const addAttrib = ({ attribute, attributeId, orgLegacyId, serviceLegacyId, attachBoth }: AddAttribute) => {
		const orgServiceId = idMap.get(serviceLegacyId ?? '')
		const organizationId = idMap.get(orgLegacyId)

		if (orgServiceId || organizationId) {
			if (orgServiceId)
				serviceAttribOut.push({
					orgServiceId,
					attributeId,
				})
			if (organizationId && (!orgServiceId || attachBoth)) {
				orgAttribOut.push({ attributeId, organizationId })
			}
		} else {
			exceptions.push({ attribute, attributeId, orgLegacyId, serviceLegacyId })
		}
	}

	// art, music, literature
	console.log('art, music, literature')
	const artMusicLit = OrgAndServ.parse(getJSON('!art-music-lit.json'))
	for (const item of artMusicLit) {
		const tagId = 'svtg_01H273BXC1T475GPEW4TXZ3Z20'
		const { serviceLegacyId, orgLegacyId } = item
		addServiceTag({ serviceLegacyId, tagId, serviceTag: 'Art, Music, Literature', orgLegacyId })
	}

	// community re-entry services
	console.log('community re-entry services')
	const communityReEntry = OrgAndServ.parse(getJSON('!community-reentry-services.json'))
	for (const item of communityReEntry) {
		const tagId = 'svtg_01H273CH9YC9PXQWJ5RV349T2F'
		const { orgLegacyId, serviceLegacyId } = item
		addServiceTag({ serviceLegacyId, tagId, serviceTag: 'Re-entry Services', orgLegacyId })
	}

	// community social groups
	console.log('community social groups')
	const communitySocialGroups = OrgAndServ.parse(getJSON('!community-social-groups.json'))
	for (const item of communitySocialGroups) {
		const tagId = 'svtg_01H2738F1W23TZXB23VNPR9JM3'
		const { orgLegacyId, serviceLegacyId } = item
		addServiceTag({ serviceLegacyId, tagId, serviceTag: 'Community & Social Groups', orgLegacyId })
	}

	// focus: caregivers
	console.log('focus: caregivers')
	const focusCaregivers = OrgAndServ.parse(getJSON('!focus-caregivers.json'))
	for (const item of focusCaregivers) {
		const attributeId = 'attr_01H273G39A14TGHT4DA1T0DW5M'
		const { orgLegacyId, serviceLegacyId } = item
		addAttrib({ serviceLegacyId, orgLegacyId, attributeId, attribute: 'Caregivers Community' })
	}

	//focus : disabled
	console.log('focus: disabled')
	const focusDisabled = OrgAndServ.parse(getJSON('!focus-disabled.json'))
	for (const item of focusDisabled) {
		const attributeId = 'attr_01H273ETEX43K0BR6FG3G7MZ4S'
		const { orgLegacyId, serviceLegacyId } = item
		addAttrib({ serviceLegacyId, orgLegacyId, attributeId, attribute: 'Disabled Community' })
	}

	// focus: elders
	console.log('focus: elders')
	const focusElders = OrgAndServ.parse(getJSON('!focus-elders.json'))
	for (const item of focusElders) {
		const attributeId = 'attr_01H273FCJ8NNG1T1BV300CN702'
		const { orgLegacyId, serviceLegacyId } = item
		addAttrib({ serviceLegacyId, orgLegacyId, attributeId, attribute: 'Elders Community' })
	}

	//focus : incarcerated
	console.log('focus: incarcerated')
	const focusIncarcerated = OrgAndServ.parse(getJSON('!focus-incarcerated.json'))
	for (const item of focusIncarcerated) {
		const attributeId = 'attr_01H273FPTCFKTVBNK158HE9M42'
		const { orgLegacyId, serviceLegacyId } = item
		addAttrib({ serviceLegacyId, orgLegacyId, attributeId, attribute: 'Incarcerated Community' })
	}

	//focus: women
	console.log('focus: women')
	const focusWomen = OrgAndServ.parse(getJSON('!focus-women.json'))
	for (const item of focusWomen) {
		const attributeId = 'attr_01H273DMQ22TVP3RA36M1XWFBA'
		const { orgLegacyId, serviceLegacyId } = item
		addAttrib({ serviceLegacyId, orgLegacyId, attributeId, attribute: 'Focused on Women' })
	}

	// leader: women
	console.log('leader: women')
	const leaderWomen = OrgOnly.parse(getJSON('!leader-women.json'))
	for (const item of leaderWomen) {
		const attributeId = 'attr_01H273GW0GN44GZ5RK1F51Z1QZ'
		const { legacyId: orgLegacyId } = item
		addAttrib({ orgLegacyId, attributeId, attribute: 'Women-led' })
	}

	// private practice
	console.log('private practice')
	const privatePractice = OrgOnly.parse(getJSON('!private-practice.json'))
	for (const item of privatePractice) {
		const attributeId = 'attr_01H273GHADR15DGYH06SSN5XVG'
		const { legacyId: orgLegacyId } = item
		addAttrib({ orgLegacyId, attributeId, attribute: 'Private Practice' })
	}

	// religiously affiliated
	console.log('religiously affiliated')
	const religiouslyAffiliated = OrgOnly.parse(getJSON('!religious-affiliated.json'))
	for (const item of religiouslyAffiliated) {
		const attributeId = 'attr_01GW2HHFV5GNC11E5NVN7460QB'
		const { legacyId: orgLegacyId } = item
		addAttrib({ orgLegacyId, attributeId, attribute: 'Religiously Affiliated' })
	}

	// remote
	console.log('remote')
	const remote = OrgAndMaybeServ.parse(getJSON('!remote.json'))
	for (const item of remote) {
		const attributeId = 'attr_01GW2HHFV5Q7XN2ZNTYFR1AD3M'
		const { orgLegacyId, serviceLegacyId } = item
		addAttrib({ serviceLegacyId, orgLegacyId, attributeId, attribute: 'Remote' })
	}

	console.log('write out files')
	writeOut(serviceAttribOut, '!OUT-service-attribute.json')
	writeOut(orgAttribOut, '!OUT-organization-attribute.json')
	writeOut(serviceTagOut, '!OUT-service-tag.json')
	writeOut(exceptions, '!OUT-exceptions.json')
}
main()

type Exceptions = {
	orgLegacyId: string
	serviceLegacyId?: string | undefined | null
} & { [k: string]: unknown }

interface AddServiceTag {
	orgLegacyId: string
	serviceLegacyId: string
	tagId: string
	serviceTag: string
}
interface AddAttribute {
	orgLegacyId: string
	serviceLegacyId?: string | null
	attributeId: string
	attribute: string
	attachBoth?: boolean
}

// Generated by https://quicktype.io
