export type CountryMap = Map<string, string>

export type DistList = { id: string; slug: string }[]

export type DistMap = Map<string, string>

export type OrgIdMap = Map<string, string>

export type OrgSlugSet = Set<string>

export type LocationIdMap = Map<string, string>

export type ServiceIdMap = Map<string, string>

export type ServiceTagMap = Map<string, string>

export type AttributeMap = Map<
	string,
	{
		id: string
		requireText: boolean
		requireLanguage: boolean
		requireGeo: boolean
		requireBoolean: boolean
		requireData: boolean
	}
>

export type LanguageMap = Map<string, string>

export type SocialMediaMap = Map<string, string>

export type UserTypeMap = Map<string, string>

export type UserIdMap = Map<string, string>

export type PermissionMap = Map<string, string>

export type TranslationKeySet = Set<string>

export type TranslationMap = Map<string, string>

export type EmailIdMap = Map<string, string>

export type PhoneIdMap = Map<string, string>
