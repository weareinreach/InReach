import { Prisma, generateId, generateNestedFreeText, generateFreeText } from '@weareinreach/db'
import flush from 'just-flush'
import { z } from 'zod'

import { CreationBase, CreationManyBase, InputJsonValue, CreationOneOrManyBase } from '~api/schemas/common'

import { GenerateAuditLog, CreateAuditLog } from './auditLog'
import { connectOneId } from '../nestedOps'

export const CreateOrgService = () => {
	const { dataParser: parser, inputSchema } = CreationBase(
		z.object({
			orgSlug: z.string(),
			data: z.object({
				serviceName: z.string(),
				description: z.string().optional(),
				organizationId: z.string(),
				published: z.boolean().optional(),
			}),
		})
	)

	const dataParser = parser.transform(({ data: parsedData, actorId, operation }) => {
		const { orgSlug, data } = parsedData
		const id = generateId('orgService')
		const serviceName = generateNestedFreeText({
			orgSlug,
			text: data.serviceName,
			type: 'svcName',
			itemId: id,
		})
		const description = data.description
			? generateNestedFreeText({ orgSlug, text: data.description, type: 'svcDesc', itemId: id })
			: undefined
		const organization = connectOneId(data.organizationId)
		const { published } = data

		const recordData = {
			id,
			serviceName,
			description,
			organization,
			published,
		}
		const auditLogs = CreateAuditLog({ actorId, operation, to: recordData })

		return Prisma.validator<Prisma.OrgServiceCreateArgs>()({ data: { ...recordData, auditLogs } })
	})
	return { dataParser, inputSchema }
}
export const UpdateOrgService = z
	.object({
		id: z.string(),
		data: z
			.object({
				published: z.boolean(),
				deleted: z.boolean(),
				checkMigration: z.boolean().nullable(),
			})
			.partial(),
	})
	.transform(({ id, data }) => Prisma.validator<Prisma.OrgServiceUpdateArgs>()({ where: { id }, data }))

