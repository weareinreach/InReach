import { prisma } from '@weareinreach/db'
import { globalSelect, globalWhere } from '~api/selects/global'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TByUserListIdSchema } from './query.byUserListId.schema'
import { select } from './selects'

export const byUserListId = async ({ ctx, input }: TRPCHandlerParams<TByUserListIdSchema, 'protected'>) => {
	const results = await prisma.orgService.findMany({
		where: { userLists: { some: { list: { AND: { id: input.listId, ownedById: ctx.session.user.id } } } } },
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
			reviews: {
				where: {
					visible: true,
					deleted: false,
				},
				select: {
					language: globalSelect.language(),
					lcrCountry: globalSelect.country(),
					lcrGovDist: globalSelect.govDistExpanded(),
					translatedText: {
						select: {
							text: true,
							language: {
								select: {
									localeCode: true,
								},
							},
						},
					},
				},
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
			accessDetails: {
				where: {
					active: true,
				},
				select: select.attributes(),
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

	return results
}
