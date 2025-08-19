import { generateId, getAuditedClient } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TCreateNewSuggestionSchema } from './mutation.createNewSuggestion.schema'

const createNewSuggestion = async ({
	ctx,
	input,
}: TRPCHandlerParams<TCreateNewSuggestionSchema, 'protected'>) => {
	const prisma = getAuditedClient(ctx.actorId)
	const { countryId, orgName, orgSlug, communityFocus, orgAddress, orgWebsite, serviceCategories } = input

	// Use a transaction to ensure all database operations are atomic.
	// If any operation fails, the entire transaction is rolled back.
	const result = await prisma.$transaction(async (tx) => {
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

		// C. Handle the complex OrgService creation, which now depends on a location.
		// Services are only created if a location is also created.
		if (serviceCategories && serviceCategories.length > 0 && newOrgLocation) {
			console.log('Service categories and location exist. Mapping service creation promises.')
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
			const serviceTags = await tx.serviceTag.findMany({
				where: {
					id: { in: serviceTagIds },
				},
				select: {
					id: true,
					name: true,
				},
			})

			console.log('Service tags fetched:', serviceTags)

			// Use a map to create a new array of promises
			const servicePromises = serviceTags.map(async (serviceTag) => {
				const osvcId = generateId('orgService')
				const freeTextKey = `${organizationId}.${osvcId}.name`

				// Create the TranslationKey and FreeText records first
				const newTranslationKey = await tx.translationKey.create({
					data: {
						key: freeTextKey,
						ns: 'org-data',
						text: serviceTag.name,
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

			// Explicitly await the service creation promises and log the result
			const createdServices = await Promise.all(servicePromises)
			console.log(
				'Successfully created the following OrgService records:',
				createdServices.map((s) => s.id)
			)

			// Add the created services to the main operations array
			createOperations.push(...createdServices)
		} else {
			console.log('No services created. Check if categories were selected and a location was provided.')
		}

		// E. Execute all other create operations in parallel for efficiency.
		console.log('Awaiting all creation operations to complete...')
		await Promise.all(createOperations)
		console.log('All creation operations completed successfully.')

		// Return the newly created organization's ID.
		return { id: organizationId }
	})
	console.log('Transaction finalized successfully.')
	return result
}
export default createNewSuggestion
