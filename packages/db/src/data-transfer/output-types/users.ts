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

// Converts JSON strings to/from your types
// and asserts the results of JSON.parse at runtime
export class Convert {
	public static toUsersJSONCollection(json: string): UsersJSONCollection[] {
		return cast(JSON.parse(json), a(r('UsersJSONCollection')))
	}

	public static usersJSONCollectionToJson(value: UsersJSONCollection[]): string {
		return JSON.stringify(uncast(value, a(r('UsersJSONCollection'))), null, 2)
	}
}

function invalidValue(typ: any, val: any, key: any = ''): never {
	if (key) {
		throw Error(
			`Invalid value for key "${key}". Expected type ${JSON.stringify(typ)} but got ${JSON.stringify(val)}`
		)
	}
	throw Error(`Invalid value ${JSON.stringify(val)} for type ${JSON.stringify(typ)}`)
}

function jsonToJSProps(typ: any): any {
	if (typ.jsonToJS === undefined) {
		const map: any = {}
		typ.props.forEach((p: any) => (map[p.json] = { key: p.js, typ: p.typ }))
		typ.jsonToJS = map
	}
	return typ.jsonToJS
}

function jsToJSONProps(typ: any): any {
	if (typ.jsToJSON === undefined) {
		const map: any = {}
		typ.props.forEach((p: any) => (map[p.js] = { key: p.json, typ: p.typ }))
		typ.jsToJSON = map
	}
	return typ.jsToJSON
}

function transform(val: any, typ: any, getProps: any, key: any = ''): any {
	function transformPrimitive(typ: string, val: any): any {
		if (typeof typ === typeof val) return val
		return invalidValue(typ, val, key)
	}

	function transformUnion(typs: any[], val: any): any {
		// val must validate against one typ in typs
		const l = typs.length
		for (let i = 0; i < l; i++) {
			const typ = typs[i]
			try {
				return transform(val, typ, getProps)
			} catch (_) {}
		}
		return invalidValue(typs, val)
	}

	function transformEnum(cases: string[], val: any): any {
		if (cases.indexOf(val) !== -1) return val
		return invalidValue(cases, val)
	}

	function transformArray(typ: any, val: any): any {
		// val must be an array with no invalid elements
		if (!Array.isArray(val)) return invalidValue('array', val)
		return val.map((el) => transform(el, typ, getProps))
	}

	function transformDate(val: any): any {
		if (val === null) {
			return null
		}
		const d = new Date(val)
		if (isNaN(d.valueOf())) {
			return invalidValue('Date', val)
		}
		return d
	}

	function transformObject(props: { [k: string]: any }, additional: any, val: any): any {
		if (val === null || typeof val !== 'object' || Array.isArray(val)) {
			return invalidValue('object', val)
		}
		const result: any = {}
		Object.getOwnPropertyNames(props).forEach((key) => {
			const prop = props[key]
			const v = Object.prototype.hasOwnProperty.call(val, key) ? val[key] : undefined
			result[prop.key] = transform(v, prop.typ, getProps, prop.key)
		})
		Object.getOwnPropertyNames(val).forEach((key) => {
			if (!Object.prototype.hasOwnProperty.call(props, key)) {
				result[key] = transform(val[key], additional, getProps, key)
			}
		})
		return result
	}

	if (typ === 'any') return val
	if (typ === null) {
		if (val === null) return val
		return invalidValue(typ, val)
	}
	if (typ === false) return invalidValue(typ, val)
	while (typeof typ === 'object' && typ.ref !== undefined) {
		typ = typeMap[typ.ref]
	}
	if (Array.isArray(typ)) return transformEnum(typ, val)
	if (typeof typ === 'object') {
		return typ.hasOwnProperty('unionMembers')
			? transformUnion(typ.unionMembers, val)
			: typ.hasOwnProperty('arrayItems')
			? transformArray(typ.arrayItems, val)
			: typ.hasOwnProperty('props')
			? transformObject(getProps(typ), typ.additional, val)
			: invalidValue(typ, val)
	}
	// Numbers can be parsed by Date but shouldn't be.
	if (typ === Date && typeof val !== 'number') return transformDate(val)
	return transformPrimitive(typ, val)
}

function cast<T>(val: any, typ: any): T {
	return transform(val, typ, jsonToJSProps)
}

function uncast<T>(val: T, typ: any): any {
	return transform(val, typ, jsToJSONProps)
}

function a(typ: any) {
	return { arrayItems: typ }
}

function u(...typs: any[]) {
	return { unionMembers: typs }
}

function o(props: any[], additional: any) {
	return { props, additional }
}

function m(additional: any) {
	return { props: [], additional }
}

function r(name: string) {
	return { ref: name }
}

