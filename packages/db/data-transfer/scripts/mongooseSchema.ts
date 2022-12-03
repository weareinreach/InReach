export type MongooseOrganization = {
	alert_message: string
	alert_message_ES: string
	description: string
	description_ES: string
	emails: {
		email: string
		first_name: string
		is_primary: boolean
		last_name: string
		show_on_organization: boolean
		title: string
		title_ES: string
	}[]
	name: string
	name_ES: string
	is_published: boolean
	is_deleted: boolean
	locations: {
		address: string
		city: string
		city_ES: string
		country: string
		country_ES: string
		is_primary: boolean
		lat: string
		long: string
		name: string
		name_ES: string
		show_on_organization: boolean
		state: string
		state_ES: string
		unit: string
		zip_code: string
		geolocation: { type: string; coordinates: number[] }
	}[]

	notes_log: {
		note: string
		created_at: Date
	}[]
	owners: {
		email: string
		isApproved: boolean
		userId: string
	}[]
	phones: {
		digits: string
		is_primary: boolean
		phone_type: string
		phone_type_ES: string
		show_on_organization: boolean
	}[]
	photos: {
		src: string
		suffix: string
		foursquare_vendor_id: string
		width: number
		height: number
	}[]
	properties: Record<string, string>
	schedules: {
		monday_start: string
		monday_end: string
		tuesday_start: string
		tuesday_end: string
		wednesday_start: string
		wednesday_end: string
		thursday_start: string
		thursday_end: string
		friday_start: string
		friday_end: string
		saturday_start: string
		saturday_end: string
		sunday_start: string
		sunday_end: string
		name: string
		note: string
		timezone: string
	}[]
	services: [ServiceSchema]
	slug: string
	slug_ES: string
	social_media: { name: string; url: string }[]
	source: string
	verified_at: Date
	venue_id: string
	website: string
	website_ES: string
} & SchemaOptions

export type MongooseRating = {
	organizationId: string
	serviceId: string
	ratings: {
		created_at: Date
		rating: number
		source: string
		userId: string
	}[]
} & SchemaOptions

export type MongooseReview = {
	comment: string
	hasAccount: boolean
	hasLeftFeedbackBefore: boolean
	negativeReasons: string[]
	rating: number
	source: string
	isVerified: boolean
	is_deleted: boolean
} & SchemaOptions

export type MongooseSuggestion = {
	field: string
	organizationId: string
	serviceId: string
	userEmail: string
	value: string
} & SchemaOptions

export type MongooseUser = {
	age: string
	catalogType: 'lawyer' | 'provider' | 'seeker' | 'reviewer'
	currentLocation: string
	email: string
	ethnicityRace: string[]
	hash: string
	countryOfOrigin: string
	sogIdentity: string[]
	immigrationStatus: string
	isAdminDataManager: boolean
	isAdminDeveloper: boolean
	isDataManager: boolean
	isProfessional: boolean
	isReviewerApproved: boolean
	lists: {
		name: string
		items: { fetchable_id: string; orgId: string }[]
		visibility: 'private' | 'shared' | 'public'
		shared_with: {
			user_id: {
				$oid: string
			}
			email: string
		}[]
	}[]
	name: string
	orgId: string
	orgName: string
	orgPositionTitle: string
	orgType: string
	reasonForJoining: string
	reviewerQuestions: {
		verifyAnswer: boolean
		timeCommitAnswer: boolean
		specifiedTimeCommit: string
		auditAnswer: boolean
		suggestionsAnswer: boolean
		reviewsAnswer: boolean
		payAnswer: boolean
		specifiedOtherInfo: string
	}
	salt: string
} & SchemaOptions

type ServiceSchema = {
	created_at: Date
	updated_at: Date
	access_instructions: {
		access_value: string
		access_value_ES: string
		access_type: string
		instructions: string
		instructions_ES: string
	}[]
	description: string
	description_ES: string
	email_id: string
	is_published: boolean
	is_deleted: boolean
	location_id: string
	name: string
	name_ES: string
	notes_log: {
		note: string
		created_at: Date
	}[]
	phone_id: string
	properties: Record<string, string>
	schedule_id: string
	slug: string
	slug_ES: string
	tags: {
		canada: Record<string, string>
		mexico: Record<string, string>
		united_states: Record<string, string>
	}
}

type SchemaOptions = {
	timestamps: {
		createdAt: Date
		updatedAt: Date
	}
}
