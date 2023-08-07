import { type Prisma } from '@weareinreach/db'

export const globalSelect = {
	freeText(): Prisma.FreeTextDefaultArgs {
		return {
			select: {
				key: true,
				ns: true,
				tsKey: {
					select: {
						text: true,
					},
				},
			},
		}
	},
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
				description: this.freeText(),
				languages: { select: { language: this.language() } },
				url: true,
				isPrimary: true,
				orgLocationId: true,
				orgLocationOnly: true,
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

export const globalWhere = {
	isPublic() {
		return {
			published: true,
			deleted: false,
		} as const
	},
}