const typeMap: any = {
	UsersJSONCollection: o(
		[
			{ json: '_id', js: '_id', typ: r('ID') },
			{ json: 'favorites', js: 'favorites', typ: u(undefined, a('any')) },
			{ json: 'isAdminDataManager', js: 'isAdminDataManager', typ: true },
			{ json: 'isDataManager', js: 'isDataManager', typ: true },
			{ json: 'name', js: 'name', typ: '' },
			{ json: 'email', js: 'email', typ: '' },
			{ json: 'created_at', js: 'created_at', typ: r('AtedAt') },
			{ json: 'salt', js: 'salt', typ: '' },
			{ json: 'hash', js: 'hash', typ: '' },
			{ json: '__v', js: '__v', typ: 0 },
			{ json: 'updated_at', js: 'updated_at', typ: r('AtedAt') },
			{ json: 'age', js: 'age', typ: u(undefined, '') },
			{ json: 'currentLocation', js: 'currentLocation', typ: u(undefined, '') },
			{ json: 'ethnicityRace', js: 'ethnicityRace', typ: u(undefined, a('')) },
			{ json: 'isProfessional', js: 'isProfessional', typ: u(undefined, true) },
			{
				json: 'immigrationStatus',
				js: 'immigrationStatus',
				typ: u(undefined, u(a('any'), r('ImmigrationStatusEnum'))),
			},
			{ json: 'catalogType', js: 'catalogType', typ: u(undefined, r('CatalogType')) },
			{ json: 'lists', js: 'lists', typ: u(undefined, a(r('List'))) },
			{ json: 'isAdminDeveloper', js: 'isAdminDeveloper', typ: u(undefined, true) },
			{ json: 'sogIdentity', js: 'sogIdentity', typ: u(undefined, a('')) },
			{ json: 'orgType', js: 'orgType', typ: u(undefined, '') },
			{ json: 'countryOfOrigin', js: 'countryOfOrigin', typ: u(undefined, '') },
			{ json: 'orgName', js: 'orgName', typ: u(undefined, '') },
			{ json: 'orgPositionTitle', js: 'orgPositionTitle', typ: u(undefined, '') },
			{ json: 'reasonForJoining', js: 'reasonForJoining', typ: u(undefined, '') },
			{ json: 'isReviewerApproved', js: 'isReviewerApproved', typ: u(undefined, true) },
			{ json: 'reviewerQuestions', js: 'reviewerQuestions', typ: u(undefined, r('ReviewerQuestions')) },
		],
		false
	),
	ID: o([{ json: '$oid', js: '$oid', typ: '' }], false),
	AtedAt: o([{ json: '$date', js: '$date', typ: Date }], false),
	List: o(
		[
			{ json: '_id', js: '_id', typ: r('ID') },
			{ json: 'name', js: 'name', typ: '' },
			{ json: 'items', js: 'items', typ: a(r('Item')) },
			{ json: 'visibility', js: 'visibility', typ: u(undefined, r('Visibility')) },
			{ json: 'shared_with', js: 'shared_with', typ: u(undefined, a(r('SharedWith'))) },
		],
		false
	),
	Item: o(
		[
			{ json: '_id', js: '_id', typ: r('ID') },
			{ json: 'fetchable_id', js: 'fetchable_id', typ: '' },
			{ json: 'orgId', js: 'orgId', typ: u(undefined, u(null, '')) },
		],
		false
	),
	SharedWith: o(
		[
			{ json: '_id', js: '_id', typ: r('ID') },
			{ json: 'user_id', js: 'user_id', typ: null },
			{ json: 'email', js: 'email', typ: '' },
		],
		false
	),
	ReviewerQuestions: o(
		[
			{ json: 'auditAnswer', js: 'auditAnswer', typ: true },
			{ json: 'payAnswer', js: 'payAnswer', typ: true },
			{ json: 'reviewsAnswer', js: 'reviewsAnswer', typ: true },
			{ json: 'suggestionsAnswer', js: 'suggestionsAnswer', typ: true },
			{ json: 'timeCommitAnswer', js: 'timeCommitAnswer', typ: true },
			{ json: 'verifyAnswer', js: 'verifyAnswer', typ: true },
			{ json: 'specifiedTimeCommit', js: 'specifiedTimeCommit', typ: u(undefined, '') },
			{ json: 'specifiedOtherInfo', js: 'specifiedOtherInfo', typ: u(undefined, '') },
		],
		false
	),
	CatalogType: ['lawyer', 'provider', 'reviewer', 'seeker'],
	ImmigrationStatusEnum: [
		'asylum-seeker',
		'dreamer',
		'',
		'immigrant',
		'none',
		'prefer-not-to-say',
		'refugee',
	],
	Visibility: ['private', 'shared'],
}
