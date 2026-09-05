import { TRPCError } from '@trpc/server'

import { addSingleKey, buildContextUrl, removeSingleKey } from '@weareinreach/crowdin/api'
import { generateFreeText, generateNestedFreeText, getAuditedClient, Prisma } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TDuplicateSchema } from './mutation.duplicate.schema'

interface PendingTextAttribute {
	supplementId: string
	attributeId: string
	boolean: boolean | null
	data: Prisma.InputJsonValue | typeof Prisma.JsonNull
	countryId: string | null
	languageId: string | null
	govDistId: string | null
	freeText: { id: string; key: string; ns: string }
	translationKey: { key: string; text: string; ns: string; crowdinId: number }
}

// Prisma represents a JSON column's actual `null` with the `Prisma.JsonNull` sentinel, not the literal
// `null` a read returns it as - passing literal `null` back into a create/createMany is a type error.
const toJsonInput = (value: unknown): Prisma.InputJsonValue | typeof Prisma.JsonNull =>
	value === null ? Prisma.JsonNull : (value as Prisma.InputJsonValue)

const duplicate = async ({ ctx, input }: TRPCHandlerParams<TDuplicateSchema, 'protected'>) => {
	const prisma = getAuditedClient(ctx.actorId)
	const { sourceServiceId, name, description, copyOptions, locationIds } = input

	const source = await prisma.orgService.findUniqueOrThrow({
		where: { id: sourceServiceId },
		select: {
			organizationId: true,
			crisisSupportOnly: true,
			organization: { select: { slug: true } },
			serviceName: { select: { tsKey: { select: { text: true } } } },
			attributes: {
				select: {
					attributeId: true,
					boolean: true,
					data: true,
					countryId: true,
					languageId: true,
					govDistId: true,
					text: { select: { tsKey: { select: { text: true } } } },
				},
			},
			hours: {
				select: {
					dayIndex: true,
					start: true,
					end: true,
					closed: true,
					tz: true,
					active: true,
					interval: true,
					open24hours: true,
				},
			},
			phones: { select: { orgPhoneId: true } },
			emails: { select: { orgEmailId: true } },
			websites: { select: { orgWebsiteId: true } },
			services: { select: { tagId: true } },
			serviceAreas: {
				select: {
					countries: { select: { countryId: true } },
					districts: { select: { govDistId: true } },
				},
			},
		},
	})

	const { organizationId } = source
	if (!organizationId) {
		throw new TRPCError({ code: 'BAD_REQUEST', message: 'Source service has no organization.' })
	}

	// Never trust client-supplied location ids - verify each one actually belongs to the same
	// organization as the source service before linking the new service to it.
	if (locationIds.length > 0) {
		const validLocations = await prisma.orgLocation.findMany({
			where: { id: { in: locationIds }, orgId: organizationId },
			select: { id: true },
		})
		if (validLocations.length !== locationIds.length) {
			throw new TRPCError({
				code: 'BAD_REQUEST',
				message: 'One or more locations do not belong to this organization.',
			})
		}
	}

	const newServiceId = ctx.generateId('orgService')

	const textAttributes = copyOptions.attributes
		? source.attributes.filter((attr) => attr.text?.tsKey.text)
		: []
	const plainAttributes = copyOptions.attributes
		? source.attributes.filter((attr) => !attr.text?.tsKey.text)
		: []

	// Crowdin sync (a network call to a third party) must not happen inside the DB transaction below -
	// Prisma's interactive transactions have a ~5s timeout, and holding it open across an external API
	// call risks "Transaction already closed" once Crowdin is slow to respond. Unlike the service's own
	// name (which defers registration for free - see the schema comment in mutation.upsert.handler.ts's
	// sibling logic), an attribute's free text is only ever written once, so there's no later save that
	// would pick up a null crowdinId - it has to be registered now.
	const pendingTextAttributes: PendingTextAttribute[] = []
	try {
		for (const attr of textAttributes) {
			const supplementId = ctx.generateId('attributeSupplement')
			const { freeText, translationKey } = generateFreeText({
				orgId: organizationId,
				itemId: supplementId,
				type: 'attSupp',
				text: attr.text?.tsKey.text ?? '',
			})
			const crowdin = await addSingleKey({
				isDatabaseString: true,
				key: translationKey.key,
				text: translationKey.text,
				context: buildContextUrl(source.organization?.slug ?? ''),
			})
			pendingTextAttributes.push({
				supplementId,
				attributeId: attr.attributeId,
				boolean: attr.boolean,
				data: toJsonInput(attr.data),
				countryId: attr.countryId,
				languageId: attr.languageId,
				govDistId: attr.govDistId,
				freeText,
				translationKey: { ...translationKey, crowdinId: crowdin.id },
			})
		}
	} catch (err) {
		// Compensating rollback: don't leave earlier-registered keys in this batch orphaned in
		// Crowdin just because a later one in the same loop failed.
		await Promise.all(
			pendingTextAttributes.map(({ translationKey }) =>
				removeSingleKey({ crowdinId: translationKey.crowdinId, isDatabaseString: true })
			)
		)
		throw err
	}

	const result = await prisma.$transaction(async (tx) => {
		const created = await tx.orgService.create({
			data: {
				id: newServiceId,
				published: false,
				deleted: false,
				crisisSupportOnly: source.crisisSupportOnly,
				organization: { connect: { id: organizationId } },
				duplicatedFrom: { connect: { id: sourceServiceId } },
				serviceName: generateNestedFreeText({
					orgId: organizationId,
					itemId: newServiceId,
					type: 'svcName',
					text: name,
				}),
				...(description && {
					description: generateNestedFreeText({
						orgId: organizationId,
						itemId: newServiceId,
						type: 'svcDesc',
						text: description,
					}),
				}),
				...(locationIds.length > 0 && {
					locations: {
						createMany: {
							data: locationIds.map((orgLocationId) => ({ orgLocationId })),
							skipDuplicates: true,
						},
					},
				}),
				...(copyOptions.serviceTags &&
					source.services.length > 0 && {
						services: {
							createMany: {
								data: source.services.map(({ tagId }) => ({ tagId })),
								skipDuplicates: true,
							},
						},
					}),
				...(copyOptions.contactInfo &&
					source.phones.length > 0 && {
						phones: {
							createMany: {
								data: source.phones.map(({ orgPhoneId }) => ({ orgPhoneId })),
								skipDuplicates: true,
							},
						},
					}),
				...(copyOptions.contactInfo &&
					source.emails.length > 0 && {
						emails: {
							createMany: {
								data: source.emails.map(({ orgEmailId }) => ({ orgEmailId })),
								skipDuplicates: true,
							},
						},
					}),
				...(copyOptions.contactInfo &&
					source.websites.length > 0 && {
						websites: {
							createMany: {
								data: source.websites.map(({ orgWebsiteId }) => ({ orgWebsiteId })),
								skipDuplicates: true,
							},
						},
					}),
				...(copyOptions.hours &&
					source.hours.length > 0 && {
						hours: {
							createMany: {
								data: source.hours.map((hour) => ({ ...hour, interval: toJsonInput(hour.interval) })),
							},
						},
					}),
				...(plainAttributes.length > 0 && {
					attributes: {
						createMany: {
							data: plainAttributes.map((attr) => ({
								id: ctx.generateId('attributeSupplement'),
								attributeId: attr.attributeId,
								boolean: attr.boolean,
								data: toJsonInput(attr.data),
								countryId: attr.countryId,
								languageId: attr.languageId,
								govDistId: attr.govDistId,
							})),
						},
					},
				}),
				...(copyOptions.coverageArea &&
					source.serviceAreas && {
						serviceAreas: {
							create: {
								id: ctx.generateId('serviceArea'),
								...(source.serviceAreas.countries.length > 0 && {
									countries: {
										createMany: { data: source.serviceAreas.countries, skipDuplicates: true },
									},
								}),
								...(source.serviceAreas.districts.length > 0 && {
									districts: {
										createMany: { data: source.serviceAreas.districts, skipDuplicates: true },
									},
								}),
							},
						},
					}),
			},
		})

		// Attributes carrying their own free text can't go through createMany (it can't create the
		// nested FreeText/TranslationKey rows alongside), so each one is written as three separate flat
		// creates - the same shape mutation.attachServiceAttribute.handler.ts already uses for one
		// attribute at a time, just repeated per attribute here.
		for (const attr of pendingTextAttributes) {
			await tx.translationKey.create({ data: attr.translationKey })
			await tx.freeText.create({ data: attr.freeText })
			await tx.attributeSupplement.create({
				data: {
					id: attr.supplementId,
					attributeId: attr.attributeId,
					serviceId: created.id,
					textId: attr.freeText.id,
					boolean: attr.boolean,
					data: attr.data,
					countryId: attr.countryId,
					languageId: attr.languageId,
					govDistId: attr.govDistId,
				},
			})
		}

		await tx.internalNote.create({
			data: {
				text: `Duplicated from service "${source.serviceName?.tsKey.text ?? sourceServiceId}"`,
				orgService: { connect: { id: created.id } },
				user: { connect: { id: ctx.actorId } },
			},
		})

		return created
	})

	return { id: result.id }
}
export default duplicate
