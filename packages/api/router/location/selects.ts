import { type Prisma } from '@weareinreach/db'
import { type Context } from '~api/lib'
import { globalSelect, globalWhere } from '~api/selects/global'

export const select = {
	country(): Prisma.CountryDefaultArgs {
		return {
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
		}
	},
	govDistBasic(): Prisma.GovDistDefaultArgs {
		return {
			select: {
				govDistType: {
					select: {
						tsNs: true,
						tsKey: true,
					},
				},
				tsKey: true,
				tsNs: true,
				abbrev: true,
			},
		}
	},
	govDistExpanded(): Prisma.GovDistDefaultArgs {
		return {
			select: {
				id: true,
				name: true,
				slug: true,
				iso: true,
				abbrev: true,
				country: this.country(),
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
						country: this.country(),
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
		}
	},
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
						country: this.country(),
						language: {
							select: {
								languageName: true,
								nativeName: true,
							},
						},
						text: globalSelect.freeText(),
						govDist: this.govDistBasic(),
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
	language(): Prisma.LanguageDefaultArgs {
		return {
			select: {
				languageName: true,
				nativeName: true,
			},
		}
	},
	orgWebsite(): Prisma.OrgWebsiteDefaultArgs {
		return {
			select: {
				id: true,
				description: globalSelect.freeText(),
				languages: { select: { language: this.language() } },
				url: true,
				isPrimary: true,
				orgLocationId: true,
				orgLocationOnly: true,
			},
		}
	},
	orgPhone(): Prisma.OrgLocationPhoneDefaultArgs {
		return {
			select: {
				phone: {
					select: {
						country: this.country(),
						phoneLangs: {
							select: {
								language: this.language(),
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
	orgPhoto(): Prisma.OrgPhotoDefaultArgs {
		return {
			select: {
				src: true,
				height: true,
				width: true,
			},
		}
	},
	hours(): Prisma.OrgHoursDefaultArgs {
		return {
			select: {
				dayIndex: true,
				start: true,
				end: true,
				closed: true,
				tz: true,
			},
		}
	},
	serviceTags(): Prisma.ServiceTagDefaultArgs {
		return {
			select: {
				name: true,
				tsKey: true,
				tsNs: true,
				category: {
					select: {
						tsKey: true,
						tsNs: true,
					},
				},
				defaultAttributes: {
					select: {
						attribute: {
							select: {
								categories: { select: { category: { select: { icon: true, ns: true, tag: true } } } },
							},
						},
					},
				},
			},
		}
	},
	serviceArea(): Prisma.ServiceAreaDefaultArgs {
		return {
			select: {
				countries: { select: { country: this.country() } },
				districts: { select: { govDist: this.govDistBasic() } },
			},
		}
	},
	service(ctx: Context): Prisma.OrgLocationServiceDefaultArgs {
		return {
			select: {
				service: {
					select: {
						serviceName: globalSelect.freeText(),
						description: globalSelect.freeText(),
						hours: this.hours(),
						attributes: this.attributes(),
						serviceAreas: this.serviceArea(),
						services: { select: { tag: this.serviceTags() } },
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
	socialMedia(): Prisma.OrgSocialMediaDefaultArgs {
		return {
			select: {
				service: {
					select: {
						tsKey: true,
						tsNs: true,
						logoIcon: true,
						name: true,
						urlBase: true,
					},
				},
				url: true,
				username: true,
			},
		}
	},
}
