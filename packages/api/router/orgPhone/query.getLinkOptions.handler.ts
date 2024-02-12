import parsePhoneNumber, { isSupportedCountry } from 'libphonenumber-js'

import { prisma } from '@weareinreach/db'
import { handleError } from '~api/lib/errorHandler'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TGetLinkOptionsSchema } from './query.getLinkOptions.schema'

export const getLinkOptions = async ({ ctx, input }: TRPCHandlerParams<TGetLinkOptionsSchema>) => {
	try {
		const { slug, locationId } = input
		const result = await prisma.orgPhone.findMany({
			where: {
				organization: { organization: { slug } },
				locations: { every: { orgLocationId: { not: locationId } } },
			},
			select: {
				id: true,
				number: true,
				ext: true,
				country: { select: { cca2: true } },
				description: { select: { tsKey: { select: { text: true } } } },
				phoneType: { select: { key: { select: { text: true } } } },
				published: true,
				deleted: true,
			},
		})
		const transformed = result.map(({ description, phoneType, country, number, ext, id, ...status }) => {
			const parsedPhone = parsePhoneNumber(
				number,
				isSupportedCountry(country.cca2) ? country.cca2 : undefined
			)
			if (!parsedPhone) {
				return {
					id,
					number,
					description: description ? description?.tsKey?.text : null,
					phoneType: phoneType ? phoneType?.key?.text : null,
					...status,
				}
			}
			if (ext) parsedPhone.setExt(ext)
			const phoneNumber = parsedPhone.formatNational()

			return {
				id,
				number: phoneNumber,
				description: description ? description?.tsKey?.text : null,
				phoneType: phoneType ? phoneType?.key?.text : null,
				...status,
			}
		})
		return transformed
	} catch (error) {
		handleError(error)
	}
}
export default getLinkOptions
