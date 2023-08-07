import { type Prisma } from '@weareinreach/db'

export const globalSelect = {
	freeText(opts?: FreeTextOpts) {
		return {
			select: {
				key: true,
				ns: true,
				tsKey: {
					select: {
						text: true,
						crowdinId: opts?.withCrowdinId,
					},
				},
			},
		} satisfies Prisma.FreeTextDefaultArgs
	},
	country() {
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
		} satisfies Prisma.CountryDefaultArgs
	},
	govDistBasic() {
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
		} satisfies Prisma.GovDistDefaultArgs
	},
	govDistExpanded() {
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
		} satisfies Prisma.GovDistDefaultArgs
	},
	language() {
		return {
			select: {
				languageName: true,
				nativeName: true,
			},
		} satisfies Prisma.LanguageDefaultArgs
	},
	orgWebsite() {
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
		} satisfies Prisma.OrgWebsiteDefaultArgs
	},
	orgPhoto() {
		return {
			select: {
				src: true,
				height: true,
				width: true,
			},
		} satisfies Prisma.OrgPhotoDefaultArgs
	},
	hours() {
		return {
			select: {
				dayIndex: true,
				start: true,
				end: true,
				closed: true,
				tz: true,
			},
		} satisfies Prisma.OrgHoursDefaultArgs
	},
	serviceTags() {
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
		} satisfies Prisma.ServiceTagDefaultArgs
	},
	serviceArea() {
		return {
			select: {
				countries: { select: { country: this.country() } },
				districts: { select: { govDist: this.govDistBasic() } },
			},
		} satisfies Prisma.ServiceAreaDefaultArgs
	},
	socialMedia() {
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
		} satisfies Prisma.OrgSocialMediaDefaultArgs
	},
	orgPhone() {
		return {
			select: {
				country: this.country(),
				phoneLangs: { select: { language: this.language() } },
				phoneType: { select: { tsKey: true, tsNs: true } },
				description: this.freeText(),
				number: true,
				ext: true,
				primary: true,
				locationOnly: true,
			},
		} satisfies Prisma.OrgPhoneDefaultArgs
	},
}

export const globalWhere = {
	isPublic() {
		return {
			published: true,
			deleted: false,
		} as const
	},
	attributesByTag(tags: string[]): Prisma.AttributeWhereInput {
		return {
			active: true,
			tag: { in: tags },
			categories: {
				some: {
					category: {
						active: true,
					},
				},
			},
		}
	},
}

interface FreeTextOpts {
	withCrowdinId?: boolean
}
