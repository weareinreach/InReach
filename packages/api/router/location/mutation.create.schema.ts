import { z } from 'zod'

import { createGeoFields, Prisma } from '@weareinreach/db'
import { CreateBase } from '~api/schemaBase/create'
import { AuditLogSchema } from '~api/schemas/create/auditLog'
import { prefixedId } from '~api/schemas/idPrefix'
import { createManyRequired } from '~api/schemas/nestedOps'

export const ZCreateSchema = z
	.object({
		orgId: prefixedId('organization'),
		id: prefixedId('orgLocation').optional(),
		name: z.string().optional(),
		street1: z.string(),
		street2: z.string().optional(),
		city: z.string(),
		postCode: z.string().optional(),
		primary: z.boolean().optional(),
		govDistId: z.string(),
		countryId: z.string(),
		longitude: z.number(),
		latitude: z.number(),
		published: z.boolean().default(false),
		emails: z
			.object({ orgEmailId: prefixedId('orgEmail') })
			.array()
			.optional(),
		phones: z
			.object({ phoneId: prefixedId('orgPhone') })
			.array()
			.optional(),
		services: z
			.object({ serviceId: prefixedId('orgService') })
			.array()
			.optional(),
	})
	.transform((data) => {
		const { emails, phones, services, ...dataTo } = data
		const serviceLinks = (
			!services
				? undefined
				: createManyRequired(
						services.map(({ serviceId }) => {
							return { serviceId }
						})
					)
		) satisfies Prisma.OrgLocationServiceCreateNestedManyWithoutLocationInput | undefined

		const emailLinks = (
			!emails
				? undefined
				: createManyRequired(
						emails.map(({ orgEmailId }) => {
							return { orgEmailId }
						})
					)
		) satisfies Prisma.OrgLocationEmailCreateNestedManyWithoutLocationInput | undefined
		const phoneLinks = (
			!phones
				? undefined
				: createManyRequired(
						phones.map(({ phoneId }) => {
							return { phoneId }
						})
					)
		) satisfies Prisma.OrgLocationPhoneCreateNestedManyWithoutLocationInput | undefined

		return Prisma.validator<Prisma.OrgLocationCreateArgs>()({
			data: {
				...dataTo,
				...createGeoFields({ longitude: dataTo.longitude, latitude: dataTo.latitude }),
				emails: emailLinks,
				phones: phoneLinks,
				services: serviceLinks,
			},
		})
	})

export type TCreateSchema = z.infer<typeof ZCreateSchema>
