import { prisma } from '@weareinreach/db'
import { globalSelect, globalWhere } from '~api/selects/global'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TByOrgLocationIdSchema } from './query.byOrgLocationId.schema'
import { select } from './selects'
import { redactReviewFieldVisibility, visibleReviewSelect } from '../review/lib/reviewSelect'

const byOrgLocationId = async ({ input }: TRPCHandlerParams<TByOrgLocationIdSchema>) => {
	const results = await prisma.orgService.findMany({
		// Previously no visibility check at all - any hidden/unpublished/deleted service linked to this
		// location was returned in full, and even an otherwise-visible service showed every location it's
		// linked to (not just the requested one) with no check that THOSE were visible either.
		where: {
			...globalWhere.isPublic(),
			locations: { some: { ...input, location: globalWhere.isPublic() } },
		},
		select: {
			serviceName: globalSelect.freeText(),
			services: {
				where: {
					tag: {
						active: true,
					},
				},
				select: {
					tag: {
						select: {
							defaultAttributes: {
								select: {
									attribute: {
										select: {
											tsKey: true,
											tsNs: true,
										},
									},
								},
							},
							primaryCategory: {
								select: {
									tsKey: true,
									tsNs: true,
								},
							},
							tsKey: true,
							tsNs: true,
							active: true,
						},
					},
				},
			},
			serviceAreas: {
				select: {
					countries: {
						select: {
							country: globalSelect.country(),
						},
					},
					districts: {
						select: {
							govDist: globalSelect.govDistExpanded(),
						},
					},
				},
			},
			hours: {
				select: {
					dayIndex: true,
					start: true,
					end: true,
					closed: true,
					tz: true,
				},
			},
			// Previously selected lcrCountry/lcrGovDist directly with no field-visibility check at all - same
			// reviewer-location leak already fixed for service.byId, using the same shared select/redaction.
			reviews: {
				where: {
					visible: true,
					deleted: false,
				},
				select: visibleReviewSelect,
			},
			attributes: {
				where: { attribute: { active: true, categories: { some: { category: { active: true } } } } },
				select: select.attributes(),
			},
			phones: {
				where: { active: true, phone: globalWhere.isPublic() },
				select: { phone: globalSelect.orgPhone() },
			},
			emails: {
				where: {
					active: true,
					email: globalWhere.isPublic(),
				},
				select: {
					email: {
						include: {
							title: {
								select: {
									tsKey: true,
									tsNs: true,
								},
							},
						},
					},
				},
			},

			locations: {
				where: {
					active: true,
					location: globalWhere.isPublic(),
				},
				select: {
					location: {
						select: {
							name: true,
							street1: true,
							street2: true,
							city: true,
							postCode: true,
							primary: true,
							govDist: globalSelect.govDistBasic(),
							country: globalSelect.country(),
							longitude: true,
							latitude: true,
						},
					},
				},
			},
			id: true,
			description: globalSelect.freeText(),
		},
	})
	return results.map((result) => ({ ...result, reviews: result.reviews.map(redactReviewFieldVisibility) }))
}
export default byOrgLocationId
