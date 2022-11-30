import * as z from 'zod'

import * as imports from '../zod-util'
import {
	AccountModel,
	AuditLogModel,
	CompleteAccount,
	CompleteAuditLog,
	CompleteCountry,
	CompleteFieldVisibility,
	CompleteGovDist,
	CompleteLanguage,
	CompleteOrgEmail,
	CompleteOrgPhone,
	CompleteOrganization,
	CompletePermissionAsset,
	CompletePermissionItem,
	CompleteSession,
	CompleteSource,
	CompleteUserCommunity,
	CompleteUserEthnicity,
	CompleteUserImmigration,
	CompleteUserMail,
	CompleteUserRole,
	CompleteUserSOGIdentity,
	CompleteUserSavedList,
	CompleteUserTitle,
	CompleteUserType,
	CountryModel,
	FieldVisibilityModel,
	GovDistModel,
	LanguageModel,
	OrgEmailModel,
	OrgPhoneModel,
	OrganizationModel,
	PermissionAssetModel,
	PermissionItemModel,
	SessionModel,
	SourceModel,
	UserCommunityModel,
	UserEthnicityModel,
	UserImmigrationModel,
	UserMailModel,
	UserRoleModel,
	UserSOGIdentityModel,
	UserSavedListModel,
	UserTitleModel,
	UserTypeModel,
} from './index'

export const _UserModel = z.object({
	id: imports.cuid,
	firstName: z.string().nullish(),
	lastName: z.string().nullish(),
	email: z.string(),
	emailVerified: z.date().nullish(),
	image: z.string().nullish(),
	/** Old ID from MongoDB */
	legacyId: z.string().nullish(),
	birthYear: z.number().int().nullish(),
	reasonForJoin: z.string().nullish(),
	currentCity: z.string().nullish(),
	currentGovDistId: imports.cuid.nullish(),
	currentCountryId: imports.cuid.nullish(),
	legacyHash: z.string().nullish(),
	legacySalt: z.string().nullish(),
	migrateDate: z.date().nullish(),
	immigrationId: imports.cuid.nullish(),
	roleId: imports.cuid,
	userTypeId: imports.cuid,
	langPrefId: imports.cuid,
	sourceId: imports.cuid.nullish(),
	associatedOrgId: imports.cuid.nullish(),
	orgTitleId: imports.cuid.nullish(),
	createdAt: z.date(),
	updatedAt: z.date(),
})

export interface CompleteUser extends z.infer<typeof _UserModel> {
	accounts: CompleteAccount[]
	sessions: CompleteSession[]
	ethnicity: CompleteUserEthnicity[]
	countryOrigin: CompleteCountry[]
	identifiesAs: CompleteUserSOGIdentity[]
	communities: CompleteUserCommunity[]
	permissions: CompletePermissionItem[]
	PermissionAsset: CompletePermissionAsset[]
	currentGovDist?: CompleteGovDist | null
	currentCountry?: CompleteCountry | null
	lists: CompleteUserSavedList[]
	sharedLists: CompleteUserSavedList[]
	immigration?: CompleteUserImmigration | null
	role: CompleteUserRole
	userType: CompleteUserType
	langPref: CompleteLanguage
	source?: CompleteSource | null
	mailReceived: CompleteUserMail[]
	mailSent: CompleteUserMail[]
	associatedOrg?: CompleteOrganization | null
	orgTitle?: CompleteUserTitle | null
	orgEmail?: CompleteOrgEmail | null
	orgPhone?: CompleteOrgPhone | null
	FieldVisibility: CompleteFieldVisibility[]
	AuditLogEntry: CompleteAuditLog[]
	auditLog: CompleteAuditLog[]
}

/**
 * UserModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const UserModel: z.ZodSchema<CompleteUser> = z.lazy(() =>
	_UserModel.extend({
		accounts: AccountModel.array(),
		sessions: SessionModel.array(),
		ethnicity: UserEthnicityModel.array(),
		countryOrigin: CountryModel.array(),
		identifiesAs: UserSOGIdentityModel.array(),
		communities: UserCommunityModel.array(),
		permissions: PermissionItemModel.array(),
		/** Assets that certain permissible roles are attributed to (edit org, etc) */
		PermissionAsset: PermissionAssetModel.array(),
		currentGovDist: GovDistModel.nullish(),
		currentCountry: CountryModel.nullish(),
		lists: UserSavedListModel.array(),
		sharedLists: UserSavedListModel.array(),
		immigration: UserImmigrationModel.nullish(),
		role: UserRoleModel,
		userType: UserTypeModel,
		langPref: LanguageModel,
		source: SourceModel.nullish(),
		mailReceived: UserMailModel.array(),
		mailSent: UserMailModel.array(),
		associatedOrg: OrganizationModel.nullish(),
		orgTitle: UserTitleModel.nullish(),
		orgEmail: OrgEmailModel.nullish(),
		orgPhone: OrgPhoneModel.nullish(),
		/** For user profile page. All fields default to 'NONE' */
		FieldVisibility: FieldVisibilityModel.array(),
		/** Recording changes made by user */
		AuditLogEntry: AuditLogModel.array(),
		auditLog: AuditLogModel.array(),
	})
)
