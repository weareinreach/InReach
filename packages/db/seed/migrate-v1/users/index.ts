import fs from 'fs'
import invariant from 'tiny-invariant'

import { Prisma, User, UserSurvey } from '~/client'
import { UsersJSONCollection } from '~/datastore/v1/mongodb/output-types/users'
import { countryMap } from '~/datastore/v1/util/countryOrigin'
import { currentLocationMap } from '~/datastore/v1/util/currentLocation'
import { ethnicityMap } from '~/datastore/v1/util/ethnicity'
import { immigrationMap } from '~/datastore/v1/util/immigration'
import { prisma } from '~/index'
import { migrateLog } from '~/seed/logger'
import { ListrTask } from '~/seed/migrate-v1'

type BulkTransactions = Prisma.Prisma__UserClient<User> | Prisma.Prisma__UserSurveyClient<UserSurvey>

const batchSize = 250

const userData = JSON.parse(
	fs.readFileSync('./datastore/v1/mongodb/output/users.json', 'utf-8')
) as UsersJSONCollection[]

export const migrateUsers = async (task: ListrTask) => {
	const bulkTransactions: BulkTransactions[] = []
	let logMessage = ``
	let countA = 0

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
				if (immigrationMap.get(user.immigrationStatus) === undefined) return undefined
				return {
					connect: {
						status: immigrationMap.get(user.immigrationStatus),
					},
				}
			}
			if (user.immigrationStatus?.length) {
				return {
					connect: {
						status: immigrationMap.get(user.immigrationStatus[0] as unknown as string),
					},
				}
			}
			return undefined
		}
		/* If the user has an array for their ethnicityRace, return an object with a connect property that has a
		   status property that is the value of the ethnicityMap.get() function. If the user does not have an array
       for their ethnicityRace, return undefined */
		const ethnicity = user.ethnicityRace?.length
			? { connect: user.ethnicityRace.map((item: string) => ({ ethnicity: ethnicityMap.get(item) })) }
			: undefined

		/* If the user has a country of origin, return an object with a connect property that has a cca3
			 property that is the value of the countryMap.get() function. If the user does not have a country
			 of origin, return undefined */
		const countryOrigin =
			user.countryOfOrigin && countryMap.get(user.countryOfOrigin)
				? { connect: { cca3: countryMap.get(user.countryOfOrigin) } }
				: undefined

		/* Destructuring the user object and assigning the values of the currentLocationMap to the variables. */
		let { currentCity, currentCountry, currentGovDist }: Record<string, CurrentLocation> = {
			currentCity: undefined,
			currentCountry: undefined,
			currentGovDist: undefined,
		}
		if (user.currentLocation && currentLocationMap.get(user.currentLocation)) {
			const location = currentLocationMap.get(user.currentLocation)
			invariant(location)
			currentCity = location.currCity
			currentCountry = { connect: { cca3: location.currCountry } }
			currentGovDist = location.currGovDist ? { connect: { slug: location.currGovDist } } : undefined
		}

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
		logMessage = `(${countA + 1}/${userData.length}) Preparing user record: ${user._id.$oid}`
		migrateLog.info(logMessage)
		// task.output = logMessage
		const userTransaction = prisma.user.upsert({
			where: {
				email: user.email,
			},
			create: {
				email: user.email,
				name,
				legacyId: user._id.$oid,
				currentCity,
				currentGovDist,
				currentCountry,
				createdAt: user.created_at.$date,
				updatedAt: user.updated_at.$date,
				langPref: {
					connect: {
						localeCode: 'en',
					},
				},
				userType: {
					connect: {
						type: role().type,
					},
				},
				role: {
					connect: {
						name: role().name,
					},
				},
				legacyHash: user.hash,
				legacySalt: user.salt,
			},
			update: {
				name,
				legacyId: user._id.$oid,

				currentCity,
				currentGovDist,
				currentCountry,
				updatedAt: user.updated_at.$date,
				langPref: {
					connect: {
						localeCode: 'en',
					},
				},
				userType: {
					connect: {
						type: role().type,
					},
				},
				role: {
					connect: {
						name: role().name,
					},
				},
				legacyHash: user.hash,
				legacySalt: user.salt,
			},
		})
		bulkTransactions.push(userTransaction)

		if (ethnicity || countryOrigin || getImmigrationStatus()) {
			const userSurvey = prisma.userSurvey.create({
				data: {
					ethnicity,
					countryOrigin,
					immigration: getImmigrationStatus(),
				},
			})

			bulkTransactions.push(userSurvey)
		}
		countA++
	}
	let countB = 1
	let countC = 0
	const totalRecords = bulkTransactions.length
	const totalBatches = Math.ceil(bulkTransactions.length / batchSize)
	while (bulkTransactions.length) {
		const batch = bulkTransactions.splice(0, batchSize)
		logMessage = `Batch ${countB} of ${totalBatches}: Upserting records ${countC + 1} to ${
			countC + batch.length
		} of ${totalRecords}`
		migrateLog.info(logMessage)
		task.output = logMessage
		// const batchProcess = batch.map((record) => prisma.user.upsert(record))
		await prisma.$transaction(batch)
		countB++
		countC = countC + batch.length
	}
	task.title = `Migrate User Database (${countC + 1} records)`
}

type CurrentLocation =
	| Prisma.GovDistCreateNestedOneWithoutUserInput
	| Prisma.CountryCreateNestedOneWithoutCurrentUsersInput
	| string
	| undefined
