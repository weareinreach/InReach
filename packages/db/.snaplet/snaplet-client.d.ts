type ScalarField = {
	name: string
	type: string
}
type ObjectField = ScalarField & {
	relationFromFields: string[]
	relationToFields: string[]
}
type Inflection = {
	modelName?: (name: string) => string
	scalarField?: (field: ScalarField) => string
	parentField?: (field: ObjectField, oppositeBaseNameMap: Record<string, string>) => string
	childField?: (
		field: ObjectField,
		oppositeField: ObjectField,
		oppositeBaseNameMap: Record<string, string>
	) => string
	oppositeBaseNameMap?: Record<string, string>
}
type Override = {
	Account?: {
		name?: string
		fields?: {
			id?: string
			type?: string
			provider?: string
			providerAccountId?: string
			refresh_token?: string
			access_token?: string
			expires_at?: string
			token_type?: string
			scope?: string
			id_token?: string
			session_state?: string
			userId?: string
			createdAt?: string
			updatedAt?: string
			User?: string
		}
	}
	AssignedRole?: {
		name?: string
		fields?: {
			userId?: string
			roleId?: string
			linkedAt?: string
			authorized?: string
			User?: string
			UserRole?: string
		}
	}
	Attribute?: {
		name?: string
		fields?: {
			id?: string
			tag?: string
			name?: string
			icon?: string
			intDesc?: string
			active?: string
			tsKey?: string
			tsNs?: string
			requireText?: string
			requireLanguage?: string
			requireGeo?: string
			requireBoolean?: string
			requireData?: string
			filterType?: string
			createdAt?: string
			updatedAt?: string
			showOnLocation?: string
			iconBg?: string
			requiredSchemaId?: string
			activeForSuggest?: string
			AttributeSupplementDataSchema?: string
			TranslationKey?: string
			AttributeNesting_AttributeNesting_childIdToAttribute?: string
			AttributeNesting_AttributeNesting_parentIdToAttribute?: string
			AttributeSupplement?: string
			AttributeToCategory?: string
			InternalNote?: string
			ServiceCategoryDefaultAttribute?: string
			ServiceTagDefaultAttribute?: string
		}
	}
	AttributeCategory?: {
		name?: string
		fields?: {
			id?: string
			tag?: string
			name?: string
			icon?: string
			intDesc?: string
			active?: string
			ns?: string
			createdAt?: string
			updatedAt?: string
			renderVariant?: string
			TranslationNamespace?: string
			AttributeToCategory?: string
			InternalNote?: string
		}
	}
	AttributeNesting?: {
		name?: string
		fields?: {
			childId?: string
			parentId?: string
			linkedAt?: string
			Attribute_AttributeNesting_childIdToAttribute?: string
			Attribute_AttributeNesting_parentIdToAttribute?: string
		}
	}
	AttributeSupplement?: {
		name?: string
		fields?: {
			id?: string
			active?: string
			data?: string
			boolean?: string
			textId?: string
			countryId?: string
			languageId?: string
			createdAt?: string
			updatedAt?: string
			govDistId?: string
			attributeId?: string
			locationId?: string
			organizationId?: string
			serviceId?: string
			userId?: string
			Attribute?: string
			Country?: string
			FreeText?: string
			GovDist?: string
			Language?: string
			OrgLocation?: string
			OrgService?: string
			Organization?: string
			User?: string
			InternalNote?: string
		}
	}
	AttributeSupplementDataSchema?: {
		name?: string
		fields?: {
			id?: string
			tag?: string
			name?: string
			definition?: string
			createdAt?: string
			updatedAt?: string
			active?: string
			Attribute?: string
			InternalNote?: string
		}
	}
	AttributeToCategory?: {
		name?: string
		fields?: {
			attributeId?: string
			categoryId?: string
			linkedAt?: string
			Attribute?: string
			AttributeCategory?: string
		}
	}
	AuditTrail?: {
		name?: string
		fields?: {
			id?: string
			table?: string
			table_oid?: string
			recordId?: string
			operation?: string
			old?: string
			new?: string
			timestamp?: string
			actorId?: string
		}
	}
	Country?: {
		name?: string
		fields?: {
			id?: string
			cca2?: string
			cca3?: string
			name?: string
			dialCode?: string
			flag?: string
			tsKey?: string
			tsNs?: string
			demonymKey?: string
			demonymNs?: string
			createdAt?: string
			updatedAt?: string
			activeForOrgs?: string
			activeForSuggest?: string
			geoDataId?: string
			articlePrefix?: string
			GeoData?: string
			TranslationKey_Country_demonymKey_demonymNsToTranslationKey?: string
			TranslationKey_Country_tsKey_tsNsToTranslationKey?: string
			AttributeSupplement?: string
			GovDist?: string
			InternalNote?: string
			OrgLocation?: string
			OrgPhone?: string
			OrgReview?: string
			ServiceAreaCountry?: string
			ServiceTagCountry?: string
			User?: string
			UserSurvey_UserSurvey_countryOriginIdToCountry?: string
			UserSurvey_UserSurvey_currentCountryIdToCountry?: string
		}
	}
	DataMigration?: {
		name?: string
		fields?: {
			id?: string
			title?: string
			description?: string
			createdBy?: string
			appliedAt?: string
			jobId?: string
		}
	}
	FieldVisibility?: {
		name?: string
		fields?: {
			id?: string
			userId?: string
			name?: string
			email?: string
			image?: string
			ethnicity?: string
			countryOrigin?: string
			SOG?: string
			communities?: string
			currentCity?: string
			currentGovDist?: string
			currentCountry?: string
			userType?: string
			associatedOrg?: string
			orgTitle?: string
			createdAt?: string
			recordCreatedAt?: string
			recordupdatedAt?: string
			User?: string
		}
	}
	FreeText?: {
		name?: string
		fields?: {
			id?: string
			key?: string
			ns?: string
			createdAt?: string
			updatedAt?: string
			TranslationKey?: string
			AttributeSupplement?: string
			OrgEmail?: string
			OrgLocation?: string
			OrgPhone?: string
			OrgService_OrgService_descriptionIdToFreeText?: string
			OrgService_OrgService_serviceNameIdToFreeText?: string
			OrgWebsite?: string
			Organization?: string
		}
	}
	GeoData?: {
		name?: string
		fields?: {
			id?: string
			name?: string
			geo?: string
			iso?: string
			iso2?: string
			abbrev?: string
			type?: string
			adminLevel?: string
			Country?: string
			GovDist?: string
		}
	}
	GovDist?: {
		name?: string
		fields?: {
			id?: string
			name?: string
			slug?: string
			iso?: string
			abbrev?: string
			countryId?: string
			govDistTypeId?: string
			isPrimary?: string
			parentId?: string
			tsKey?: string
			tsNs?: string
			createdAt?: string
			updatedAt?: string
			active?: string
			geoDataId?: string
			Country?: string
			GeoData?: string
			GovDist?: string
			GovDistType?: string
			TranslationKey?: string
			AttributeSupplement?: string
			GovDist?: string
			InternalNote?: string
			OrgLocation?: string
			OrgReview?: string
			ServiceAreaDist?: string
			User?: string
			UserSurvey?: string
		}
	}
	GovDistType?: {
		name?: string
		fields?: {
			id?: string
			name?: string
			tsKey?: string
			tsNs?: string
			createdAt?: string
			updatedAt?: string
			TranslationKey?: string
			GovDist?: string
			InternalNote?: string
		}
	}
	InternalNote?: {
		name?: string
		fields?: {
			id?: string
			legacyId?: string
			text?: string
			attributeId?: string
			attributeCategoryId?: string
			attributeSupplementId?: string
			countryId?: string
			govDistId?: string
			govDistTypeId?: string
			languageId?: string
			organizationId?: string
			orgEmailId?: string
			orgHoursId?: string
			orgLocationId?: string
			orgPhoneId?: string
			orgPhotoId?: string
			orgReviewId?: string
			orgServiceId?: string
			orgSocialMediaId?: string
			orgWebsiteId?: string
			outsideApiId?: string
			outsideAPIServiceService?: string
			permissionId?: string
			phoneTypeId?: string
			serviceCategoryId?: string
			serviceTagId?: string
			socialMediaLinkId?: string
			socialMediaServiceId?: string
			sourceId?: string
			translationKey?: string
			translationNs?: string
			translationNamespaceName?: string
			createdAt?: string
			updatedAt?: string
			attributeSupplementDataSchemaId?: string
			suggestionId?: string
			Attribute?: string
			AttributeCategory?: string
			AttributeSupplement?: string
			AttributeSupplementDataSchema?: string
			Country?: string
			GovDist?: string
			GovDistType?: string
			Language?: string
			OrgEmail?: string
			OrgHours?: string
			OrgLocation?: string
			OrgPhone?: string
			OrgPhoto?: string
			OrgReview?: string
			OrgService?: string
			OrgSocialMedia?: string
			OrgWebsite?: string
			Organization?: string
			OutsideAPI?: string
			OutsideAPIService?: string
			Permission?: string
			PhoneType?: string
			ServiceCategory?: string
			ServiceTag?: string
			SocialMediaLink?: string
			SocialMediaService?: string
			Source?: string
			Suggestion?: string
			TranslationKey?: string
			TranslationNamespace?: string
		}
	}
	Language?: {
		name?: string
		fields?: {
			id?: string
			languageName?: string
			localeCode?: string
			iso6392?: string
			nativeName?: string
			activelyTranslated?: string
			createdAt?: string
			updatedAt?: string
			defaultSort?: string
			groupCommon?: string
			AttributeSupplement?: string
			InternalNote?: string
			OrgPhoneLanguage?: string
			OrgReview?: string
			OrgWebsiteLanguage?: string
			TranslatedReview?: string
			User?: string
		}
	}
	ListSharedWith?: {
		name?: string
		fields?: {
			userId?: string
			listId?: string
			linkedAt?: string
			User?: string
			UserSavedList?: string
		}
	}
	LocationPermission?: {
		name?: string
		fields?: {
			userId?: string
			permissionId?: string
			authorized?: string
			orgLocationId?: string
			createdAt?: string
			updatedAt?: string
			OrgLocation?: string
			Permission?: string
			User?: string
		}
	}
	OrgEmail?: {
		name?: string
		fields?: {
			id?: string
			legacyId?: string
			legacyDesc?: string
			firstName?: string
			lastName?: string
			primary?: string
			email?: string
			published?: string
			deleted?: string
			titleId?: string
			descriptionId?: string
			locationOnly?: string
			serviceOnly?: string
			createdAt?: string
			updatedAt?: string
			FreeText?: string
			UserTitle?: string
			InternalNote?: string
			OrgLocationEmail?: string
			OrgServiceEmail?: string
			OrganizationEmail?: string
			UserToOrganization?: string
		}
	}
	OrgHours?: {
		name?: string
		fields?: {
			id?: string
			dayIndex?: string
			start?: string
			end?: string
			closed?: string
			orgLocId?: string
			orgServiceId?: string
			organizationId?: string
			needAssignment?: string
			needReview?: string
			legacyId?: string
			legacyName?: string
			legacyNote?: string
			legacyStart?: string
			legacyEnd?: string
			legacyTz?: string
			createdAt?: string
			updatedAt?: string
			tz?: string
			active?: string
			interval?: string
			open24hours?: string
			OrgLocation?: string
			OrgService?: string
			Organization?: string
			InternalNote?: string
		}
	}
	OrgLocation?: {
		name?: string
		fields?: {
			id?: string
			legacyId?: string
			name?: string
			street1?: string
			street2?: string
			city?: string
			postCode?: string
			primary?: string
			govDistId?: string
			countryId?: string
			longitude?: string
			latitude?: string
			geo?: string
			geoJSON?: string
			geoWKT?: string
			published?: string
			deleted?: string
			orgId?: string
			apiLocationId?: string
			createdAt?: string
			updatedAt?: string
			checkMigration?: string
			descriptionId?: string
			mailOnly?: string
			mapCityOnly?: string
			notVisitable?: string
			Country?: string
			FreeText?: string
			GovDist?: string
			Organization?: string
			AttributeSupplement?: string
			InternalNote?: string
			LocationPermission?: string
			OrgHours?: string
			OrgLocationEmail?: string
			OrgLocationPhone?: string
			OrgLocationService?: string
			OrgLocationSocialMedia?: string
			OrgLocationWebsite?: string
			OrgPhoto?: string
			OrgReview?: string
			OutsideAPI?: string
			ServiceArea?: string
		}
	}
	OrgLocationEmail?: {
		name?: string
		fields?: {
			orgLocationId?: string
			orgEmailId?: string
			linkedAt?: string
			active?: string
			OrgEmail?: string
			OrgLocation?: string
		}
	}
	OrgLocationPhone?: {
		name?: string
		fields?: {
			orgLocationId?: string
			phoneId?: string
			linkedAt?: string
			active?: string
			OrgLocation?: string
			OrgPhone?: string
		}
	}
	OrgLocationService?: {
		name?: string
		fields?: {
			orgLocationId?: string
			serviceId?: string
			linkedAt?: string
			active?: string
			OrgLocation?: string
			OrgService?: string
		}
	}
	OrgLocationSocialMedia?: {
		name?: string
		fields?: {
			orgLocationId?: string
			socialMediaId?: string
			linkedAt?: string
			active?: string
			OrgLocation?: string
			OrgSocialMedia?: string
		}
	}
	OrgLocationWebsite?: {
		name?: string
		fields?: {
			orgLocationId?: string
			orgWebsiteId?: string
			linkedAt?: string
			active?: string
			OrgLocation?: string
			OrgWebsite?: string
		}
	}
	OrgPhone?: {
		name?: string
		fields?: {
			id?: string
			legacyId?: string
			legacyDesc?: string
			number?: string
			ext?: string
			primary?: string
			published?: string
			deleted?: string
			migrationReview?: string
			countryId?: string
			phoneTypeId?: string
			locationOnly?: string
			createdAt?: string
			updatedAt?: string
			descriptionId?: string
			serviceOnly?: string
			countryCode?: string
			Country?: string
			FreeText?: string
			PhoneType?: string
			InternalNote?: string
			OrgLocationPhone?: string
			OrgPhoneLanguage?: string
			OrgServicePhone?: string
			OrganizationPhone?: string
			UserToOrganization?: string
		}
	}
	OrgPhoneLanguage?: {
		name?: string
		fields?: {
			orgPhoneId?: string
			languageId?: string
			linkedAt?: string
			active?: string
			Language?: string
			OrgPhone?: string
		}
	}
	OrgPhoto?: {
		name?: string
		fields?: {
			id?: string
			src?: string
			height?: string
			width?: string
			published?: string
			deleted?: string
			orgId?: string
			orgLocationId?: string
			createdAt?: string
			updatedAt?: string
			OrgLocation?: string
			Organization?: string
			InternalNote?: string
		}
	}
	OrgReview?: {
		name?: string
		fields?: {
			id?: string
			legacyId?: string
			rating?: string
			reviewText?: string
			visible?: string
			deleted?: string
			userId?: string
			organizationId?: string
			orgServiceId?: string
			orgLocationId?: string
			langId?: string
			langConfidence?: string
			toxicity?: string
			lcrCity?: string
			lcrGovDistId?: string
			lcrCountryId?: string
			createdAt?: string
			updatedAt?: string
			featured?: string
			Country?: string
			GovDist?: string
			Language?: string
			OrgLocation?: string
			OrgService?: string
			Organization?: string
			User?: string
			InternalNote?: string
			TranslatedReview?: string
		}
	}
	OrgService?: {
		name?: string
		fields?: {
			id?: string
			legacyId?: string
			published?: string
			deleted?: string
			legacyName?: string
			descriptionId?: string
			organizationId?: string
			createdAt?: string
			updatedAt?: string
			checkMigration?: string
			serviceNameId?: string
			crisisSupportOnly?: string
			FreeText_OrgService_descriptionIdToFreeText?: string
			FreeText_OrgService_serviceNameIdToFreeText?: string
			Organization?: string
			AttributeSupplement?: string
			InternalNote?: string
			OrgHours?: string
			OrgLocationService?: string
			OrgReview?: string
			OrgServiceEmail?: string
			OrgServicePhone?: string
			OrgServiceTag?: string
			OrgServiceWebsite?: string
			SavedService?: string
			ServiceArea?: string
		}
	}
	OrgServiceEmail?: {
		name?: string
		fields?: {
			orgEmailId?: string
			serviceId?: string
			linkedAt?: string
			active?: string
			OrgEmail?: string
			OrgService?: string
		}
	}
	OrgServicePhone?: {
		name?: string
		fields?: {
			orgPhoneId?: string
			serviceId?: string
			linkedAt?: string
			active?: string
			OrgPhone?: string
			OrgService?: string
		}
	}
	OrgServiceTag?: {
		name?: string
		fields?: {
			serviceId?: string
			tagId?: string
			linkedAt?: string
			active?: string
			OrgService?: string
			ServiceTag?: string
		}
	}
	OrgServiceWebsite?: {
		name?: string
		fields?: {
			orgWebsiteId?: string
			serviceId?: string
			linkedAt?: string
			active?: string
			OrgService?: string
			OrgWebsite?: string
		}
	}
	OrgSocialMedia?: {
		name?: string
		fields?: {
			id?: string
			legacyId?: string
			username?: string
			url?: string
			deleted?: string
			published?: string
			serviceId?: string
			organizationId?: string
			orgLocationOnly?: string
			createdAt?: string
			updatedAt?: string
			Organization?: string
			SocialMediaService?: string
			InternalNote?: string
			OrgLocationSocialMedia?: string
		}
	}
	OrgWebsite?: {
		name?: string
		fields?: {
			id?: string
			url?: string
			descriptionId?: string
			organizationId?: string
			orgLocationOnly?: string
			createdAt?: string
			updatedAt?: string
			isPrimary?: string
			deleted?: string
			published?: string
			FreeText?: string
			Organization?: string
			InternalNote?: string
			OrgLocationWebsite?: string
			OrgServiceWebsite?: string
			OrgWebsiteLanguage?: string
		}
	}
	OrgWebsiteLanguage?: {
		name?: string
		fields?: {
			orgWebsiteId?: string
			languageId?: string
			linkedAt?: string
			active?: string
			Language?: string
			OrgWebsite?: string
		}
	}
	Organization?: {
		name?: string
		fields?: {
			id?: string
			legacyId?: string
			name?: string
			slug?: string
			legacySlug?: string
			descriptionId?: string
			deleted?: string
			published?: string
			lastVerified?: string
			sourceId?: string
			createdAt?: string
			updatedAt?: string
			checkMigration?: string
			crisisResource?: string
			crisisResourceSort?: string
			FreeText?: string
			Source?: string
			AttributeSupplement?: string
			InternalNote?: string
			OrgHours?: string
			OrgLocation?: string
			OrgPhoto?: string
			OrgReview?: string
			OrgService?: string
			OrgSocialMedia?: string
			OrgWebsite?: string
			OrganizationEmail?: string
			OrganizationPermission?: string
			OrganizationPhone?: string
			OutsideAPI?: string
			SavedOrganization?: string
			ServiceArea?: string
			SlugRedirect?: string
			Suggestion?: string
			UserToOrganization?: string
		}
	}
	OrganizationEmail?: {
		name?: string
		fields?: {
			orgEmailId?: string
			organizationId?: string
			linkedAt?: string
			active?: string
			OrgEmail?: string
			Organization?: string
		}
	}
	OrganizationPermission?: {
		name?: string
		fields?: {
			userId?: string
			permissionId?: string
			authorized?: string
			organizationId?: string
			linkedAt?: string
			createdAt?: string
			updatedAt?: string
			Organization?: string
			Permission?: string
			User?: string
		}
	}
	OrganizationPhone?: {
		name?: string
		fields?: {
			organizationId?: string
			phoneId?: string
			linkedAt?: string
			active?: string
			OrgPhone?: string
			Organization?: string
		}
	}
	OutsideAPI?: {
		name?: string
		fields?: {
			id?: string
			apiIdentifier?: string
			serviceName?: string
			organizationId?: string
			orgLocationId?: string
			createdAt?: string
			updatedAt?: string
			active?: string
			OrgLocation?: string
			Organization?: string
			OutsideAPIService?: string
			InternalNote?: string
		}
	}
	OutsideAPIService?: {
		name?: string
		fields?: {
			service?: string
			description?: string
			urlPattern?: string
			apiKey?: string
			createdAt?: string
			updatedAt?: string
			active?: string
			InternalNote?: string
			OutsideAPI?: string
		}
	}
	Permission?: {
		name?: string
		fields?: {
			id?: string
			name?: string
			description?: string
			createdAt?: string
			updatedAt?: string
			active?: string
			InternalNote?: string
			LocationPermission?: string
			OrganizationPermission?: string
			RolePermission?: string
			UserPermission?: string
		}
	}
	PhoneType?: {
		name?: string
		fields?: {
			id?: string
			type?: string
			tsKey?: string
			tsNs?: string
			createdAt?: string
			updatedAt?: string
			active?: string
			TranslationKey?: string
			InternalNote?: string
			OrgPhone?: string
		}
	}
	RolePermission?: {
		name?: string
		fields?: {
			roleId?: string
			permissionId?: string
			linkedAt?: string
			active?: string
			Permission?: string
			UserRole?: string
		}
	}
	SavedOrganization?: {
		name?: string
		fields?: {
			listId?: string
			organizationId?: string
			linkedAt?: string
			Organization?: string
			UserSavedList?: string
		}
	}
	SavedService?: {
		name?: string
		fields?: {
			listId?: string
			serviceId?: string
			linkedAt?: string
			OrgService?: string
			UserSavedList?: string
		}
	}
	ServiceArea?: {
		name?: string
		fields?: {
			id?: string
			organizationId?: string
			orgLocationId?: string
			orgServiceId?: string
			createdAt?: string
			updatedAt?: string
			active?: string
			OrgLocation?: string
			OrgService?: string
			Organization?: string
			ServiceAreaCountry?: string
			ServiceAreaDist?: string
		}
	}
	ServiceAreaCountry?: {
		name?: string
		fields?: {
			serviceAreaId?: string
			countryId?: string
			linkedAt?: string
			active?: string
			Country?: string
			ServiceArea?: string
		}
	}
	ServiceAreaDist?: {
		name?: string
		fields?: {
			serviceAreaId?: string
			govDistId?: string
			linkedAt?: string
			active?: string
			GovDist?: string
			ServiceArea?: string
		}
	}
	ServiceCategory?: {
		name?: string
		fields?: {
			id?: string
			category?: string
			active?: string
			tsKey?: string
			tsNs?: string
			createdAt?: string
			updatedAt?: string
			activeForSuggest?: string
			crisisSupportOnly?: string
			TranslationKey?: string
			InternalNote?: string
			ServiceCategoryDefaultAttribute?: string
			ServiceTag?: string
			ServiceTagToCategory?: string
		}
	}
	ServiceCategoryDefaultAttribute?: {
		name?: string
		fields?: {
			attributeId?: string
			categoryId?: string
			linkedAt?: string
			active?: string
			Attribute?: string
			ServiceCategory?: string
		}
	}
	ServiceTag?: {
		name?: string
		fields?: {
			id?: string
			name?: string
			active?: string
			tsKey?: string
			tsNs?: string
			createdAt?: string
			updatedAt?: string
			crisisSupportOnly?: string
			primaryCategoryId?: string
			ServiceCategory?: string
			TranslationKey?: string
			InternalNote?: string
			OrgServiceTag?: string
			ServiceTagCountry?: string
			ServiceTagDefaultAttribute?: string
			ServiceTagNesting_ServiceTagNesting_childIdToServiceTag?: string
			ServiceTagNesting_ServiceTagNesting_parentIdToServiceTag?: string
			ServiceTagToCategory?: string
		}
	}
	ServiceTagCountry?: {
		name?: string
		fields?: {
			countryId?: string
			serviceId?: string
			linkedAt?: string
			active?: string
			Country?: string
			ServiceTag?: string
		}
	}
	ServiceTagDefaultAttribute?: {
		name?: string
		fields?: {
			attributeId?: string
			serviceId?: string
			linkedAt?: string
			active?: string
			Attribute?: string
			ServiceTag?: string
		}
	}
	ServiceTagNesting?: {
		name?: string
		fields?: {
			childId?: string
			parentId?: string
			linkedAt?: string
			ServiceTag_ServiceTagNesting_childIdToServiceTag?: string
			ServiceTag_ServiceTagNesting_parentIdToServiceTag?: string
		}
	}
	ServiceTagToCategory?: {
		name?: string
		fields?: {
			categoryId?: string
			serviceTagId?: string
			linkedAt?: string
			active?: string
			ServiceCategory?: string
			ServiceTag?: string
		}
	}
	Session?: {
		name?: string
		fields?: {
			id?: string
			sessionToken?: string
			expires?: string
			userId?: string
			User?: string
		}
	}
	SlugRedirect?: {
		name?: string
		fields?: {
			id?: string
			from?: string
			to?: string
			orgId?: string
			createdAt?: string
			updatedAt?: string
			Organization?: string
		}
	}
	SocialMediaLink?: {
		name?: string
		fields?: {
			id?: string
			href?: string
			icon?: string
			serviceId?: string
			createdAt?: string
			updatedAt?: string
			SocialMediaService?: string
			InternalNote?: string
		}
	}
	SocialMediaService?: {
		name?: string
		fields?: {
			id?: string
			name?: string
			urlBase?: string
			logoIcon?: string
			internal?: string
			tsKey?: string
			tsNs?: string
			createdAt?: string
			updatedAt?: string
			active?: string
			TranslationKey?: string
			InternalNote?: string
			OrgSocialMedia?: string
			SocialMediaLink?: string
		}
	}
	Source?: {
		name?: string
		fields?: {
			id?: string
			source?: string
			type?: string
			createdAt?: string
			updatedAt?: string
			active?: string
			InternalNote?: string
			Organization?: string
			User?: string
		}
	}
	Suggestion?: {
		name?: string
		fields?: {
			id?: string
			data?: string
			organizationId?: string
			createdAt?: string
			updatedAt?: string
			handled?: string
			Organization?: string
			InternalNote?: string
		}
	}
	SurveyCommunity?: {
		name?: string
		fields?: {
			surveyId?: string
			communityId?: string
			UserCommunity?: string
			UserSurvey?: string
		}
	}
	SurveyEthnicity?: {
		name?: string
		fields?: {
			surveyId?: string
			ethnicityId?: string
			UserEthnicity?: string
			UserSurvey?: string
		}
	}
	SurveySOG?: {
		name?: string
		fields?: {
			surveyId?: string
			sogId?: string
			UserSOGIdentity?: string
			UserSurvey?: string
		}
	}
	TranslatedReview?: {
		name?: string
		fields?: {
			id?: string
			reviewId?: string
			languageId?: string
			text?: string
			createdAt?: string
			updatedAt?: string
			Language?: string
			OrgReview?: string
		}
	}
	TranslationKey?: {
		name?: string
		fields?: {
			key?: string
			text?: string
			context?: string
			ns?: string
			createdAt?: string
			updatedAt?: string
			crowdinId?: string
			interpolation?: string
			interpolationValues?: string
			TranslationNamespace?: string
			Attribute?: string
			Country_Country_demonymKey_demonymNsToTranslationKey?: string
			Country_Country_tsKey_tsNsToTranslationKey?: string
			FreeText?: string
			GovDist?: string
			GovDistType?: string
			InternalNote?: string
			PhoneType?: string
			ServiceCategory?: string
			ServiceTag?: string
			SocialMediaService?: string
			UserCommunity?: string
			UserEthnicity?: string
			UserImmigration?: string
			UserSOGIdentity?: string
			UserTitle?: string
			UserType?: string
		}
	}
	TranslationNamespace?: {
		name?: string
		fields?: {
			name?: string
			exportFile?: string
			createdAt?: string
			updatedAt?: string
			crowdinId?: string
			AttributeCategory?: string
			InternalNote?: string
			TranslationKey?: string
		}
	}
	User?: {
		name?: string
		fields?: {
			id?: string
			name?: string
			email?: string
			emailVerified?: string
			image?: string
			legacyId?: string
			active?: string
			currentCity?: string
			currentGovDistId?: string
			currentCountryId?: string
			legacyHash?: string
			legacySalt?: string
			migrateDate?: string
			userTypeId?: string
			langPrefId?: string
			sourceId?: string
			createdAt?: string
			updatedAt?: string
			signupData?: string
			Country?: string
			GovDist?: string
			Language?: string
			Source?: string
			UserType?: string
			Account?: string
			AssignedRole?: string
			AttributeSupplement?: string
			FieldVisibility?: string
			ListSharedWith?: string
			LocationPermission?: string
			OrgReview?: string
			OrganizationPermission?: string
			Session?: string
			UserCommunityLink?: string
			UserMail_UserMail_fromUserIdToUser?: string
			UserMail_UserMail_toUserIdToUser?: string
			UserPermission?: string
			UserSOGLink?: string
			UserSavedList?: string
			UserToOrganization?: string
		}
	}
	UserCommunity?: {
		name?: string
		fields?: {
			id?: string
			community?: string
			tsKey?: string
			tsNs?: string
			createdAt?: string
			updatedAt?: string
			active?: string
			TranslationKey?: string
			SurveyCommunity?: string
			UserCommunityLink?: string
		}
	}
	UserCommunityLink?: {
		name?: string
		fields?: {
			userId?: string
			communityId?: string
			linkedAt?: string
			User?: string
			UserCommunity?: string
		}
	}
	UserEthnicity?: {
		name?: string
		fields?: {
			id?: string
			ethnicity?: string
			tsKey?: string
			tsNs?: string
			createdAt?: string
			updatedAt?: string
			active?: string
			TranslationKey?: string
			SurveyEthnicity?: string
		}
	}
	UserImmigration?: {
		name?: string
		fields?: {
			id?: string
			status?: string
			tsKey?: string
			tsNs?: string
			createdAt?: string
			updatedAt?: string
			active?: string
			TranslationKey?: string
			UserSurvey?: string
		}
	}
	UserMail?: {
		name?: string
		fields?: {
			id?: string
			toUserId?: string
			toExternal?: string
			read?: string
			subject?: string
			body?: string
			from?: string
			fromUserId?: string
			responseToId?: string
			createdAt?: string
			updatedAt?: string
			User_UserMail_fromUserIdToUser?: string
			User_UserMail_toUserIdToUser?: string
			UserMail?: string
			UserMail?: string
		}
	}
	UserPermission?: {
		name?: string
		fields?: {
			userId?: string
			permissionId?: string
			linkedAt?: string
			authorized?: string
			Permission?: string
			User?: string
		}
	}
	UserRole?: {
		name?: string
		fields?: {
			id?: string
			name?: string
			tag?: string
			createdAt?: string
			updatedAt?: string
			active?: string
			AssignedRole?: string
			RolePermission?: string
		}
	}
	UserSOGIdentity?: {
		name?: string
		fields?: {
			id?: string
			identifyAs?: string
			tsKey?: string
			tsNs?: string
			createdAt?: string
			updatedAt?: string
			active?: string
			TranslationKey?: string
			SurveySOG?: string
			UserSOGLink?: string
		}
	}
	UserSOGLink?: {
		name?: string
		fields?: {
			userId?: string
			sogIdentityId?: string
			linkedAt?: string
			User?: string
			UserSOGIdentity?: string
		}
	}
	UserSavedList?: {
		name?: string
		fields?: {
			id?: string
			name?: string
			sharedLinkKey?: string
			ownedById?: string
			createdAt?: string
			updatedAt?: string
			User?: string
			ListSharedWith?: string
			SavedOrganization?: string
			SavedService?: string
		}
	}
	UserSurvey?: {
		name?: string
		fields?: {
			id?: string
			birthYear?: string
			reasonForJoin?: string
			countryOriginId?: string
			immigrationId?: string
			currentCity?: string
			currentGovDistId?: string
			currentCountryId?: string
			ethnicityOther?: string
			immigrationOther?: string
			Country_UserSurvey_countryOriginIdToCountry?: string
			Country_UserSurvey_currentCountryIdToCountry?: string
			GovDist?: string
			UserImmigration?: string
			SurveyCommunity?: string
			SurveyEthnicity?: string
			SurveySOG?: string
		}
	}
	UserTitle?: {
		name?: string
		fields?: {
			id?: string
			title?: string
			searchable?: string
			tsKey?: string
			tsNs?: string
			createdAt?: string
			updatedAt?: string
			active?: string
			TranslationKey?: string
			OrgEmail?: string
			UserToOrganization?: string
		}
	}
	UserToOrganization?: {
		name?: string
		fields?: {
			userId?: string
			organizationId?: string
			orgTitleId?: string
			orgEmailId?: string
			orgPhoneId?: string
			linkedAt?: string
			authorized?: string
			OrgEmail?: string
			OrgPhone?: string
			Organization?: string
			User?: string
			UserTitle?: string
		}
	}
	UserType?: {
		name?: string
		fields?: {
			id?: string
			type?: string
			tsKey?: string
			tsNs?: string
			createdAt?: string
			updatedAt?: string
			active?: string
			TranslationKey?: string
			User?: string
		}
	}
	VerificationToken?: {
		name?: string
		fields?: {
			identifier?: string
			token?: string
			expires?: string
		}
	}
	_prisma_migrations?: {
		name?: string
		fields?: {
			id?: string
			checksum?: string
			finished_at?: string
			migration_name?: string
			logs?: string
			rolled_back_at?: string
			started_at?: string
			applied_steps_count?: string
		}
	}
	spatial_ref_sys?: {
		name?: string
		fields?: {
			srid?: string
			auth_name?: string
			auth_srid?: string
			srtext?: string
			proj4text?: string
		}
	}
}
export type Alias = {
	inflection?: Inflection | boolean
	override?: Override
}
interface FingerprintRelationField {
	count?: number | MinMaxOption
}
interface FingerprintJsonField {
	schema?: any
}
interface FingerprintDateField {
	options?: {
		minYear?: number
		maxYear?: number
	}
}
interface FingerprintNumberField {
	options?: {
		min?: number
		max?: number
	}
}
export interface Fingerprint {
	accounts?: {
		expiresAt?: FingerprintNumberField
		createdAt?: FingerprintDateField
		updatedAt?: FingerprintDateField
		user?: FingerprintRelationField
	}
	assignedRoles?: {
		linkedAt?: FingerprintDateField
		user?: FingerprintRelationField
		role?: FingerprintRelationField
	}
	attributes?: {
		createdAt?: FingerprintDateField
		updatedAt?: FingerprintDateField
		requiredSchema?: FingerprintRelationField
		t?: FingerprintRelationField
		parentAttributenestings?: FingerprintRelationField
		childAttributenestings?: FingerprintRelationField
		attributeSupplements?: FingerprintRelationField
		attributeToCategories?: FingerprintRelationField
		internalNotes?: FingerprintRelationField
		serviceCategoryDefaultAttributes?: FingerprintRelationField
		serviceTagDefaultAttributes?: FingerprintRelationField
	}
	attributeCategories?: {
		createdAt?: FingerprintDateField
		updatedAt?: FingerprintDateField
		translationNamespaceByNs?: FingerprintRelationField
		attributeToCategoriesByCategoryId?: FingerprintRelationField
		internalNotes?: FingerprintRelationField
	}
	attributeNestings?: {
		linkedAt?: FingerprintDateField
		child?: FingerprintRelationField
		parent?: FingerprintRelationField
	}
	attributeSupplements?: {
		data?: FingerprintJsonField
		createdAt?: FingerprintDateField
		updatedAt?: FingerprintDateField
		attribute?: FingerprintRelationField
		country?: FingerprintRelationField
		text?: FingerprintRelationField
		govDist?: FingerprintRelationField
		language?: FingerprintRelationField
		location?: FingerprintRelationField
		service?: FingerprintRelationField
		organization?: FingerprintRelationField
		user?: FingerprintRelationField
		internalNotes?: FingerprintRelationField
	}
	attributeSupplementDataSchemas?: {
		definition?: FingerprintJsonField
		createdAt?: FingerprintDateField
		updatedAt?: FingerprintDateField
		attributesByRequiredSchemaId?: FingerprintRelationField
		internalNotes?: FingerprintRelationField
	}
	attributeToCategories?: {
		linkedAt?: FingerprintDateField
		attribute?: FingerprintRelationField
		category?: FingerprintRelationField
	}
	auditTrails?: {
		old?: FingerprintJsonField
		new?: FingerprintJsonField
		timestamp?: FingerprintDateField
	}
	countries?: {
		dialCode?: FingerprintNumberField
		createdAt?: FingerprintDateField
		updatedAt?: FingerprintDateField
		geoDatum?: FingerprintRelationField
		demonym?: FingerprintRelationField
		t?: FingerprintRelationField
		attributeSupplements?: FingerprintRelationField
		govDists?: FingerprintRelationField
		internalNotes?: FingerprintRelationField
		orgLocations?: FingerprintRelationField
		orgPhones?: FingerprintRelationField
		orgReviewsByLcrCountryId?: FingerprintRelationField
		serviceAreaCountries?: FingerprintRelationField
		serviceTagCountries?: FingerprintRelationField
		usersByCurrentCountryId?: FingerprintRelationField
		userSurveysByCountryOriginId?: FingerprintRelationField
		userSurveysByCurrentCountryId?: FingerprintRelationField
	}
	dataMigrations?: {
		appliedAt?: FingerprintDateField
	}
	fieldVisibilities?: {
		recordCreatedAt?: FingerprintDateField
		recordupdatedAt?: FingerprintDateField
		user?: FingerprintRelationField
	}
	freeTexts?: {
		createdAt?: FingerprintDateField
		updatedAt?: FingerprintDateField
		ke?: FingerprintRelationField
		attributeSupplementsByTextId?: FingerprintRelationField
		orgEmailsByDescriptionId?: FingerprintRelationField
		orgLocationsByDescriptionId?: FingerprintRelationField
		orgPhonesByDescriptionId?: FingerprintRelationField
		orgServicesByDescriptionId?: FingerprintRelationField
		orgServicesByServiceNameId?: FingerprintRelationField
		orgWebsitesByDescriptionId?: FingerprintRelationField
		organizationsByDescriptionId?: FingerprintRelationField
	}
	geoData?: {
		adminLevel?: FingerprintNumberField
		countriesByGeoDataId?: FingerprintRelationField
		govDistsByGeoDataId?: FingerprintRelationField
	}
	govDists?: {
		createdAt?: FingerprintDateField
		updatedAt?: FingerprintDateField
		country?: FingerprintRelationField
		geoDatum?: FingerprintRelationField
		childGovdists?: FingerprintRelationField
		govDistType?: FingerprintRelationField
		t?: FingerprintRelationField
		attributeSupplements?: FingerprintRelationField
		childGovdists?: FingerprintRelationField
		internalNotes?: FingerprintRelationField
		orgLocations?: FingerprintRelationField
		orgReviewsByLcrGovDistId?: FingerprintRelationField
		serviceAreaDists?: FingerprintRelationField
		usersByCurrentGovDistId?: FingerprintRelationField
		userSurveysByCurrentGovDistId?: FingerprintRelationField
	}
	govDistTypes?: {
		createdAt?: FingerprintDateField
		updatedAt?: FingerprintDateField
		t?: FingerprintRelationField
		govDists?: FingerprintRelationField
		internalNotes?: FingerprintRelationField
	}
	internalNotes?: {
		createdAt?: FingerprintDateField
		updatedAt?: FingerprintDateField
		attribute?: FingerprintRelationField
		attributeCategory?: FingerprintRelationField
		attributeSupplement?: FingerprintRelationField
		attributeSupplementDataSchema?: FingerprintRelationField
		country?: FingerprintRelationField
		govDist?: FingerprintRelationField
		govDistType?: FingerprintRelationField
		language?: FingerprintRelationField
		orgEmail?: FingerprintRelationField
		orgHour?: FingerprintRelationField
		orgLocation?: FingerprintRelationField
		orgPhone?: FingerprintRelationField
		orgPhoto?: FingerprintRelationField
		orgReview?: FingerprintRelationField
		orgService?: FingerprintRelationField
		orgSocialMedium?: FingerprintRelationField
		orgWebsite?: FingerprintRelationField
		organization?: FingerprintRelationField
		outsideApi?: FingerprintRelationField
		outsideAPIService?: FingerprintRelationField
		permission?: FingerprintRelationField
		phoneType?: FingerprintRelationField
		serviceCategory?: FingerprintRelationField
		serviceTag?: FingerprintRelationField
		socialMediaLink?: FingerprintRelationField
		socialMediaService?: FingerprintRelationField
		source?: FingerprintRelationField
		suggestion?: FingerprintRelationField
		translation?: FingerprintRelationField
		translationNamespace?: FingerprintRelationField
	}
	languages?: {
		createdAt?: FingerprintDateField
		updatedAt?: FingerprintDateField
		defaultSort?: FingerprintNumberField
		attributeSupplements?: FingerprintRelationField
		internalNotes?: FingerprintRelationField
		orgPhoneLanguages?: FingerprintRelationField
		orgReviewsByLangId?: FingerprintRelationField
		orgWebsiteLanguages?: FingerprintRelationField
		translatedReviews?: FingerprintRelationField
		usersByLangPrefId?: FingerprintRelationField
	}
	listSharedWiths?: {
		linkedAt?: FingerprintDateField
		user?: FingerprintRelationField
		list?: FingerprintRelationField
	}
	locationPermissions?: {
		createdAt?: FingerprintDateField
		updatedAt?: FingerprintDateField
		orgLocation?: FingerprintRelationField
		permission?: FingerprintRelationField
		user?: FingerprintRelationField
	}
	orgEmails?: {
		createdAt?: FingerprintDateField
		updatedAt?: FingerprintDateField
		description?: FingerprintRelationField
		title?: FingerprintRelationField
		internalNotes?: FingerprintRelationField
		orgLocationEmails?: FingerprintRelationField
		orgServiceEmails?: FingerprintRelationField
		organizationEmails?: FingerprintRelationField
		userToOrganizations?: FingerprintRelationField
	}
	orgHours?: {
		dayIndex?: FingerprintNumberField
		createdAt?: FingerprintDateField
		updatedAt?: FingerprintDateField
		interval?: FingerprintJsonField
		orgLoc?: FingerprintRelationField
		orgService?: FingerprintRelationField
		organization?: FingerprintRelationField
		internalNotesByOrgHoursId?: FingerprintRelationField
	}
	orgLocations?: {
		longitude?: FingerprintNumberField
		latitude?: FingerprintNumberField
		geoJSON?: FingerprintJsonField
		createdAt?: FingerprintDateField
		updatedAt?: FingerprintDateField
		country?: FingerprintRelationField
		description?: FingerprintRelationField
		govDist?: FingerprintRelationField
		org?: FingerprintRelationField
		attributeSupplementsByLocationId?: FingerprintRelationField
		internalNotes?: FingerprintRelationField
		locationPermissions?: FingerprintRelationField
		orgHoursByOrgLocId?: FingerprintRelationField
		orgLocationEmails?: FingerprintRelationField
		orgLocationPhones?: FingerprintRelationField
		orgLocationServices?: FingerprintRelationField
		orgLocationSocialMedia?: FingerprintRelationField
		orgLocationWebsites?: FingerprintRelationField
		orgPhotos?: FingerprintRelationField
		orgReviews?: FingerprintRelationField
		outsideAPIs?: FingerprintRelationField
		serviceAreas?: FingerprintRelationField
	}
	orgLocationEmails?: {
		linkedAt?: FingerprintDateField
		orgEmail?: FingerprintRelationField
		orgLocation?: FingerprintRelationField
	}
	orgLocationPhones?: {
		linkedAt?: FingerprintDateField
		orgLocation?: FingerprintRelationField
		phone?: FingerprintRelationField
	}
	orgLocationServices?: {
		linkedAt?: FingerprintDateField
		orgLocation?: FingerprintRelationField
		service?: FingerprintRelationField
	}
	orgLocationSocialMedia?: {
		linkedAt?: FingerprintDateField
		orgLocation?: FingerprintRelationField
		socialMedium?: FingerprintRelationField
	}
	orgLocationWebsites?: {
		linkedAt?: FingerprintDateField
		orgLocation?: FingerprintRelationField
		orgWebsite?: FingerprintRelationField
	}
	orgPhones?: {
		createdAt?: FingerprintDateField
		updatedAt?: FingerprintDateField
		country?: FingerprintRelationField
		description?: FingerprintRelationField
		phoneType?: FingerprintRelationField
		internalNotes?: FingerprintRelationField
		orgLocationPhonesByPhoneId?: FingerprintRelationField
		orgPhoneLanguages?: FingerprintRelationField
		orgServicePhones?: FingerprintRelationField
		organizationPhonesByPhoneId?: FingerprintRelationField
		userToOrganizations?: FingerprintRelationField
	}
	orgPhoneLanguages?: {
		linkedAt?: FingerprintDateField
		language?: FingerprintRelationField
		orgPhone?: FingerprintRelationField
	}
	orgPhotos?: {
		height?: FingerprintNumberField
		width?: FingerprintNumberField
		createdAt?: FingerprintDateField
		updatedAt?: FingerprintDateField
		orgLocation?: FingerprintRelationField
		org?: FingerprintRelationField
		internalNotes?: FingerprintRelationField
	}
	orgReviews?: {
		rating?: FingerprintNumberField
		langConfidence?: FingerprintNumberField
		toxicity?: FingerprintNumberField
		createdAt?: FingerprintDateField
		updatedAt?: FingerprintDateField
		lcrCountry?: FingerprintRelationField
		lcrGovDist?: FingerprintRelationField
		lang?: FingerprintRelationField
		orgLocation?: FingerprintRelationField
		orgService?: FingerprintRelationField
		organization?: FingerprintRelationField
		user?: FingerprintRelationField
		internalNotes?: FingerprintRelationField
		translatedReviewsByReviewId?: FingerprintRelationField
	}
	orgServices?: {
		createdAt?: FingerprintDateField
		updatedAt?: FingerprintDateField
		description?: FingerprintRelationField
		serviceName?: FingerprintRelationField
		organization?: FingerprintRelationField
		attributeSupplementsByServiceId?: FingerprintRelationField
		internalNotes?: FingerprintRelationField
		orgHours?: FingerprintRelationField
		orgLocationServicesByServiceId?: FingerprintRelationField
		orgReviews?: FingerprintRelationField
		orgServiceEmailsByServiceId?: FingerprintRelationField
		orgServicePhonesByServiceId?: FingerprintRelationField
		orgServiceTagsByServiceId?: FingerprintRelationField
		orgServiceWebsitesByServiceId?: FingerprintRelationField
		savedServicesByServiceId?: FingerprintRelationField
		serviceAreas?: FingerprintRelationField
	}
	orgServiceEmails?: {
		linkedAt?: FingerprintDateField
		orgEmail?: FingerprintRelationField
		service?: FingerprintRelationField
	}
	orgServicePhones?: {
		linkedAt?: FingerprintDateField
		orgPhone?: FingerprintRelationField
		service?: FingerprintRelationField
	}
	orgServiceTags?: {
		linkedAt?: FingerprintDateField
		service?: FingerprintRelationField
		tag?: FingerprintRelationField
	}
	orgServiceWebsites?: {
		linkedAt?: FingerprintDateField
		service?: FingerprintRelationField
		orgWebsite?: FingerprintRelationField
	}
	orgSocialMedia?: {
		createdAt?: FingerprintDateField
		updatedAt?: FingerprintDateField
		organization?: FingerprintRelationField
		service?: FingerprintRelationField
		internalNotesByOrgSocialMediaId?: FingerprintRelationField
		orgLocationSocialMediaBySocialMediaId?: FingerprintRelationField
	}
	orgWebsites?: {
		createdAt?: FingerprintDateField
		updatedAt?: FingerprintDateField
		description?: FingerprintRelationField
		organization?: FingerprintRelationField
		internalNotes?: FingerprintRelationField
		orgLocationWebsites?: FingerprintRelationField
		orgServiceWebsites?: FingerprintRelationField
		orgWebsiteLanguages?: FingerprintRelationField
	}
	orgWebsiteLanguages?: {
		linkedAt?: FingerprintDateField
		language?: FingerprintRelationField
		orgWebsite?: FingerprintRelationField
	}
	organizations?: {
		lastVerified?: FingerprintDateField
		createdAt?: FingerprintDateField
		updatedAt?: FingerprintDateField
		crisisResourceSort?: FingerprintNumberField
		description?: FingerprintRelationField
		source?: FingerprintRelationField
		attributeSupplements?: FingerprintRelationField
		internalNotes?: FingerprintRelationField
		orgHours?: FingerprintRelationField
		orgLocationsByOrgId?: FingerprintRelationField
		orgPhotosByOrgId?: FingerprintRelationField
		orgReviews?: FingerprintRelationField
		orgServices?: FingerprintRelationField
		orgSocialMedia?: FingerprintRelationField
		orgWebsites?: FingerprintRelationField
		organizationEmails?: FingerprintRelationField
		organizationPermissions?: FingerprintRelationField
		organizationPhones?: FingerprintRelationField
		outsideAPIs?: FingerprintRelationField
		savedOrganizations?: FingerprintRelationField
		serviceAreas?: FingerprintRelationField
		slugRedirectsByOrgId?: FingerprintRelationField
		suggestions?: FingerprintRelationField
		userToOrganizations?: FingerprintRelationField
	}
	organizationEmails?: {
		linkedAt?: FingerprintDateField
		orgEmail?: FingerprintRelationField
		organization?: FingerprintRelationField
	}
	organizationPermissions?: {
		linkedAt?: FingerprintDateField
		createdAt?: FingerprintDateField
		updatedAt?: FingerprintDateField
		organization?: FingerprintRelationField
		permission?: FingerprintRelationField
		user?: FingerprintRelationField
	}
	organizationPhones?: {
		linkedAt?: FingerprintDateField
		phone?: FingerprintRelationField
		organization?: FingerprintRelationField
	}
	outsideAPIs?: {
		createdAt?: FingerprintDateField
		updatedAt?: FingerprintDateField
		orgLocation?: FingerprintRelationField
		organization?: FingerprintRelationField
		outsideAPIServiceByServiceName?: FingerprintRelationField
		internalNotesByOutsideApiId?: FingerprintRelationField
	}
	outsideAPIServices?: {
		createdAt?: FingerprintDateField
		updatedAt?: FingerprintDateField
		internalNotes?: FingerprintRelationField
		outsideAPIsByServiceName?: FingerprintRelationField
	}
	permissions?: {
		createdAt?: FingerprintDateField
		updatedAt?: FingerprintDateField
		internalNotes?: FingerprintRelationField
		locationPermissions?: FingerprintRelationField
		organizationPermissions?: FingerprintRelationField
		rolePermissions?: FingerprintRelationField
		userPermissions?: FingerprintRelationField
	}
	phoneTypes?: {
		createdAt?: FingerprintDateField
		updatedAt?: FingerprintDateField
		t?: FingerprintRelationField
		internalNotes?: FingerprintRelationField
		orgPhones?: FingerprintRelationField
	}
	rolePermissions?: {
		linkedAt?: FingerprintDateField
		permission?: FingerprintRelationField
		role?: FingerprintRelationField
	}
	savedOrganizations?: {
		linkedAt?: FingerprintDateField
		organization?: FingerprintRelationField
		list?: FingerprintRelationField
	}
	savedServices?: {
		linkedAt?: FingerprintDateField
		service?: FingerprintRelationField
		list?: FingerprintRelationField
	}
	serviceAreas?: {
		createdAt?: FingerprintDateField
		updatedAt?: FingerprintDateField
		orgLocation?: FingerprintRelationField
		orgService?: FingerprintRelationField
		organization?: FingerprintRelationField
		serviceAreaCountries?: FingerprintRelationField
		serviceAreaDists?: FingerprintRelationField
	}
	serviceAreaCountries?: {
		linkedAt?: FingerprintDateField
		country?: FingerprintRelationField
		serviceArea?: FingerprintRelationField
	}
	serviceAreaDists?: {
		linkedAt?: FingerprintDateField
		govDist?: FingerprintRelationField
		serviceArea?: FingerprintRelationField
	}
	serviceCategories?: {
		createdAt?: FingerprintDateField
		updatedAt?: FingerprintDateField
		t?: FingerprintRelationField
		internalNotes?: FingerprintRelationField
		serviceCategoryDefaultAttributesByCategoryId?: FingerprintRelationField
		serviceTagsByPrimaryCategoryId?: FingerprintRelationField
		serviceTagToCategoriesByCategoryId?: FingerprintRelationField
	}
	serviceCategoryDefaultAttributes?: {
		linkedAt?: FingerprintDateField
		attribute?: FingerprintRelationField
		category?: FingerprintRelationField
	}
	serviceTags?: {
		createdAt?: FingerprintDateField
		updatedAt?: FingerprintDateField
		primaryCategory?: FingerprintRelationField
		t?: FingerprintRelationField
		internalNotes?: FingerprintRelationField
		orgServiceTagsByTagId?: FingerprintRelationField
		serviceTagCountriesByServiceId?: FingerprintRelationField
		serviceTagDefaultAttributesByServiceId?: FingerprintRelationField
		parentServicetagnestings?: FingerprintRelationField
		childServicetagnestings?: FingerprintRelationField
		serviceTagToCategories?: FingerprintRelationField
	}
	serviceTagCountries?: {
		linkedAt?: FingerprintDateField
		country?: FingerprintRelationField
		service?: FingerprintRelationField
	}
	serviceTagDefaultAttributes?: {
		linkedAt?: FingerprintDateField
		attribute?: FingerprintRelationField
		service?: FingerprintRelationField
	}
	serviceTagNestings?: {
		linkedAt?: FingerprintDateField
		child?: FingerprintRelationField
		parent?: FingerprintRelationField
	}
	serviceTagToCategories?: {
		linkedAt?: FingerprintDateField
		category?: FingerprintRelationField
		serviceTag?: FingerprintRelationField
	}
	sessions?: {
		expires?: FingerprintDateField
		user?: FingerprintRelationField
	}
	slugRedirects?: {
		createdAt?: FingerprintDateField
		updatedAt?: FingerprintDateField
		org?: FingerprintRelationField
	}
	socialMediaLinks?: {
		createdAt?: FingerprintDateField
		updatedAt?: FingerprintDateField
		service?: FingerprintRelationField
		internalNotes?: FingerprintRelationField
	}
	socialMediaServices?: {
		createdAt?: FingerprintDateField
		updatedAt?: FingerprintDateField
		t?: FingerprintRelationField
		internalNotes?: FingerprintRelationField
		orgSocialMediaByServiceId?: FingerprintRelationField
		socialMediaLinksByServiceId?: FingerprintRelationField
	}
	sources?: {
		createdAt?: FingerprintDateField
		updatedAt?: FingerprintDateField
		internalNotes?: FingerprintRelationField
		organizations?: FingerprintRelationField
		users?: FingerprintRelationField
	}
	suggestions?: {
		data?: FingerprintJsonField
		createdAt?: FingerprintDateField
		updatedAt?: FingerprintDateField
		organization?: FingerprintRelationField
		internalNotes?: FingerprintRelationField
	}
	surveyCommunities?: {
		community?: FingerprintRelationField
		survey?: FingerprintRelationField
	}
	surveyEthnicities?: {
		ethnicity?: FingerprintRelationField
		survey?: FingerprintRelationField
	}
	surveySOGs?: {
		sog?: FingerprintRelationField
		survey?: FingerprintRelationField
	}
	translatedReviews?: {
		createdAt?: FingerprintDateField
		updatedAt?: FingerprintDateField
		language?: FingerprintRelationField
		review?: FingerprintRelationField
	}
	translationKeys?: {
		createdAt?: FingerprintDateField
		updatedAt?: FingerprintDateField
		crowdinId?: FingerprintNumberField
		interpolationValues?: FingerprintJsonField
		translationNamespaceByNs?: FingerprintRelationField
		attributesByTsKey?: FingerprintRelationField
		countriesByDemonymKey?: FingerprintRelationField
		countriesByTsKey?: FingerprintRelationField
		freeTexts?: FingerprintRelationField
		govDistsByTsKey?: FingerprintRelationField
		govDistTypesByTsKey?: FingerprintRelationField
		internalNotesByTranslationKey?: FingerprintRelationField
		phoneTypesByTsKey?: FingerprintRelationField
		serviceCategoriesByTsKey?: FingerprintRelationField
		serviceTagsByTsKey?: FingerprintRelationField
		socialMediaServicesByTsKey?: FingerprintRelationField
		userCommunitiesByTsKey?: FingerprintRelationField
		userEthnicitiesByTsKey?: FingerprintRelationField
		userImmigrationsByTsKey?: FingerprintRelationField
		userSOGIdentitiesByTsKey?: FingerprintRelationField
		userTitlesByTsKey?: FingerprintRelationField
		userTypesByTsKey?: FingerprintRelationField
	}
	translationNamespaces?: {
		createdAt?: FingerprintDateField
		updatedAt?: FingerprintDateField
		crowdinId?: FingerprintNumberField
		attributeCategoriesByNs?: FingerprintRelationField
		internalNotes?: FingerprintRelationField
		translationKeysByNs?: FingerprintRelationField
	}
	users?: {
		emailVerified?: FingerprintDateField
		migrateDate?: FingerprintDateField
		createdAt?: FingerprintDateField
		updatedAt?: FingerprintDateField
		signupData?: FingerprintJsonField
		currentCountry?: FingerprintRelationField
		currentGovDist?: FingerprintRelationField
		langPref?: FingerprintRelationField
		source?: FingerprintRelationField
		userType?: FingerprintRelationField
		accounts?: FingerprintRelationField
		assignedRoles?: FingerprintRelationField
		attributeSupplements?: FingerprintRelationField
		fieldVisibilities?: FingerprintRelationField
		listSharedWiths?: FingerprintRelationField
		locationPermissions?: FingerprintRelationField
		orgReviews?: FingerprintRelationField
		organizationPermissions?: FingerprintRelationField
		sessions?: FingerprintRelationField
		userCommunityLinks?: FingerprintRelationField
		userMailsByFromUserId?: FingerprintRelationField
		userMailsByToUserId?: FingerprintRelationField
		userPermissions?: FingerprintRelationField
		userSOGLinks?: FingerprintRelationField
		userSavedListsByOwnedById?: FingerprintRelationField
		userToOrganizations?: FingerprintRelationField
	}
	userCommunities?: {
		createdAt?: FingerprintDateField
		updatedAt?: FingerprintDateField
		t?: FingerprintRelationField
		surveyCommunitiesByCommunityId?: FingerprintRelationField
		userCommunityLinksByCommunityId?: FingerprintRelationField
	}
	userCommunityLinks?: {
		linkedAt?: FingerprintDateField
		user?: FingerprintRelationField
		community?: FingerprintRelationField
	}
	userEthnicities?: {
		createdAt?: FingerprintDateField
		updatedAt?: FingerprintDateField
		t?: FingerprintRelationField
		surveyEthnicitiesByEthnicityId?: FingerprintRelationField
	}
	userImmigrations?: {
		createdAt?: FingerprintDateField
		updatedAt?: FingerprintDateField
		t?: FingerprintRelationField
		userSurveysByImmigrationId?: FingerprintRelationField
	}
	userMails?: {
		createdAt?: FingerprintDateField
		updatedAt?: FingerprintDateField
		fromUser?: FingerprintRelationField
		toUser?: FingerprintRelationField
		userMailsByResponseToId?: FingerprintRelationField
		userMailsByResponseToId?: FingerprintRelationField
	}
	userPermissions?: {
		linkedAt?: FingerprintDateField
		permission?: FingerprintRelationField
		user?: FingerprintRelationField
	}
	userRoles?: {
		createdAt?: FingerprintDateField
		updatedAt?: FingerprintDateField
		assignedRolesByRoleId?: FingerprintRelationField
		rolePermissionsByRoleId?: FingerprintRelationField
	}
	userSOGIdentities?: {
		createdAt?: FingerprintDateField
		updatedAt?: FingerprintDateField
		t?: FingerprintRelationField
		surveySOGsBySogId?: FingerprintRelationField
		userSOGLinksBySogIdentityId?: FingerprintRelationField
	}
	userSOGLinks?: {
		linkedAt?: FingerprintDateField
		user?: FingerprintRelationField
		sogIdentity?: FingerprintRelationField
	}
	userSavedLists?: {
		createdAt?: FingerprintDateField
		updatedAt?: FingerprintDateField
		ownedBy?: FingerprintRelationField
		listSharedWithsByListId?: FingerprintRelationField
		savedOrganizationsByListId?: FingerprintRelationField
		savedServicesByListId?: FingerprintRelationField
	}
	userSurveys?: {
		birthYear?: FingerprintNumberField
		countryOrigin?: FingerprintRelationField
		currentCountry?: FingerprintRelationField
		currentGovDist?: FingerprintRelationField
		immigration?: FingerprintRelationField
		surveyCommunitiesBySurveyId?: FingerprintRelationField
		surveyEthnicitiesBySurveyId?: FingerprintRelationField
		surveySOGsBySurveyId?: FingerprintRelationField
	}
	userTitles?: {
		createdAt?: FingerprintDateField
		updatedAt?: FingerprintDateField
		t?: FingerprintRelationField
		orgEmailsByTitleId?: FingerprintRelationField
		userToOrganizationsByOrgTitleId?: FingerprintRelationField
	}
	userToOrganizations?: {
		linkedAt?: FingerprintDateField
		orgEmail?: FingerprintRelationField
		orgPhone?: FingerprintRelationField
		organization?: FingerprintRelationField
		user?: FingerprintRelationField
		orgTitle?: FingerprintRelationField
	}
	userTypes?: {
		createdAt?: FingerprintDateField
		updatedAt?: FingerprintDateField
		t?: FingerprintRelationField
		users?: FingerprintRelationField
	}
	verificationTokens?: {
		expires?: FingerprintDateField
	}
	PrismaMigrations?: {
		finishedAt?: FingerprintDateField
		rolledBackAt?: FingerprintDateField
		startedAt?: FingerprintDateField
		appliedStepsCount?: FingerprintNumberField
	}
	spatialRefSys?: {
		srid?: FingerprintNumberField
		authSrid?: FingerprintNumberField
	}
}
