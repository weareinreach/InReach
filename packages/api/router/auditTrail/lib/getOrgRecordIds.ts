import { prisma } from '@weareinreach/db'

/**
 * Every record id that belongs to an organization's "family" - the org itself, its locations and services
 * (both directly linked and linked only through a location), and every phone/email linked to any of those
 * (OrgPhone/OrgEmail have no direct FK to org/location/service at all - the link only exists in a separate
 * join table, so they have to be gathered this way rather than matched by a column on their own row).
 *
 * Deliberately NOT scoped to published/non-deleted - this is for staff-facing audit history, which needs to
 * show the full history of a record regardless of its current visibility.
 *
 * Website/social-media links are not included yet - that linking model (direct FK vs a separate per-location
 * join table) has pre-existing inconsistencies (see nestedOps.ts) that need their own investigation before
 * being folded in here.
 */
export const getOrgRecordIds = async (organizationId: string): Promise<string[]> => {
	const org = await prisma.organization.findUnique({
		where: { id: organizationId },
		select: {
			id: true,
			hours: { select: { id: true } },
			emails: { select: { orgEmailId: true } },
			phones: { select: { phoneId: true } },
			services: {
				select: {
					id: true,
					hours: { select: { id: true } },
					emails: { select: { orgEmailId: true } },
					phones: { select: { orgPhoneId: true } },
				},
			},
			locations: {
				select: {
					id: true,
					hours: { select: { id: true } },
					emails: { select: { orgEmailId: true } },
					phones: { select: { phoneId: true } },
					services: {
						select: {
							service: {
								select: {
									id: true,
									hours: { select: { id: true } },
									emails: { select: { orgEmailId: true } },
									phones: { select: { orgPhoneId: true } },
								},
							},
						},
					},
				},
			},
		},
	})
	if (!org) {
		return []
	}

	const ids = new Set<string>()
	const addService = (service: {
		id: string
		hours: { id: string }[]
		emails: { orgEmailId: string }[]
		phones: { orgPhoneId: string }[]
	}) => {
		ids.add(service.id)
		service.hours.forEach((h) => ids.add(h.id))
		service.emails.forEach((e) => ids.add(e.orgEmailId))
		service.phones.forEach((p) => ids.add(p.orgPhoneId))
	}

	ids.add(org.id)
	org.hours.forEach((h) => ids.add(h.id))
	org.emails.forEach((e) => ids.add(e.orgEmailId))
	org.phones.forEach((p) => ids.add(p.phoneId))
	org.services.forEach(addService)
	org.locations.forEach((location) => {
		ids.add(location.id)
		location.hours.forEach((h) => ids.add(h.id))
		location.emails.forEach((e) => ids.add(e.orgEmailId))
		location.phones.forEach((p) => ids.add(p.phoneId))
		location.services.forEach(({ service }) => addService(service))
	})

	return Array.from(ids)
}
