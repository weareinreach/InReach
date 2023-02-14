// import { type PrismaClient, prisma } from '@weareinreach/db'
// import {
// 	AccountWhereUniqueInputSchema,
// 	AssignedRoleWhereUniqueInputSchema,
// 	AttributeCategoryWhereUniqueInputSchema,
// 	AttributeSupplementWhereUniqueInputSchema,
// 	AttributeToCategoryWhereUniqueInputSchema,
// 	AttributeWhereUniqueInputSchema,
// 	CountryWhereUniqueInputSchema,
// 	FieldVisibilityWhereUniqueInputSchema,
// 	FooterLinkWhereUniqueInputSchema,
// 	FreeTextWhereUniqueInputSchema,
// 	GovDistTypeWhereUniqueInputSchema,
// 	GovDistWhereUniqueInputSchema,
// 	InternalNoteWhereUniqueInputSchema,
// 	LanguageWhereUniqueInputSchema,
// 	ListSharedWithWhereUniqueInputSchema,
// 	LocationAttributeWhereUniqueInputSchema,
// 	LocationPermissionWhereUniqueInputSchema,
// 	NavigationWhereUniqueInputSchema,
// 	OrganizationAttributeWhereUniqueInputSchema,
// 	OrganizationPermissionWhereUniqueInputSchema,
// 	OrganizationWhereUniqueInputSchema,
// 	OrgEmailWhereUniqueInputSchema,
// 	OrgHoursWhereUniqueInputSchema,
// 	OrgLocationEmailWhereUniqueInputSchema,
// 	OrgLocationPhoneWhereUniqueInputSchema,
// 	OrgLocationServiceWhereUniqueInputSchema,
// 	OrgLocationWhereUniqueInputSchema,
// 	OrgPhoneLanguageWhereUniqueInputSchema,
// 	OrgPhoneWhereUniqueInputSchema,
// 	OrgPhotoWhereUniqueInputSchema,
// 	OrgReviewWhereUniqueInputSchema,
// 	OrgServiceEmailWhereUniqueInputSchema,
// 	OrgServicePhoneWhereUniqueInputSchema,
// 	OrgServiceTagWhereUniqueInputSchema,
// 	OrgServiceWhereUniqueInputSchema,
// 	OrgSocialMediaWhereUniqueInputSchema,
// 	OrgWebsiteLanguageWhereUniqueInputSchema,
// 	OrgWebsiteWhereUniqueInputSchema,
// 	OutsideAPIServiceWhereUniqueInputSchema,
// 	OutsideAPIWhereUniqueInputSchema,
// 	PermissionWhereUniqueInputSchema,
// 	PhoneTypeWhereUniqueInputSchema,
// 	RolePermissionWhereUniqueInputSchema,
// 	SavedOrganizationWhereUniqueInputSchema,
// 	SavedServiceWhereUniqueInputSchema,
// 	ServiceAccessAttributeWhereUniqueInputSchema,
// 	ServiceAccessWhereUniqueInputSchema,
// 	ServiceAreaCountryWhereUniqueInputSchema,
// 	ServiceAreaDistWhereUniqueInputSchema,
// 	ServiceAreaWhereUniqueInputSchema,
// 	ServiceAttributeWhereUniqueInputSchema,
// 	ServiceCategoryDefaultAttributeWhereUniqueInputSchema,
// 	ServiceCategoryWhereUniqueInputSchema,
// 	ServiceTagDefaultAttributeWhereUniqueInputSchema,
// 	ServiceTagWhereUniqueInputSchema,
// 	SocialMediaLinkWhereUniqueInputSchema,
// 	SocialMediaServiceWhereUniqueInputSchema,
// 	SourceWhereUniqueInputSchema,
// 	TranslatedReviewWhereUniqueInputSchema,
// 	TranslationKeyWhereUniqueInputSchema,
// 	TranslationNamespaceWhereUniqueInputSchema,
// 	UserCommunityLinkWhereUniqueInputSchema,
// 	UserCommunityWhereUniqueInputSchema,
// 	UserEthnicityWhereUniqueInputSchema,
// 	UserImmigrationWhereUniqueInputSchema,
// 	UserMailWhereUniqueInputSchema,
// 	UserPermissionWhereUniqueInputSchema,
// 	UserRoleWhereUniqueInputSchema,
// 	UserSavedListWhereUniqueInputSchema,
// 	UserSOGIdentityWhereUniqueInputSchema,
// 	UserSOGLinkWhereUniqueInputSchema,
// 	UserTitleWhereUniqueInputSchema,
// 	UserToOrganizationWhereUniqueInputSchema,
// 	UserTypeWhereUniqueInputSchema,
// 	UserWhereUniqueInputSchema,
// } from '@weareinreach/db/zod-schemas'

// import { id, userId } from 'schemas/common'