export const AttachServAttribute = () => {
	const { dataParser: parser, inputSchema } = CreationBase(
		z.object({
			orgSlug: z.string(),
			orgServiceId: z.string(),
			attributeId: z.string(),
			supplement: z
				.object({
					data: InputJsonValue.optional(),
					boolean: z.boolean().optional(),
					countryId: z.string().optional(),
					govDistId: z.string().optional(),
					languageId: z.string().optional(),
					text: z.string().optional(),
				})
				.optional(),
		})
	)

	const dataParser = parser.transform(({ actorId, operation, data: parsedData }) => {
		const { orgSlug, orgServiceId, attributeId, supplement: supplementInput } = parsedData

		const supplementId = supplementInput ? generateId('attributeSupplement') : undefined

		const { freeText, translationKey } =
			supplementId && supplementInput?.text
				? generateFreeText({ orgSlug, text: supplementInput.text, type: 'attSupp', itemId: supplementId })
				: { freeText: undefined, translationKey: undefined }

		const { boolean, countryId, data, govDistId, languageId } = supplementInput ?? {}
		const auditLogs = new Set<Prisma.AuditLogCreateManyAccountInput>()

		if (freeText && translationKey) {
			auditLogs.add(
				GenerateAuditLog({
					actorId,
					operation: 'CREATE',
					freeTextId: freeText.id,
					to: translationKey,
					translationKey: translationKey.key,
				})
			)
		}

		const supplementData = supplementInput
			? { id: supplementId, countryId, boolean, data, govDistId, languageId, textId: freeText?.id }
			: undefined
		if (supplementData)
			auditLogs.add(
				GenerateAuditLog({
					actorId,
					operation: 'CREATE',
					to: supplementData,
					attributeSupplementId: supplementData.id,
					attributeId,
				})
			)

		auditLogs.add(
			GenerateAuditLog({
				actorId,
				operation: 'LINK',
				orgServiceId,
				attributeId,
				attributeSupplementId: supplementData?.id,
			})
		)

		return {
			freeText: freeText ? Prisma.validator<Prisma.FreeTextCreateArgs>()({ data: freeText }) : undefined,
			translationKey: translationKey
				? Prisma.validator<Prisma.TranslationKeyCreateArgs>()({ data: translationKey })
				: undefined,
			attributeSupplement: supplementData
				? Prisma.validator<Prisma.AttributeSupplementCreateArgs>()({
						data: supplementData,
				  })
				: undefined,
			serviceAttribute: Prisma.validator<Prisma.ServiceAttributeCreateArgs>()({
				data: {
					attribute: { connect: { id: attributeId } },
					service: { connect: { id: orgServiceId } },
					supplement: supplementId ? { connect: { id: supplementId } } : undefined,
				},
			}),
			auditLogs: Array.from(auditLogs.values()),
		}
	})
	return { dataParser, inputSchema }
}
export const AttachServAccess = () => {
	const { dataParser: parser, inputSchema } = CreationBase(
		z.object({
			orgSlug: z.string(),
			serviceId: z.string(),
			attributeId: z.string(),
			supplement: z
				.object({
					data: InputJsonValue.optional(),
					boolean: z.boolean().optional(),
					countryId: z.string().optional(),
					govDistId: z.string().optional(),
					languageId: z.string().optional(),
					text: z.string().optional(),
				})
				.optional(),
		})
	)

	const dataParser = parser.transform(({ actorId, operation, data: parsedData }) => {
		const { orgSlug, serviceId, attributeId, supplement: supplementInput } = parsedData

		const supplementId = supplementInput ? generateId('attributeSupplement') : undefined

		const serviceAccessId = generateId('serviceAccess')

		const { freeText, translationKey } =
			supplementId && supplementInput?.text
				? generateFreeText({ orgSlug, text: supplementInput.text, type: 'attSupp', itemId: supplementId })
				: { freeText: undefined, translationKey: undefined }

		const { boolean, countryId, data, govDistId, languageId } = supplementInput ?? {}
		const auditLogs = new Set<Prisma.AuditLogCreateManyInput>()

		const serviceAccess: Prisma.ServiceAccessCreateArgs = {
			data: {
				id: serviceAccessId,
				serviceId,
			},
		}
		auditLogs.add(
			GenerateAuditLog({
				actorId,
				operation: 'CREATE',
				to: serviceAccess.data,
				orgServiceId: serviceId,
				serviceAccessId,
			})
		)

		if (freeText && translationKey) {
			auditLogs.add(
				GenerateAuditLog({
					actorId,
					operation: 'CREATE',
					freeTextId: freeText.id,
					to: translationKey,
					translationKey: translationKey.key,
				})
			)
		}

		const supplementData = supplementInput
			? { id: supplementId, countryId, boolean, data, govDistId, languageId, textId: freeText?.id }
			: undefined
		if (supplementData)
			auditLogs.add(
				GenerateAuditLog({
					actorId,
					operation: 'CREATE',
					to: supplementData,
					attributeSupplementId: supplementData.id,
					attributeId,
				})
			)

		auditLogs.add(
			GenerateAuditLog({
				actorId,
				operation: 'LINK',
				attributeId,
				attributeSupplementId: supplementData?.id,
			})
		)

		return {
			freeText: freeText ? Prisma.validator<Prisma.FreeTextCreateArgs>()({ data: freeText }) : undefined,
			translationKey: translationKey
				? Prisma.validator<Prisma.TranslationKeyCreateArgs>()({ data: translationKey })
				: undefined,
			attributeSupplement: supplementData
				? Prisma.validator<Prisma.AttributeSupplementCreateArgs>()({
						data: supplementData,
				  })
				: undefined,
			serviceAccess: Prisma.validator<Prisma.ServiceAccessCreateArgs>()({
				data: {
					id: serviceAccessId,
					serviceId,
				},
			}),
			serviceAccessAttribute: Prisma.validator<Prisma.ServiceAccessAttributeCreateArgs>()({
				data: {
					attribute: { connect: { id: attributeId } },
					serviceAccess: { connect: { id: serviceAccessId } },
					supplement: supplementId ? { connect: { id: supplementId } } : undefined,
				},
			}),
			auditLogs: Array.from(auditLogs.values()),
		}
	})
	return { dataParser, inputSchema }
}

export const AttachServiceTags = () => {
	const { dataParser: parser, inputSchema } = CreationManyBase(
		z
			.object({
				serviceId: z.string(),
				tagId: z.string(),
			})
			.array()
	)

	const dataParser = parser.transform(({ actorId, data: parsedData }) => {
		const auditLogs = parsedData.map(({ serviceId, tagId }) =>
			GenerateAuditLog({ actorId, operation: 'LINK', orgServiceId: serviceId, serviceTagId: tagId })
		)
		return {
			orgServiceTag: Prisma.validator<Prisma.OrgServiceTagCreateManyArgs>()({
				data: parsedData,
				skipDuplicates: true,
			}),
			auditLogs: Prisma.validator<Prisma.AuditLogCreateManyArgs>()({ data: auditLogs, skipDuplicates: true }),
		}
	})
	return { dataParser, inputSchema }
}

