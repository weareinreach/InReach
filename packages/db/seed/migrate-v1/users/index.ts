import cuid from 'cuid'
import fs from 'fs'
import invariant from 'tiny-invariant'

import { Prisma } from '~/client'
import { govDistMap } from '~/datastore/v1/helpers/locDataMaps'
import { UsersJSONCollection } from '~/datastore/v1/mongodb/output-types/users'
import { countryMap } from '~/datastore/v1/util/countryOrigin'
import { currentLocationMap } from '~/datastore/v1/util/currentLocation'
import { ethnicityMap } from '~/datastore/v1/util/ethnicity'
import { immigrationMap } from '~/datastore/v1/util/immigration'
import { ageMap } from '~/datastore/v1/util/userAge'
import { sogMap } from '~/datastore/v1/util/userSog'
import { prisma } from '~/index'
import { Log, iconList } from '~/seed/lib'
import { migrateLog } from '~/seed/logger'
import { ListrTask } from '~/seed/migrate-v1'

const batchSize = 250

const userData = JSON.parse(
	fs.readFileSync('./datastore/v1/mongodb/output/users.json', 'utf-8')
) as UsersJSONCollection[]

type Data = {
	user: Prisma.UserCreateManyInput[]
	userSurvey: Prisma.UserSurveyCreateManyInput[]
	assignedRole: Prisma.AssignedRoleCreateManyInput[]

	surveyEthnicity: Prisma.SurveyEthnicityCreateManyInput[]
	surveySog: Prisma.SurveySOGCreateManyInput[]
}

