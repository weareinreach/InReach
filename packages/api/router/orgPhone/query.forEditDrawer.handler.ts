import parsePhoneNumber, { isSupportedCountry } from 'libphonenumber-js'

import { prisma } from '@weareinreach/db'
import { handleError } from '~api/lib/errorHandler'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TForEditDrawerSchema } from './query.forEditDrawer.schema'

const getOrgId = async (phoneId: string) => {
	const org = await prisma.organization.findFirstOrThrow({
		where: {
			OR: [
				{ phones: { some: { phoneId } } },
				{ locations: { some: { phones: { some: { phoneId } } } } },
				{ services: { some: { phones: { some: { orgPhoneId: phoneId } } } } },
			],
		},
		select: { id: true },
	})
	return org.id
}

export const forEditDrawer = async ({ input }: TRPCHandlerParams<TForEditDrawerSchema>) => {
	try {
		const result = await prisma.orgPhone.findUnique({
			where: input,
			select: {
				id: true,
				number: true,
				ext: true,
				primary: true,
				published: true,
				deleted: true,
				countryId: true,
				phoneTypeId: true,
				description: { select: { id: true, key: true, tsKey: { select: { text: true } } } },
				locationOnly: true,
				serviceOnly: true,
				country: { select: { cca2: true } },
			},
		})
		if (!result) {
			return null
		}
		const orgId = await getOrgId(input.id)
		const { country, description, number, ext, ...rest } = result

		const parsedPhone = parsePhoneNumber(number, isSupportedCountry(country.cca2) ? country.cca2 : undefined)

		if (typeof parsedPhone !== 'undefined') {
			if (ext) {
				parsedPhone.setExt(ext)
			}

			return {
				...rest,
				number: parsedPhone.format('E.164'),
				ext,
				description: description ? description?.tsKey?.text : null,
				orgId,
				country: country?.cca2,
			}
		} else {
			return {
				...rest,
				number,
				ext,
				description: description ? description?.tsKey?.text : null,
				orgId,
				country: country?.cca2,
			}
		}
	} catch (error) {
		return handleError(error)
	}
}
export default forEditDrawer