// export const prismaQueriesAlt = {
// 	account: async (input: unknown) =>
// 		await prisma.account.findUnique({ where: AccountWhereUniqueInputSchema.parse(input) }),
// 	attribute: async (input: unknown) =>
// 		await prisma.attribute.findUnique({ where: AttributeWhereUniqueInputSchema.parse(input) }),
// 	attributeCategory: async (input: unknown) =>
// 		await prisma.attributeCategory.findUnique({
// 			where: AttributeCategoryWhereUniqueInputSchema.parse(input),
// 		}),
// 	attributeSupplement: async (input: unknown) =>
// 		await prisma.attributeSupplement.findUnique({
// 			where: AttributeSupplementWhereUniqueInputSchema.parse(input),
// 		}),
// 	country: async (input: unknown) =>
// 		await prisma.country.findUnique({ where: CountryWhereUniqueInputSchema.parse(input) }),
// 	fieldVisibility: async (input: unknown) =>
// 		await prisma.fieldVisibility.findUnique({
// 			where: FieldVisibilityWhereUniqueInputSchema.parse(input),
// 		}),
// 	footerLink: async (input: unknown) =>
// 		await prisma.footerLink.findUnique({ where: FooterLinkWhereUniqueInputSchema.parse(input) }),
// 	freeText: async (input: unknown) =>
// 		await prisma.freeText.findUnique({ where: FreeTextWhereUniqueInputSchema.parse(input) }),
// 	govDist: async (input: unknown) =>
// 		await prisma.govDist.findUnique({ where: GovDistWhereUniqueInputSchema.parse(input) }),
// 	govDistType: async (input: unknown) =>
// 		await prisma.govDistType.findUnique({ where: GovDistTypeWhereUniqueInputSchema.parse(input) }),
// 	internalNote: async (input: unknown) =>
// 		await prisma.internalNote.findUnique({ where: InternalNoteWhereUniqueInputSchema.parse(input) }),
// 	language: async (input: unknown) =>
// 		await prisma.language.findUnique({ where: LanguageWhereUniqueInputSchema.parse(input) }),
// 	locationPermission: async (input: unknown) =>
// 		await prisma.locationPermission.findUnique({
// 			where: LocationPermissionWhereUniqueInputSchema.parse({ userId_permissionId_orgLocationId: input }),
// 		}),
// 	navigation: async (input: unknown) =>
// 		await prisma.navigation.findUnique({ where: NavigationWhereUniqueInputSchema.parse(input) }),
// 	organization: async (input: unknown) =>
// 		await prisma.organization.findUnique({ where: OrganizationWhereUniqueInputSchema.parse(input) }),
// 	organizationPermission: async (input: unknown) =>
// 		await prisma.organizationPermission.findUnique({
// 			where: OrganizationPermissionWhereUniqueInputSchema.parse({
// 				userId_permissionId_organizationId: input,
// 			}),
// 		}),
// 	orgEmail: async (input: unknown) =>
// 		await prisma.orgEmail.findUnique({ where: OrgEmailWhereUniqueInputSchema.parse(input) }),
// 	orgHours: async (input: unknown) =>
// 		await prisma.orgHours.findUnique({ where: OrgHoursWhereUniqueInputSchema.parse(input) }),
// 	orgLocation: async (input: unknown) =>
// 		await prisma.orgLocation.findUnique({ where: OrgLocationWhereUniqueInputSchema.parse(input) }),
// 	orgPhone: async (input: unknown) =>
// 		await prisma.orgPhone.findUnique({ where: OrgPhoneWhereUniqueInputSchema.parse(input) }),
// 	orgPhoto: async (input: unknown) =>
// 		await prisma.orgPhoto.findUnique({ where: OrgPhotoWhereUniqueInputSchema.parse(input) }),
// 	orgReview: async (input: unknown) =>
// 		await prisma.orgReview.findUnique({ where: OrgReviewWhereUniqueInputSchema.parse(input) }),
// 	orgService: async (input: unknown) =>
// 		await prisma.orgService.findUnique({ where: OrgServiceWhereUniqueInputSchema.parse(input) }),
// 	orgSocialMedia: async (input: unknown) =>
// 		await prisma.orgSocialMedia.findUnique({
// 			where: OrgSocialMediaWhereUniqueInputSchema.parse(input),
// 		}),
// 	orgWebsite: async (input: unknown) =>
// 		await prisma.orgWebsite.findUnique({ where: OrgWebsiteWhereUniqueInputSchema.parse(input) }),
// 	outsideAPI: async (input: unknown) =>
// 		await prisma.outsideAPI.findUnique({ where: OutsideAPIWhereUniqueInputSchema.parse(input) }),
// 	outsideAPIService: async (input: unknown) =>
// 		await prisma.outsideAPIService.findUnique({
// 			where: OutsideAPIServiceWhereUniqueInputSchema.parse(input),
// 		}),
// 	permission: async (input: unknown) =>
// 		await prisma.permission.findUnique({ where: PermissionWhereUniqueInputSchema.parse(input) }),
// 	phoneType: async (input: unknown) =>
// 		await prisma.phoneType.findUnique({ where: PhoneTypeWhereUniqueInputSchema.parse(input) }),
// 	serviceAccess: async (input: unknown) =>
// 		await prisma.serviceAccess.findUnique({ where: ServiceAccessWhereUniqueInputSchema.parse(input) }),
// 	serviceArea: async (input: unknown) =>
// 		await prisma.serviceArea.findUnique({ where: ServiceAreaWhereUniqueInputSchema.parse(input) }),
// 	serviceCategory: async (input: unknown) =>
// 		await prisma.serviceCategory.findUnique({
// 			where: ServiceCategoryWhereUniqueInputSchema.parse(input),
// 		}),
// 	serviceTag: async (input: unknown) =>
// 		await prisma.serviceTag.findUnique({ where: ServiceTagWhereUniqueInputSchema.parse(input) }),
// 	socialMediaLink: async (input: unknown) =>
// 		await prisma.socialMediaLink.findUnique({
// 			where: SocialMediaLinkWhereUniqueInputSchema.parse(input),
// 		}),
// 	socialMediaService: async (input: unknown) =>
// 		await prisma.socialMediaService.findUnique({
// 			where: SocialMediaServiceWhereUniqueInputSchema.parse(input),
// 		}),
// 	source: async (input: unknown) =>
// 		await prisma.source.findUnique({ where: SourceWhereUniqueInputSchema.parse(input) }),
// 	translatedReview: async (input: unknown) =>
// 		await prisma.translatedReview.findUnique({
// 			where: TranslatedReviewWhereUniqueInputSchema.parse(input),
// 		}),
// 	translationKey: async (input: unknown) =>
// 		await prisma.translationKey.findUnique({
// 			where: TranslationKeyWhereUniqueInputSchema.parse({ ns_key: input }),
// 		}),
// 	translationNamespace: async (input: unknown) =>
// 		await prisma.translationNamespace.findUnique({
// 			where: TranslationNamespaceWhereUniqueInputSchema.parse(input),
// 		}),
// 	user: async (input: unknown) =>
// 		await prisma.user.findUnique({ where: UserWhereUniqueInputSchema.parse(input) }),
// 	userCommunity: async (input: unknown) =>
// 		await prisma.userCommunity.findUnique({ where: UserCommunityWhereUniqueInputSchema.parse(input) }),
// 	userEthnicity: async (input: unknown) =>
// 		await prisma.userEthnicity.findUnique({ where: UserEthnicityWhereUniqueInputSchema.parse(input) }),
// 	userImmigration: async (input: unknown) =>
// 		await prisma.userImmigration.findUnique({
// 			where: UserImmigrationWhereUniqueInputSchema.parse(input),
// 		}),
// 	userMail: async (input: unknown) =>
// 		await prisma.userMail.findUnique({ where: UserMailWhereUniqueInputSchema.parse(input) }),
// 	userRole: async (input: unknown) =>
// 		await prisma.userRole.findUnique({ where: UserRoleWhereUniqueInputSchema.parse(input) }),
// 	userSavedList: async (input: unknown) =>
// 		await prisma.userSavedList.findUnique({ where: UserSavedListWhereUniqueInputSchema.parse(input) }),
// 	userSOGIdentity: async (input: unknown) =>
// 		await prisma.userSOGIdentity.findUnique({
// 			where: UserSOGIdentityWhereUniqueInputSchema.parse(input),
// 		}),
// 	userTitle: async (input: unknown) =>
// 		await prisma.userTitle.findUnique({ where: UserTitleWhereUniqueInputSchema.parse(input) }),
// 	userType: async (input: unknown) =>
// 		await prisma.userType.findUnique({ where: UserTypeWhereUniqueInputSchema.parse(input) }),
// 	assignedRole: async (input: unknown) =>
// 		await prisma.assignedRole.findUnique({
// 			where: AssignedRoleWhereUniqueInputSchema.parse({ userId_roleId: input }),
// 		}),
// 	attributeToCategory: async (input: unknown) =>
// 		await prisma.attributeToCategory.findUnique({
// 			where: AttributeToCategoryWhereUniqueInputSchema.parse({ attributeId_categoryId: input }),
// 		}),
// 	listSharedWith: async (input: unknown) =>
// 		await prisma.listSharedWith.findUnique({
// 			where: ListSharedWithWhereUniqueInputSchema.parse({ userId_listId: input }),
// 		}),
// 	locationAttribute: async (input: unknown) =>
// 		await prisma.locationAttribute.findUnique({
// 			where: LocationAttributeWhereUniqueInputSchema.parse(input),
// 		}),
// 	organizationAttribute: async (input: unknown) =>
// 		await prisma.organizationAttribute.findUnique({
// 			where: OrganizationAttributeWhereUniqueInputSchema.parse(input),
// 		}),
// 	orgLocationEmail: async (input: unknown) =>
// 		await prisma.orgLocationEmail.findUnique({
// 			where: OrgLocationEmailWhereUniqueInputSchema.parse(input),
// 		}),
// 	orgLocationPhone: async (input: unknown) =>
// 		await prisma.orgLocationPhone.findUnique({
// 			where: OrgLocationPhoneWhereUniqueInputSchema.parse(input),
// 		}),
// 	orgLocationService: async (input: unknown) =>
// 		await prisma.orgLocationService.findUnique({
// 			where: OrgLocationServiceWhereUniqueInputSchema.parse(input),
// 		}),
// 	orgPhoneLanguage: async (input: unknown) =>
// 		await prisma.orgPhoneLanguage.findUnique({
// 			where: OrgPhoneLanguageWhereUniqueInputSchema.parse(input),
// 		}),
// 	orgServiceEmail: async (input: unknown) =>
// 		await prisma.orgServiceEmail.findUnique({
// 			where: OrgServiceEmailWhereUniqueInputSchema.parse(input),
// 		}),
// 	orgServicePhone: async (input: unknown) =>
// 		await prisma.orgServicePhone.findUnique({
// 			where: OrgServicePhoneWhereUniqueInputSchema.parse(input),
// 		}),
// 	orgServiceTag: async (input: unknown) =>
// 		await prisma.orgServiceTag.findUnique({ where: OrgServiceTagWhereUniqueInputSchema.parse(input) }),
// 	orgWebsiteLanguage: async (input: unknown) =>
// 		await prisma.orgWebsiteLanguage.findUnique({
// 			where: OrgWebsiteLanguageWhereUniqueInputSchema.parse(input),
// 		}),
// 	rolePermission: async (input: unknown) =>
// 		await prisma.rolePermission.findUnique({
// 			where: RolePermissionWhereUniqueInputSchema.parse(input),
// 		}),
// 	savedOrganization: async (input: unknown) =>
// 		await prisma.savedOrganization.findUnique({
// 			where: SavedOrganizationWhereUniqueInputSchema.parse(input),
// 		}),
// 	savedService: async (input: unknown) =>
// 		await prisma.savedService.findUnique({ where: SavedServiceWhereUniqueInputSchema.parse(input) }),
// 	serviceAccessAttribute: async (input: unknown) =>
// 		await prisma.serviceAccessAttribute.findUnique({
// 			where: ServiceAccessAttributeWhereUniqueInputSchema.parse(input),
// 		}),
// 	serviceAreaCountry: async (input: unknown) =>
// 		await prisma.serviceAreaCountry.findUnique({
// 			where: ServiceAreaCountryWhereUniqueInputSchema.parse(input),
// 		}),
// 	serviceAreaDist: async (input: unknown) =>
// 		await prisma.serviceAreaDist.findUnique({
// 			where: ServiceAreaDistWhereUniqueInputSchema.parse(input),
// 		}),
// 	serviceAttribute: async (input: unknown) =>
// 		await prisma.serviceAttribute.findUnique({
// 			where: ServiceAttributeWhereUniqueInputSchema.parse(input),
// 		}),
// 	serviceCategoryDefaultAttribute: async (input: unknown) =>
// 		await prisma.serviceCategoryDefaultAttribute.findUnique({
// 			where: ServiceCategoryDefaultAttributeWhereUniqueInputSchema.parse(input),
// 		}),
// 	serviceTagDefaultAttribute: async (input: unknown) =>
// 		await prisma.serviceTagDefaultAttribute.findUnique({
// 			where: ServiceTagDefaultAttributeWhereUniqueInputSchema.parse(input),
// 		}),
// 	userCommunityLink: async (input: unknown) =>
// 		await prisma.userCommunityLink.findUnique({
// 			where: UserCommunityLinkWhereUniqueInputSchema.parse(input),
// 		}),
// 	userPermission: async (input: unknown) =>
// 		await prisma.userPermission.findUnique({
// 			where: UserPermissionWhereUniqueInputSchema.parse(input),
// 		}),
// 	userSOGLink: async (input: unknown) =>
// 		await prisma.userSOGLink.findUnique({
// 			where: UserSOGLinkWhereUniqueInputSchema.parse(input),
// 		}),
// 	userToOrganization: async (input: unknown) =>
// 		await prisma.userToOrganization.findUnique({
// 			where: UserToOrganizationWhereUniqueInputSchema.parse(input),
// 		}),
// }
export {}