export const migrateUsers = async (task: ListrTask) => {
	const log: Log = (message, icon?, indent = false, silent = false) => {
		const dispIcon = icon ? `${iconList(icon)} ` : ''
		const formattedMessage = `${indent ? '\t' : ''}${dispIcon}${message}`
		migrateLog.info(formattedMessage)
		if (!silent) task.output = formattedMessage
	}

	const data: Data = {
		user: [],
		assignedRole: [],
		userSurvey: [],
		surveyEthnicity: [],
		surveySog: [],
	}

	const getUserRoles = await prisma.userRole.findMany({ select: { name: true, id: true } })
	const userRoleMap = new Map<string, string>(getUserRoles.map(({ name, id }) => [name, id]))
	const getUserTypes = await prisma.userType.findMany({ select: { id: true, type: true } })
	const userTypeMap = new Map<string, string>(getUserTypes.map(({ type, id }) => [type, id]))
	const getCountryIds = await prisma.country.findMany({ select: { id: true, cca3: true } })
	const countryIdMap = new Map<string, string>(getCountryIds.map(({ cca3, id }) => [cca3, id]))
	const getImmigrationId = await prisma.userImmigration.findMany({ select: { id: true, status: true } })
	const immigrationIdMap = new Map<string, string>(getImmigrationId.map(({ status, id }) => [status, id]))
	const getEthnicityId = await prisma.userEthnicity.findMany({ select: { id: true, ethnicity: true } })
	const ethnicityIdMap = new Map<string, string>(getEthnicityId.map(({ ethnicity, id }) => [ethnicity, id]))
	const getGovDistSlug = await prisma.govDist.findMany({ select: { id: true, slug: true } })
	const govDistSlugMap = new Map<string, string>(getGovDistSlug.map(({ slug, id }) => [slug, id]))
	const getUserSogId = await prisma.userSOGIdentity.findMany({ select: { id: true, tsKey: true } })
	const userSogIdMap = new Map<string, string>(getUserSogId.map(({ id, tsKey }) => [tsKey, id]))

	let countA = 0

	log(`Prepare user data (${userData.length} entries to parse)`, 'generate')
	for (const user of userData) {
		const name = user.name === 'user name' ? undefined : user.name

		/**
		 * If the user has a string for their immigration status, return an object with a connect property that
		 * has a status property that is the value of the immigrationMap.get() function. If the user has an array
		 * for their immigration status, return an object with a connect property that has a status property that
		 * is the value of the immigrationMap.get() function. If the user has neither a string nor an array for
		 * their immigration status, return undefined
		 *
		 * @returns Connect: { status: immigrationMap.get(user.immigrationStatus[0] as unknown as string), },
		 */
		const getImmigrationStatus = () => {
			if (typeof user.immigrationStatus === 'string') {
				const status = immigrationMap.get(user.immigrationStatus)
				const id = immigrationIdMap.get(status ?? '')
				return id
			}
			if (user.immigrationStatus?.length) {
				const status = immigrationMap.get(user.immigrationStatus[0] as unknown as string)
				const id = immigrationIdMap.get(status ?? '')
				return id
			}
			return undefined
		}
		/* If the user has an array for their ethnicityRace, return an object with a connect property that has a
		   status property that is the value of the ethnicityMap.get() function. If the user does not have an array
       for their ethnicityRace, return undefined */
		const ethnicity = user.ethnicityRace?.length
			? user.ethnicityRace.map((item: string) => ethnicityIdMap.get(ethnicityMap.get(item) ?? ''))
			: undefined

		/* If the user has a country of origin, return an object with a connect property that has a cca3
			 property that is the value of the countryMap.get() function. If the user does not have a country
			 of origin, return undefined */
		const countryOrigin = countryMap.get(user.countryOfOrigin ?? '')
		const countryOriginId = countryIdMap.get(countryOrigin ?? '')

		/* Destructuring the user object and assigning the values of the currentLocationMap to the variables. */

		const location = currentLocationMap.get(user.currentLocation ?? '')
		const currentCity = location?.currCity
		const currentCountryId = countryIdMap.get(location?.currCountry ?? '')
		const currentGovDistId = govDistSlugMap.get(govDistMap.get(location?.currGovDist ?? '') ?? '')

		/**
		 * If the user is an admin data manager, return the role type and name of 'dataManager' and 'Data
		 * Manager'. If the user is an admin developer, return the role type and name of 'sysadmin' and 'System
		 * Administrator'. If the user is a data manager, return the role type and name of 'dataManager' and 'Data
		 * Manager'. If the user is a reviewer approved, return the role type and name of 'lcr' and 'Local
		 * Community Reviewer'. If the user is a professional, return the role type and name of 'provider' and
		 * 'Service Provider'. If none of the above are true, return the role type and name of 'seeker' and
		 * 'Resource Seeker'
		 *
		 * @returns The role object is being returned.
		 */
		const role = () => {
			switch (true) {
				case user.isAdminDataManager:
					return { type: 'dataManager', name: 'Data Manager' }
				case user.isAdminDeveloper:
					return { type: 'sysadmin', name: 'System Administrator' }
				case user.isDataManager:
					return { type: 'dataManager', name: 'Data Manager' }
				case user.isReviewerApproved:
					return { type: 'lcr', name: 'Local Community Reviewer' }
				case user.isProfessional:
					return { type: 'provider', name: 'Service Provider' }

				default:
					return { type: 'seeker', name: 'Resource Seeker' }
			}
		}
		log(`(${countA + 1}/${userData.length}) Preparing user record: ${user._id.$oid}`, 'generate', true, true)
		const id = cuid()
		const roleId = userRoleMap.get(role().name)
		const userTypeId = userTypeMap.get(role().type)

		invariant(roleId && userTypeId)

		data.user.push({
			id,
			email: user.email,
			name,
			legacyId: user._id.$oid,
			legacyHash: user.hash,
			legacySalt: user.salt,
			createdAt: user.created_at.$date,
			updatedAt: user.updated_at.$date,
			userTypeId,
		})
		data.assignedRole.push({
			userId: id,
			roleId,
		})

		if (ethnicity || countryOrigin || getImmigrationStatus()) {
			const immigrationId = getImmigrationStatus()
			const surveyId = cuid()
			data.userSurvey.push({
				id: surveyId,
				countryOriginId,
				immigrationId,
				birthYear: ageMap.get(user.age ?? ''),
				currentCity,
				currentCountryId,
				currentGovDistId,
			})

			if (ethnicity?.length) {
				for (const item of ethnicity) {
					if (!item) continue
					data.surveyEthnicity.push({
						surveyId,
						ethnicityId: item,
					})
				}
			}
			if (user.sogIdentity?.length) {
				for (const item of user.sogIdentity) {
					const tag = sogMap.get(item)
					const sogId = userSogIdMap.get(tag ?? '')
					if (sogId) {
						data.surveySog.push({
							surveyId,
							sogId,
						})
					}
				}
			}
		}
		countA++
	}
	let countB = 1
	let countC = 0
	const totalRecords = data.user.length
	const totalBatches = Math.ceil(data.user.length / batchSize)
	while (data.user.length) {
		const batch = data.user.splice(0, batchSize)
		log(
			`Batch ${countB} of ${totalBatches}: Creating records ${countC + 1} to ${
				countC + batch.length
			} of ${totalRecords}`,
			'gear'
		)
		const result = await prisma.user.createMany({ data: batch, skipDuplicates: true })
		log(`Records created: ${result.count}`, 'create', true)
		countB++
		countC = countC + batch.length
	}
	log(`Create survey records`, 'gear')
	const surveyResult = await prisma.userSurvey.createMany({ data: data.userSurvey, skipDuplicates: true })
	log(`Base surveys created: ${surveyResult.count}`, 'create', true)
	log(`Create survey links for multiple choice answers`, 'gear')
	const ethnicityResult = await prisma.surveyEthnicity.createMany({
		data: data.surveyEthnicity,
		skipDuplicates: true,
	})
	log(`Ethnicity links created: ${ethnicityResult.count}`, 'create', true)
	const sogResult = await prisma.surveySOG.createMany({ data: data.surveySog, skipDuplicates: true })
	log(`SOG identity links created: ${sogResult.count}`, 'create', true)
	task.title = `Migrate User Database (${countC + 1} records)`
}
