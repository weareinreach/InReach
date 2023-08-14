import { type Prisma } from '@weareinreach/db'
import { type Context } from '~api/lib'
import { globalSelect, globalWhere } from '~api/selects/global'

export const select = {
	attributes(): Prisma.LocationAttributeDefaultArgs {
		return {
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
				supplement: {
					select: {
						id: true,
						country: globalSelect.country(),
						language: {
							select: {
								languageName: true,
								nativeName: true,
							},
						},
						text: globalSelect.freeText(),
						govDist: globalSelect.govDistBasic(),
						boolean: true,
						data: true,
					},
				},
			},
		}
	},
	orgEmail(): Prisma.OrgLocationEmailDefaultArgs {
		return {
			select: {
				email: {
					select: {
						title: {
							select: {
								tsKey: true,
								tsNs: true,
							},
						},
						firstName: true,
						lastName: true,
						email: true,
						legacyDesc: true,
						description: globalSelect.freeText(),
						primary: true,
						locationOnly: true,
						serviceOnly: true,
					},
				},
			},
		}
	},

	orgPhone(): Prisma.OrgLocationPhoneDefaultArgs {
		return {
			select: {
				phone: {
					select: {
						country: globalSelect.country(),
						phoneLangs: {
							select: {
								language: globalSelect.language(),
							},
						},
						phoneType: {
							select: {
								tsKey: true,
								tsNs: true,
							},
						},
						description: globalSelect.freeText(),
						number: true,
						ext: true,
						primary: true,
						locationOnly: true,
					},
				},
			},
		}
	},

	service(ctx: Omit<Context, 'prisma'>): Prisma.OrgLocationServiceDefaultArgs {
		return {
			select: {
				service: {
					select: {
						serviceName: globalSelect.freeText(),
						description: globalSelect.freeText(),
						hours: globalSelect.hours(),
						attributes: this.attributes(),
						serviceAreas: globalSelect.serviceArea(),
						services: { select: { tag: globalSelect.serviceTags() } },
						accessDetails: this.attributes(),
						reviews: { where: { visible: true, deleted: false }, select: { id: true } },
						phones: { where: { phone: globalWhere.isPublic() }, ...this.orgPhone() },
						emails: { where: { email: globalWhere.isPublic() }, ...this.orgEmail() },
						userLists: ctx.session?.user.id
							? {
									where: { list: { ownedById: ctx.session.user.id } },
									select: { list: { select: { id: true, name: true } } },
							  }
							: false,
						id: true,
					},
				},
			},
		}
	},
}
