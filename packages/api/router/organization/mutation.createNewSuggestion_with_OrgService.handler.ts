import { addSingleKey, buildContextUrl } from '@weareinreach/crowdin/api'
import { generateId, getAuditedClient } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TCreateNewSuggestionSchema } from './mutation.createNewSuggestion.schema'

const createNewSuggestion = async ({
	ctx,
	input,
}: TRPCHandlerParams<TCreateNewSuggestionSchema, 'protected'>) => {
	const prisma = getAuditedClient(ctx.actorId)
	const { countryId, orgName, orgSlug, communityFocus, orgAddress, orgWebsite, serviceCategories } = input

	// Phase 1: DB-only transaction. Creates the organization, its location, and other placeholder
	// records. This must run before Crowdin sync because the per-service Crowdin context URL needs the
	// new location's id, and it must run in a transaction of its own (not the one below) because Crowdin
	// sync (a network call to a third party) must not happen inside a Prisma interactive transaction -
	// those have a ~5s timeout, and holding one open across an external API call risks "Transaction
	// already closed" once Crowdin is slow to respond.
	const { organizationId, newOrgLocation, serviceTags } = await prisma.$transaction(async (tx) => {
		console.log('Starting transaction to create a new organization and related records.')
		// 1. Create the new Organization record first.
		const newOrganization = await tx.organization.create({
			data: {
				id: generateId('organization'),
				name: orgName,
				slug: orgSlug,
				source: { connect: { source: 'suggestion' } },
			},
		})

		const organizationId = newOrganization.id
		console.log('Organization created with ID:', organizationId)

		// 2. Create the Suggestion record.
		await tx.suggestion.create({
			data: {
				organizationId: organizationId,
				suggestedById: ctx.actorId,
				data: input,
			},
		})
		console.log('Suggestion record created.')

		// 3. Create placeholder data for other related tables.
		const createOperations = []

		// A. Add the OrgWebsite record if a website URL was provided.
		if (orgWebsite) {
			console.log('Adding OrgWebsite creation to the queue.')
			createOperations.push(
				tx.orgWebsite.create({
					data: {
						organizationId: organizationId,
						url: orgWebsite,
					},
				})
			)
		}

		// B. Create the OrgLocation record if an address was provided.
		let newOrgLocation = null
		if (orgAddress && Object.keys(orgAddress).length > 0) {
			console.log('Creating OrgLocation record...')
			const cleanedStreet1 = orgAddress.street1?.replace('undefined', '').trim()

			// Find the ID for the government district based on either the full name or the abbreviation.
			const govDist = await tx.govDist.findFirst({
				where: {
					OR: [{ name: orgAddress.govDist ?? undefined }, { abbrev: orgAddress.govDist ?? undefined }],
				},
				select: { id: true },
			})

			newOrgLocation = await tx.orgLocation.create({
				data: {
					orgId: organizationId,
					name: orgName,
					street1: cleanedStreet1,
					city: orgAddress.city ?? '',
					postCode: orgAddress.postCode,
					govDistId: govDist?.id,
					countryId: countryId,
				},
			})
			console.log('OrgLocation created with ID:', newOrgLocation.id)
		}

		// D. Add AttributeSupplement records for each selected community.
		if (communityFocus && communityFocus.length > 0) {
			console.log('Adding AttributeSupplement records to the queue.')
			const communityCreates = communityFocus.map((attributeId) =>
				tx.attributeSupplement.create({
					data: {
						organizationId: organizationId,
						attributeId: attributeId,
					},
				})
			)
			createOperations.push(...communityCreates)
		}

		// C. Look up the service tags to create, if any. The actual OrgService creation happens after
		// Crowdin sync, in phase 3 below, since it needs the crowdinId from that sync.
		let serviceTags: Array<{ id: string; name: string }> = []
		if (serviceCategories && serviceCategories.length > 0 && newOrgLocation) {
			console.log('Service categories and location exist. Looking up matching service tags.')
			console.log('Input serviceCategories:', serviceCategories)

			// *** THE FIX: Two-step query to handle the join table correctly. ***
			// Step 1: Query the ServiceTagToCategory join table to get the serviceTagIds.
			const serviceTagsToCategory = await tx.serviceTagToCategory.findMany({
				where: {
					categoryId: { in: serviceCategories },
				},
				select: {
					serviceTagId: true,
				},
			})

			// Step 2: Use the IDs from the first query to get the full ServiceTag records.
			const serviceTagIds = serviceTagsToCategory.map((item) => item.serviceTagId)
			serviceTags = await tx.serviceTag.findMany({
				where: {
					id: { in: serviceTagIds },
				},
				select: {
					id: true,
					name: true,
				},
			})

			console.log('Service tags fetched:', serviceTags)
		} else {
			console.log('No services to create. Check if categories were selected and a location was provided.')
		}

		// E. Execute all other create operations in parallel for efficiency.
		console.log('Awaiting all creation operations to complete...')
		await Promise.all(createOperations)
		console.log('All creation operations completed successfully.')

		return { organizationId, newOrgLocation, serviceTags }
	})
	console.log('Phase 1 transaction finalized successfully.')

	// Phase 2: Crowdin sync for each service tag, outside any DB transaction.
	const serviceSyncData = newOrgLocation
		? await Promise.all(
				serviceTags.map(async (serviceTag) => {
					const osvcId = generateId('orgService')
					const freeTextKey = `${organizationId}.${osvcId}.name`

					// Sync to Crowdin first, so the string is created with context from the start (see the
					// real-time-sync convention used throughout packages/api/router/**/mutation.*.handler.ts).
					const crowdin = await addSingleKey({
						isDatabaseString: true,
						key: freeTextKey,
						text: serviceTag.name,
						context: buildContextUrl(orgSlug, newOrgLocation.id),
					})

					return { serviceTag, osvcId, freeTextKey, crowdinId: crowdin.id }
				})
			)
		: []

	// Phase 3: DB-only transaction. Creates the TranslationKey, FreeText, and OrgService records for
	// each service tag synced in phase 2.
	if (serviceSyncData.length > 0 && newOrgLocation) {
		const createdServices = await prisma.$transaction(async (tx) => {
			return Promise.all(
				serviceSyncData.map(async ({ serviceTag, osvcId, freeTextKey, crowdinId }) => {
					const newTranslationKey = await tx.translationKey.create({
						data: {
							key: freeTextKey,
							ns: 'org-data',
							text: serviceTag.name,
							crowdinId,
						},
					})

					const newFreeText = await tx.freeText.create({
						data: {
							id: generateId('freeText'),
							key: newTranslationKey.key,
							ns: newTranslationKey.ns,
						},
					})

					// Create the OrgService record, connecting it to the FreeText and the new location.
					const createdService = await tx.orgService.create({
						data: {
							id: osvcId,
							organizationId: organizationId,
							serviceNameId: newFreeText.id,
							// Use nested 'create' to properly link to the join tables for the many-to-many relationships
							services: {
								create: {
									tagId: serviceTag.id,
								},
							},
							locations: {
								create: {
									location: {
										connect: {
											id: newOrgLocation.id,
										},
									},
								},
							},
						},
					})
					console.log('OrgService created with ID:', createdService.id)
					return createdService
				})
			)
		})
		console.log(
			'Successfully created the following OrgService records:',
			createdServices.map((s) => s.id)
		)
	}

	console.log('Transaction finalized successfully.')
	return { id: organizationId }
}
export default createNewSuggestion
