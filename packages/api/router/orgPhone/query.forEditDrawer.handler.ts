import { prisma } from '@weareinreach/db'
import { handleError } from '~api/lib/errorHandler'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TForEditDrawerSchema } from './query.forEditDrawer.schema'

const getOrgId = async (phoneId: string) => {
	const result = await prisma.orgPhone.findUniqueOrThrow({
		where: { id: phoneId },
		select: {
			organization: { select: { organizationId: true } },
			locations: { select: { location: { select: { orgId: true } } } },
			services: { select: { service: { select: { organizationId: true } } } },
		},
	})

	switch (true) {
		case !!result.organization?.organizationId: {
			return result.organization.organizationId
		}
		case result.locations.length !== 0 &&
			result.locations.filter((loc) => !!loc.location.orgId).length !== 0: {
			const filtered = result.locations.filter((loc) => !!loc.location.orgId)
			return filtered[0]!.location.orgId
		}
		case result.services.length !== 0 &&
			result.services.filter((serv) => !!serv.service.organizationId).length !== 0: {
			const filtered = result.services.filter((serv) => !!serv.service.organizationId)
			return filtered[0]!.service.organizationId!
		}
		default: {
			throw new Error('Unable to get organizationId')
		}
	}
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
		if (!result) return null
		const orgId = await getOrgId(input.id)
		const { country, description, ...rest } = result

		const reformatted = {
			...rest,
			description: description ? description?.tsKey?.text : null,
			orgId,
			country: country?.cca2,
		}
		return reformatted
	} catch (error) {
		handleError(error)
	}
}
