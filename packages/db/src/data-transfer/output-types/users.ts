/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

// To parse this data:
//
//   import { Convert } from "./file";
//
//   const usersJSONCollection = Convert.toUsersJSONCollection(json);
//
// These functions will throw an error if the JSON doesn't
// match the expected interface, even if the JSON is valid.

export interface UsersJSONCollection {
	_id: ID
	favorites?: any[]
	isAdminDataManager: boolean
	isDataManager: boolean
	name: string
	email: string
	created_at: AtedAt
	salt: string
	hash: string
	__v: number
	updated_at: AtedAt
	age?: string
	currentLocation?: string
	ethnicityRace?: string[]
	isProfessional?: boolean
	immigrationStatus?: any[] | ImmigrationStatusEnum
	catalogType?: CatalogType
	lists?: List[]
	isAdminDeveloper?: boolean
	sogIdentity?: string[]
	orgType?: string
	countryOfOrigin?: string
	orgName?: string
	orgPositionTitle?: string
	reasonForJoining?: string
	isReviewerApproved?: boolean
	reviewerQuestions?: ReviewerQuestions
}

export interface ID {
	$oid: string
}

export enum CatalogType {
	Lawyer = 'lawyer',
	Provider = 'provider',
	Reviewer = 'reviewer',
	Seeker = 'seeker',
}

export interface AtedAt {
	$date: Date
}

export enum ImmigrationStatusEnum {
	AsylumSeeker = 'asylum-seeker',
	Dreamer = 'dreamer',
	Empty = '',
	Immigrant = 'immigrant',
	None = 'none',
	PreferNotToSay = 'prefer-not-to-say',
	Refugee = 'refugee',
}

export interface List {
	_id: ID
	name: string
	items: Item[]
	visibility?: Visibility
	shared_with?: SharedWith[]
}

export interface Item {
	_id: ID
	fetchable_id: string
	orgId?: null | string
}

export interface SharedWith {
	_id: ID
	user_id: null
	email: string
}

export enum Visibility {
	Private = 'private',
	Shared = 'shared',
}

export interface ReviewerQuestions {
	auditAnswer: boolean
	payAnswer: boolean
	reviewsAnswer: boolean
	suggestionsAnswer: boolean
	timeCommitAnswer: boolean
	verifyAnswer: boolean
	specifiedTimeCommit?: string
	specifiedOtherInfo?: string
}
