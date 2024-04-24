import { prisma } from '@weareinreach/db'
import { handleError } from '~api/lib/errorHandler'
import { globalSelect } from '~api/selects/global'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TForLocationPageEditsSchema } from './query.forLocationPageEdits.schema'

const forLocationPageEdits = async ({ input }: TRPCHandlerParams<TForLocationPageEditsSchema>) => {
	try {
		const location = await prisma.orgLocation.findUniqueOrThrow({
			where: {
				id: input.id,
			},
			select: {
				id: true,
				primary: true,
				name: true,
				street1: true,
				street2: true,
				city: true,
				postCode: true,
				country: { select: { cca2: true } },
				govDist: { select: { abbrev: true, tsKey: true, tsNs: true } },
				longitude: true,
				latitude: true,
				description: globalSelect.freeText(),
				notVisitable: true,
				attributes: {
					select: {
						attribute: {
							select: {
								id: true,
								tsKey: true,
								tsNs: true,
								icon: true,
								iconBg: true,
								showOnLocation: true,
								categories: {
									select: {
										category: {
											select: {
												tag: true,
												icon: true,
											},
										},
									},
								},
								_count: {
									select: {
										parents: true,
										children: true,
									},
								},
							},
						},
						id: true,
						country: {
							select: {
								cca2: true,
								cca3: true,
								id: true,
								name: true,
								dialCode: true,
								flag: true,
								tsKey: true,
								tsNs: true,
							},
						},
						language: {
							select: {
								languageName: true,
								nativeName: true,
							},
						},
						text: {
							select: {
								key: true,
								ns: true,
								tsKey: {
									select: {
										text: true,
									},
								},
							},
						},
						govDist: {
							select: {
								id: true,
								name: true,
								slug: true,
								iso: true,
								abbrev: true,
								country: {
									select: {
										cca2: true,
										cca3: true,
										id: true,
										name: true,
										dialCode: true,
										flag: true,
										tsKey: true,
										tsNs: true,
									},
								},
								govDistType: {
									select: {
										tsKey: true,
										tsNs: true,
									},
								},
								isPrimary: true,
								tsKey: true,
								tsNs: true,
								parent: {
									select: {
										id: true,
										name: true,
										slug: true,
										iso: true,
										abbrev: true,
										country: {
											select: {
												cca2: true,
												cca3: true,
												id: true,
												name: true,
												dialCode: true,
												flag: true,
												tsKey: true,
												tsNs: true,
											},
										},
										govDistType: {
											select: {
												tsKey: true,
												tsNs: true,
											},
										},
										isPrimary: true,
										tsKey: true,
										tsNs: true,
									},
								},
							},
						},
						boolean: true,
						data: true,
					},
				},
				reviews: {
					where: { visible: true, deleted: false },
					select: { id: true },
				},
				services: { select: { serviceId: true } },
				organization: {
					select: {
						id: true,
						name: true,
						slug: true,
						lastVerified: true,
						allowedEditors: { where: { authorized: true }, select: { userId: true } },
					},
				},
			},
		})
		const { organization, ...record } = location
		const { allowedEditors, ...org } = organization
		const formatted = {
			...record,
			organization: {
				...org,
				isClaimed: allowedEditors.length !== 0,
			},
		}

		return formatted
	} catch (error) {
		return handleError(error)
	}
}
export default forLocationPageEdits
