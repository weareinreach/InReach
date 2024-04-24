import { prisma } from '@weareinreach/db'
import { formatAttributes } from '~api/formatters/attributes'
import { formatHours } from '~api/formatters/hours'
import { handleError } from '~api/lib/errorHandler'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TServiceEditSchema } from './query.serviceEdit.schema'

const freeTextSelect = { select: { tsKey: { select: { key: true, text: true, ns: true } } } } as const

export const serviceEdit = async ({ input }: TRPCHandlerParams<TServiceEditSchema>) => {
	try {
		const result = await prisma.orgService.findUnique({
			where: input,
			select: {
				id: true,
				deleted: true,
				published: true,
				createdAt: true,
				updatedAt: true,
				serviceName: freeTextSelect,
				description: freeTextSelect,
				services: { select: { tag: { select: { id: true, tsKey: true, tsNs: true } } } },
				emails: {
					select: {
						email: {
							select: {
								id: true,
								email: true,
								firstName: true,
								lastName: true,
								title: { select: { key: { select: { key: true, ns: true, text: true } } } },
							},
						},
					},
				},
				phones: {
					select: {
						phone: {
							select: {
								id: true,
								description: freeTextSelect,
								number: true,
								ext: true,
								published: true,
								deleted: true,
								phoneType: { select: { tsKey: true, tsNs: true } },
							},
						},
					},
				},
				// accessDetails: formatAccessDetails.prismaSelect(true),
				hours: formatHours.prismaSelect(true),
				attributes: formatAttributes.prismaSelect(true),
				locations: { select: { orgLocationId: true } },
			},
		})
		if (!result) {
			return null
		}
		const {
			serviceName,
			description,
			services,
			emails,
			phones,
			// accessDetails,
			hours,
			attributes: rawAttributes,
			locations,
			...rest
		} = result

		const { attributes, accessDetails } = formatAttributes.processAndSeparateAccessDetails(rawAttributes)
		return {
			name: serviceName?.tsKey,
			description: description?.tsKey,
			services: services?.map(({ tag }) => tag),
			emails: emails?.map(({ email: { title, ...emailRecord } }) => ({
				...emailRecord,
				title: title?.key ?? null,
			})),
			phones: phones?.map(({ phone: { description: phoneDescription, ...phoneRecord } }) => ({
				...phoneRecord,
				description: phoneDescription?.tsKey,
			})),
			hours: formatHours.process(hours),
			locations: locations?.map(({ orgLocationId }) => orgLocationId),
			// accessDetails: formatAccessDetails.process(accessDetails),
			// attributes: formatAttributes.process(attributes),
			attributes,
			accessDetails,
			...rest,
		}
	} catch (error) {
		return handleError(error)
	}
}
export default serviceEdit
