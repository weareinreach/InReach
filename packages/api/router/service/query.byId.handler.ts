import { prisma } from '@weareinreach/db'
import { globalSelect, globalWhere } from '~api/selects/global'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TByIdSchema } from './query.byId.schema'
import { select } from './selects'
import { redactReviewFieldVisibility, visibleReviewSelect } from '../review/lib/reviewSelect'

const byId = async ({ input }: TRPCHandlerParams<TByIdSchema>) => {
	const result = await prisma.orgService.findUniqueOrThrow({
		where: input,
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
			// Previously selected lcrCountry/lcrGovDist directly with no field-visibility check at all - a real
			// reviewer-location leak for any reviewer who'd chosen to hide it. Uses the same select +
			// redaction every other review list in this app uses (packages/api/router/review/lib/reviewSelect.ts).
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
	return { ...result, reviews: result.reviews.map(redactReviewFieldVisibility) }
}
export default byId