const ServiceAreaBase = z.object({
	organizationId: z.string().optional(),
	orgServiceId: z.string().optional(),
	orgLocationId: z.string().optional(),
	countries: z.string().array().optional(),
	districts: z.string().array().optional(),
})

export const CreateServiceArea = () => {
	const { dataParser: parser, inputSchema } = CreationBase(ServiceAreaBase)

	const dataParser = parser.transform(({ actorId, data: parsedData }) => {
		const auditLog: Prisma.AuditLogUncheckedCreateInput[] = []
		const id = generateId('serviceArea')
		const { orgLocationId, orgServiceId, organizationId } = parsedData

		const serviceAreaData = { id, orgLocationId, orgServiceId, organizationId }
		const serviceArea = Prisma.validator<Prisma.ServiceAreaCreateArgs>()({
			data: serviceAreaData,
		})
		auditLog.push(GenerateAuditLog({ actorId, operation: 'CREATE', to: serviceAreaData }))
		const serviceAreaCountry: Prisma.ServiceAreaCountryUncheckedCreateInput[] | undefined = parsedData
			.countries?.length
			? parsedData.countries.map((countryId) => {
					auditLog.push(GenerateAuditLog({ actorId, operation: 'LINK', serviceAreaId: id, countryId }))
					return { serviceAreaId: id, countryId }
			  })
			: undefined
		const serviceAreaDist: Prisma.ServiceAreaDistUncheckedCreateInput[] | undefined = parsedData.districts
			?.length
			? parsedData.districts.map((govDistId) => {
					auditLog.push(GenerateAuditLog({ actorId, operation: 'LINK', serviceAreaId: id, govDistId }))
					return { serviceAreaId: id, govDistId }
			  })
			: undefined

		return { serviceArea, auditLog, serviceAreaCountry, serviceAreaDist }
	})
	return { dataParser, inputSchema }
}

export const CreateServiceAreaRefine = (data: z.infer<typeof ServiceAreaBase>) => {
	const keys = Object.keys(flush(data))
	const ids = ['organizationId', 'orgServiceId', 'orgLocationId']
	const areas = ['countries', 'districts']
	return keys.some((key) => ids.includes(key)) && keys.some((key) => areas.includes(key))
}

const EmailLink = z.object({
	orgEmailId: z.string(),
	serviceId: z.string(),
})

export const LinkServiceEmail = () => {
	const { dataParser: parser, inputSchema } = CreationOneOrManyBase(EmailLink.or(EmailLink.array()))

	const dataParser = parser.transform(({ actorId, data: parsedData }) => {
		const auditLog: Prisma.AuditLogUncheckedCreateInput[] = []
		const orgServiceEmail: Prisma.OrgServiceEmailUncheckedCreateInput[] = []

		if (Array.isArray(parsedData)) {
			for (const { orgEmailId, serviceId } of parsedData) {
				orgServiceEmail.push({ orgEmailId, serviceId })
				auditLog.push(GenerateAuditLog({ actorId, operation: 'LINK', orgEmailId, orgServiceId: serviceId }))
			}
		} else {
			const { orgEmailId, serviceId } = parsedData
			orgServiceEmail.push({ orgEmailId, serviceId })
			auditLog.push(GenerateAuditLog({ actorId, operation: 'LINK', orgEmailId, orgServiceId: serviceId }))
		}
		return { auditLog, orgServiceEmail }
	})
	return { dataParser, inputSchema }
}

const PhoneLink = z.object({
	orgPhoneId: z.string(),
	serviceId: z.string(),
})

export const LinkServicePhone = () => {
	const { dataParser: parser, inputSchema } = CreationOneOrManyBase(PhoneLink.or(PhoneLink.array()))

	const dataParser = parser.transform(({ actorId, data: parsedData }) => {
		const auditLog: Prisma.AuditLogUncheckedCreateInput[] = []
		const orgServicePhone: Prisma.OrgServicePhoneUncheckedCreateInput[] = []

		if (Array.isArray(parsedData)) {
			for (const { orgPhoneId, serviceId } of parsedData) {
				orgServicePhone.push({ orgPhoneId, serviceId })
				auditLog.push(GenerateAuditLog({ actorId, operation: 'LINK', orgPhoneId, orgServiceId: serviceId }))
			}
		} else {
			const { orgPhoneId, serviceId } = parsedData
			orgServicePhone.push({ orgPhoneId, serviceId })
			auditLog.push(GenerateAuditLog({ actorId, operation: 'LINK', orgPhoneId, orgServiceId: serviceId }))
		}
		return { auditLog, orgServicePhone }
	})
	return { dataParser, inputSchema }
}
