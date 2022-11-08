/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

// To parse this data:
//
//   import { Convert } from "./file";
//
//   const organizationsJSONCollection = Convert.toOrganizationsJSONCollection(json);
//
// These functions will throw an error if the JSON doesn't
// match the expected interface, even if the JSON is valid.

export interface OrganizationsJSONCollection {
	_id: ID
	is_published: boolean
	description?: string
	name: string
	properties?: { [key: string]: string }
	slug: string
	verified_at?: EdAt | null
	website?: string
	emails: Email[]
	locations: Location[]
	phones: Phone[]
	schedules: Schedule[]
	services: Service[]
	source?: Source
	created_at: EdAt
	__v: number
	alert_message?: string
	updated_at: EdAt
	description_ES?: string
	website_ES?: string
	alert_message_ES?: string
	slug_ES?: string
	name_ES?: string
	owners?: Owner[]
	venue_id?: string
	photos?: Photo[]
	social_media?: SocialMedia[]
	is_deleted: boolean
	notes_log?: NotesLog[]
	adminEmails?: any[]
}

export interface ID {
	$oid: string
}

export interface EdAt {
	$date: Date
}

export interface Email {
	_id: ID
	email?: string
	first_name?: null | string
	is_primary?: boolean
	last_name?: null | string
	show_on_organization?: boolean
	title?: null | string
	title_ES?: string
	title_es?: EEs
}

export enum EEs {
	InitialValue = 'initial value',
}

export interface Location {
	geolocation: Geolocation
	_id: ID
	address?: string
	city?: string
	is_primary?: boolean
	lat?: string
	long?: string
	name?: string
	show_on_organization?: boolean
	state?: string
	unit?: string
	zip_code?: string
	country_ES?: CountryES
	state_ES?: string
	name_ES?: string
	country?: string
	city_ES?: string
}

export enum CountryES {
	Canada = 'Canada',
	Cdmx = 'CDMX',
	CountryESEEUU = 'EE.UU',
	CountryESEstadosUnidos = 'Estados Unidos ',
	CountryESLosEstadosUnidos = 'Los Estados Unidos ',
	CountryESMexico = 'Mexico ',
	CountryESMéxico = 'México ',
	CountryESUnitedStates = 'United States ',
	Cánada = 'Cánada',
	EeUu = 'EE.UU.',
	Eeuu = 'EEUU',
	Empty = '',
	EstadosUnidos = 'Estados Unidos',
	FluffyEstadosUnidos = 'Estados unidos',
	Georgetown = 'Georgetown',
	LosEEU = 'Los EEU ',
	LosEEUU = 'Los EEUU',
	LosEstadosUnidos = 'Los Estados Unidos',
	LossEEUU = 'Loss EEUU',
	Mexico = 'Mexico',
	Michoacán = 'Michoacán',
	México = 'México',
	NuevaYork = 'Nueva York',
	PurpleEstadosUnidos = 'Estados Unidos  ',
	PurpleMexico = 'mexico',
	UnitedStates = 'United States',
	Us = 'US',
	Usa = 'USA',
}

export interface Geolocation {
	coordinates: Coordinate[]
	type: Type
}

export interface Coordinate {
	$numberDecimal: string
}

export enum Type {
	Point = 'Point',
}

export interface NotesLog {
	_id: ID
	note: string
	created_at: EdAt
}

export interface Owner {
	_id: ID
	email: string
	isApproved: boolean
	userId: string
}

export interface Phone {
	_id: ID
	digits?: null | string
	is_primary?: boolean
	phone_type?: string
	show_on_organization?: boolean
	phone_type_ES?: string
	phone_type_es?: EEs
}

export interface Photo {
	src: string
	suffix: string
	foursquare_vendor_id: string
	width: number
	height: number
}

export interface Schedule {
	_id: ID
	monday_start?: string
	monday_end?: string
	tuesday_start?: string
	tuesday_end?: string
	wednesday_start?: string
	wednesday_end?: string
	thursday_start?: string
	thursday_end?: string
	friday_start?: string
	friday_end?: string
	saturday_start?: string
	saturday_end?: string
	sunday_start?: string
	sunday_end?: string
	timezone?: Timezone
	note?: string
	name?: string
}

export enum Timezone {
	AST = 'AST',
	Akst = 'AKST',
	Cdt = 'CDT',
	Cst = 'CST',
	Edt = 'EDT',
	Empty = '',
	Est = 'EST',
	Hst = 'HST',
	Mdt = 'MDT',
	Mst = 'MST',
	Nst = 'NST',
	Pdt = 'PDT',
	Pst = 'PST',
}

export interface Service {
	is_published: boolean
	is_deleted: boolean
	_id: ID
	tags?: Tags
	created_at: EdAt
	access_instructions: AccessInstruction[]
	description?: string
	email_id?: string
	location_id?: string
	name: string
	phone_id?: string
	properties?: { [key: string]: any[] | boolean | string }
	schedule_id?: string
	slug: string
	updated_at: EdAt
	name_ES?: string
	slug_ES?: string
	description_ES?: string
	notes_log?: NotesLog[]
}

export interface AccessInstruction {
	_id: ID
	access_value?: null | string
	access_type?: AccessType
	instructions?: string
	access_value_ES?: string
	instructions_ES?: string
}

export enum AccessType {
	Email = 'email',
	Empty = '',
	File = 'file',
	Link = 'link',
	Location = 'location',
	Other = 'other',
	Phone = 'phone',
}

export interface Tags {
	united_states?: UnitedStates
	canada?: Canada
	mexico?: Mexico
}

export interface Canada {
	'Mental Health'?: CanadaMentalHealth
	Legal?: CanadaLegal
	'Education and Employment'?: CanadaEducationAndEmployment
	'Hygiene and Clothing'?: CanadaHygieneAndClothing
	Food?: string
	'Community Support'?: CanadaCommunitySupport
	Medical?: CanadaMedical
	Housing?: CanadaHousing
	'Translation and Interpretation'?: string
	'Sports and Entertainment'?: string
	Transportation?: CanadaTransportation
	'Computers and Internet'?: string
	'Abortion Care'?: CanadaAbortionCare
}

export interface CanadaAbortionCare {
	'Abortion Providers'?: string
	'Mail Order Services'?: string
	'Mental Health Support'?: string
	'Financial Assistance'?: string
}

export interface CanadaCommunitySupport {
	'LGBTQ centres'?: string
	'Reception services'?: string
	'Cultural centres'?: string
	'Spiritual Support'?: string
}

export interface CanadaEducationAndEmployment {
	'Language classes'?: string
	Scholarships?: string
	'Career counseling'?: string
	'Educational support for LGBTQ youth'?: string
	Libraries?: string
}

export interface CanadaHousing {
	'Housing information and referrals'?: string
	'Short-term housing'?: string
	'Drop-in centres for LGBTQ youth'?: string
	'Emergency housing'?: string
}

export interface CanadaHygieneAndClothing {
	'Gender-affirming items'?: string
	'Gender-neutral washrooms'?: string
	Clothes?: string
	Hygiene?: string
	'Haircuts and stylists'?: string
}

export interface CanadaLegal {
	'Deportation or removal'?: string
	'Refugee claim'?: string
	'Immigration detention'?: string
	'Name and gender change'?: string
	'Crime and discrimination'?: string
	'Legal hotlines'?: string
}

export interface CanadaMedical {
	'HIV and sexual health'?: string
	'Trans health'?: string
	'Medical clinics'?: string
	'Physical evaluations for refugee claim'?: string
	'Dental care'?: string
	'OBGYN services'?: string
	'COVID-19 services'?: string
	'Trans Health - Hormone and Surgery Letters'?: string
	'Trans Health - Primary Care'?: string
	'Trans Health - Hormone Therapy'?: string
	'Trans Health - Gender Affirming Surgery'?: string
	'Trans Health - Speech Therapy'?: string
	'Physical evaluations for asylum claim'?: string
}

export interface CanadaMentalHealth {
	'Support groups'?: string
	'Trans support groups'?: string
	Hotlines?: string
	'Private therapy and counseling'?: string
	'Psychological evaluations for refugee claim'?: string
	'BIPOC support groups'?: string
	'Substance use'?: string
}

export interface CanadaTransportation {
	'Transportation assistance'?: string
	'Transit passes and discounts'?: string
}

export interface Mexico {
	'Mental Health'?: MexicoMentalHealth
	Food?: string
	'Hygiene and Clothing'?: MexicoHygieneAndClothing
	Medical?: MexicoMedical
	'Community Support'?: MexicoCommunitySupport
	Legal?: MexicoLegal
	Housing?: MexicoHousing
	'Sports and Entertainment'?: string
	'Education and Employment'?: CanadaEducationAndEmployment
	Transportation?: MexicoTransportation
	'Translation and Interpretation'?: string
	'Computers and Internet'?: string
	'Abortion Care'?: MexicoAbortionCare
	Comida?: string
}

export interface MexicoAbortionCare {
	'Abortion Providers': string
	'Mail Order Services'?: string
}

export interface MexicoCommunitySupport {
	'LGBTQ centers'?: string
	'Cultural centers'?: string
	'Spiritual Support'?: string
	Sponsors?: string
}

export interface MexicoHousing {
	'Housing information and referrals'?: string
	'Emergency housing'?: string
	'Drop-in centers for LGBTQ youth'?: string
}

export interface MexicoHygieneAndClothing {
	Hygiene?: string
	Clothes?: string
	'Gender-affirming items'?: string
	'Gender-neutral bathrooms'?: string
}

export interface MexicoLegal {
	'Asylum application in the US from Mexico'?: string
	'Asylum application in Mexico'?: string
	'Deportation or removal'?: string
	'Name and gender change'?: string
	'Immigration detention'?: string
	'Crime and discrimination'?: string
}

export interface MexicoMedical {
	'HIV and sexual health'?: string
	'OBGYN services'?: string
	'Trans health'?: string
	'Medical clinics'?: string
	'COVID-19 services'?: string
	'Dental care'?: string
	'Physical evaluations for refugee claim'?: string
	'Physical evaluations for asylum claim'?: string
}

export interface MexicoMentalHealth {
	'Trans support groups'?: string
	'Support groups'?: string
	Hotlines?: string
	'Private therapy and counseling'?: string
	'Support for conversion therapy survivors'?: string
	'Substance use'?: string
	'Psychological evaluations for asylum claim'?: string
	'BIPOC support groups'?: string
	'Support for caregivers of trans youth'?: string
}

export interface MexicoTransportation {
	'Transportation assistance': string
}

export interface UnitedStates {
	Medical?: CanadaMedical
	'Mental Health'?: MexicoMentalHealth
	Housing?: UnitedStatesHousing
	'Education and Employment'?: UnitedStatesEducationAndEmployment
	'Hygiene and Clothing'?: UnitedStatesHygieneAndClothing
	Food?: string
	Legal?: UnitedStatesLegal
	'Community Support'?: MexicoCommunitySupport
	'Computers and Internet'?: string
	'Sports and Entertainment'?: string
	'Translation and Interpretation'?: string
	Mail?: string
	Transportation?: CanadaTransportation
	'Translation/interpretation for healthcare'?: string
	'Translation/interpretation for legal services'?: string
	'Translation & interpretation'?: string
	'Abortion Care'?: UnitedStatesAbortionCare
	Deportation?: string
	'Immigration detention'?: string
	'Legal advice'?: string
}

export interface UnitedStatesAbortionCare {
	'Abortion Providers'?: string
	'Mail Order Services'?: string
	'Mental Health Support'?: string
	'Financial Assistance'?: string
	'Travel Assistance'?: string
	'Lodging Assistance'?: string
}

export interface UnitedStatesEducationAndEmployment {
	'Career counseling'?: string
	'Career counselling'?: string
	'Leadership training and professional development'?: string
	Scholarships?: string
	Libraries?: string
	'Educational support for LGBTQ youth'?: string
	'English classes'?: string
}

export interface UnitedStatesHousing {
	'Emergency housing'?: string
	'Housing information and referrals'?: string
	'Trans housing'?: string
	'Drop-in centers for LGBTQ youth'?: string
	'Short-term housing'?: string
}

export interface UnitedStatesHygieneAndClothing {
	Hygiene?: string
	Clothes?: string
	'Gender-neutral bathrooms'?: string
	'Gender-affirming items'?: string
	'Haircuts and stylists'?: string
	'Gender-affirming items '?: string
	Hygienee?: string
}

export interface UnitedStatesLegal {
	'Legal hotlines'?: string
	'Crime and discrimination'?: string
	'Name and gender change'?: string
	'Deportation or removal'?: string
	'Deferred Action for Childhood Arrivals (DACA)'?: string
	'Asylum application'?: string
	'Immigration detention'?: string
	'Special Immigrant Juvenile Status (SIJS)'?: string
	'Employment Authorization'?: string
	Citizenship?: string
	'U Visa'?: string
	Residency?: string
	'T Visa'?: string
	'Family Petitions'?: string
}

export interface SocialMedia {
	_id: ID
	name?: Name
	url: string
}

export enum Name {
	Facebook = 'facebook',
	Instagram = 'instagram',
	Twitter = 'twitter',
	Youtube = 'youtube',
}

export enum Source {
	OneDegree = 'OneDegree',
}

// Converts JSON strings to/from your types
// and asserts the results of JSON.parse at runtime
export class Convert {
	public static toOrganizationsJSONCollection(json: string): OrganizationsJSONCollection[] {
		return cast(JSON.parse(json), a(r('OrganizationsJSONCollection')))
	}

	public static organizationsJSONCollectionToJson(value: OrganizationsJSONCollection[]): string {
		return JSON.stringify(uncast(value, a(r('OrganizationsJSONCollection'))), null, 2)
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
	OrganizationsJSONCollection: o(
		[
			{ json: '_id', js: '_id', typ: r('ID') },
			{ json: 'is_published', js: 'is_published', typ: true },
			{ json: 'description', js: 'description', typ: u(undefined, '') },
			{ json: 'name', js: 'name', typ: '' },
			{ json: 'properties', js: 'properties', typ: u(undefined, m('')) },
			{ json: 'slug', js: 'slug', typ: '' },
			{ json: 'verified_at', js: 'verified_at', typ: u(undefined, u(r('EdAt'), null)) },
			{ json: 'website', js: 'website', typ: u(undefined, '') },
			{ json: 'emails', js: 'emails', typ: a(r('Email')) },
			{ json: 'locations', js: 'locations', typ: a(r('Location')) },
			{ json: 'phones', js: 'phones', typ: a(r('Phone')) },
			{ json: 'schedules', js: 'schedules', typ: a(r('Schedule')) },
			{ json: 'services', js: 'services', typ: a(r('Service')) },
			{ json: 'source', js: 'source', typ: u(undefined, r('Source')) },
			{ json: 'created_at', js: 'created_at', typ: r('EdAt') },
			{ json: '__v', js: '__v', typ: 0 },
			{ json: 'alert_message', js: 'alert_message', typ: u(undefined, '') },
			{ json: 'updated_at', js: 'updated_at', typ: r('EdAt') },
			{ json: 'description_ES', js: 'description_ES', typ: u(undefined, '') },
			{ json: 'website_ES', js: 'website_ES', typ: u(undefined, '') },
			{ json: 'alert_message_ES', js: 'alert_message_ES', typ: u(undefined, '') },
			{ json: 'slug_ES', js: 'slug_ES', typ: u(undefined, '') },
			{ json: 'name_ES', js: 'name_ES', typ: u(undefined, '') },
			{ json: 'owners', js: 'owners', typ: u(undefined, a(r('Owner'))) },
			{ json: 'venue_id', js: 'venue_id', typ: u(undefined, '') },
			{ json: 'photos', js: 'photos', typ: u(undefined, a(r('Photo'))) },
			{ json: 'social_media', js: 'social_media', typ: u(undefined, a(r('SocialMedia'))) },
			{ json: 'is_deleted', js: 'is_deleted', typ: true },
			{ json: 'notes_log', js: 'notes_log', typ: u(undefined, a(r('NotesLog'))) },
			{ json: 'adminEmails', js: 'adminEmails', typ: u(undefined, a('any')) },
		],
		false
	),
	ID: o([{ json: '$oid', js: '$oid', typ: '' }], false),
	EdAt: o([{ json: '$date', js: '$date', typ: Date }], false),
	Email: o(
		[
			{ json: '_id', js: '_id', typ: r('ID') },
			{ json: 'email', js: 'email', typ: u(undefined, '') },
			{ json: 'first_name', js: 'first_name', typ: u(undefined, u(null, '')) },
			{ json: 'is_primary', js: 'is_primary', typ: u(undefined, true) },
			{ json: 'last_name', js: 'last_name', typ: u(undefined, u(null, '')) },
			{ json: 'show_on_organization', js: 'show_on_organization', typ: u(undefined, true) },
			{ json: 'title', js: 'title', typ: u(undefined, u(null, '')) },
			{ json: 'title_ES', js: 'title_ES', typ: u(undefined, '') },
			{ json: 'title_es', js: 'title_es', typ: u(undefined, r('EEs')) },
		],
		false
	),
	Location: o(
		[
			{ json: 'geolocation', js: 'geolocation', typ: r('Geolocation') },
			{ json: '_id', js: '_id', typ: r('ID') },
			{ json: 'address', js: 'address', typ: u(undefined, '') },
			{ json: 'city', js: 'city', typ: u(undefined, '') },
			{ json: 'is_primary', js: 'is_primary', typ: u(undefined, true) },
			{ json: 'lat', js: 'lat', typ: u(undefined, '') },
			{ json: 'long', js: 'long', typ: u(undefined, '') },
			{ json: 'name', js: 'name', typ: u(undefined, '') },
			{ json: 'show_on_organization', js: 'show_on_organization', typ: u(undefined, true) },
			{ json: 'state', js: 'state', typ: u(undefined, '') },
			{ json: 'unit', js: 'unit', typ: u(undefined, '') },
			{ json: 'zip_code', js: 'zip_code', typ: u(undefined, '') },
			{ json: 'country_ES', js: 'country_ES', typ: u(undefined, r('CountryES')) },
			{ json: 'state_ES', js: 'state_ES', typ: u(undefined, '') },
			{ json: 'name_ES', js: 'name_ES', typ: u(undefined, '') },
			{ json: 'country', js: 'country', typ: u(undefined, '') },
			{ json: 'city_ES', js: 'city_ES', typ: u(undefined, '') },
		],
		false
	),
	Geolocation: o(
		[
			{ json: 'coordinates', js: 'coordinates', typ: a(r('Coordinate')) },
			{ json: 'type', js: 'type', typ: r('Type') },
		],
		false
	),
	Coordinate: o([{ json: '$numberDecimal', js: '$numberDecimal', typ: '' }], false),
	NotesLog: o(
		[
			{ json: '_id', js: '_id', typ: r('ID') },
			{ json: 'note', js: 'note', typ: '' },
			{ json: 'created_at', js: 'created_at', typ: r('EdAt') },
		],
		false
	),
	Owner: o(
		[
			{ json: '_id', js: '_id', typ: r('ID') },
			{ json: 'email', js: 'email', typ: '' },
			{ json: 'isApproved', js: 'isApproved', typ: true },
			{ json: 'userId', js: 'userId', typ: '' },
		],
		false
	),
	Phone: o(
		[
			{ json: '_id', js: '_id', typ: r('ID') },
			{ json: 'digits', js: 'digits', typ: u(undefined, u(null, '')) },
			{ json: 'is_primary', js: 'is_primary', typ: u(undefined, true) },
			{ json: 'phone_type', js: 'phone_type', typ: u(undefined, '') },
			{ json: 'show_on_organization', js: 'show_on_organization', typ: u(undefined, true) },
			{ json: 'phone_type_ES', js: 'phone_type_ES', typ: u(undefined, '') },
			{ json: 'phone_type_es', js: 'phone_type_es', typ: u(undefined, r('EEs')) },
		],
		false
	),
	Photo: o(
		[
			{ json: 'src', js: 'src', typ: '' },
			{ json: 'suffix', js: 'suffix', typ: '' },
			{ json: 'foursquare_vendor_id', js: 'foursquare_vendor_id', typ: '' },
			{ json: 'width', js: 'width', typ: 3.14 },
			{ json: 'height', js: 'height', typ: 3.14 },
		],
		false
	),
	Schedule: o(
		[
			{ json: '_id', js: '_id', typ: r('ID') },
			{ json: 'monday_start', js: 'monday_start', typ: u(undefined, '') },
			{ json: 'monday_end', js: 'monday_end', typ: u(undefined, '') },
			{ json: 'tuesday_start', js: 'tuesday_start', typ: u(undefined, '') },
			{ json: 'tuesday_end', js: 'tuesday_end', typ: u(undefined, '') },
			{ json: 'wednesday_start', js: 'wednesday_start', typ: u(undefined, '') },
			{ json: 'wednesday_end', js: 'wednesday_end', typ: u(undefined, '') },
			{ json: 'thursday_start', js: 'thursday_start', typ: u(undefined, '') },
			{ json: 'thursday_end', js: 'thursday_end', typ: u(undefined, '') },
			{ json: 'friday_start', js: 'friday_start', typ: u(undefined, '') },
			{ json: 'friday_end', js: 'friday_end', typ: u(undefined, '') },
			{ json: 'saturday_start', js: 'saturday_start', typ: u(undefined, '') },
			{ json: 'saturday_end', js: 'saturday_end', typ: u(undefined, '') },
			{ json: 'sunday_start', js: 'sunday_start', typ: u(undefined, '') },
			{ json: 'sunday_end', js: 'sunday_end', typ: u(undefined, '') },
			{ json: 'timezone', js: 'timezone', typ: u(undefined, r('Timezone')) },
			{ json: 'note', js: 'note', typ: u(undefined, '') },
			{ json: 'name', js: 'name', typ: u(undefined, '') },
		],
		false
	),
	Service: o(
		[
			{ json: 'is_published', js: 'is_published', typ: true },
			{ json: 'is_deleted', js: 'is_deleted', typ: true },
			{ json: '_id', js: '_id', typ: r('ID') },
			{ json: 'tags', js: 'tags', typ: u(undefined, r('Tags')) },
			{ json: 'created_at', js: 'created_at', typ: r('EdAt') },
			{ json: 'access_instructions', js: 'access_instructions', typ: a(r('AccessInstruction')) },
			{ json: 'description', js: 'description', typ: u(undefined, '') },
			{ json: 'email_id', js: 'email_id', typ: u(undefined, '') },
			{ json: 'location_id', js: 'location_id', typ: u(undefined, '') },
			{ json: 'name', js: 'name', typ: '' },
			{ json: 'phone_id', js: 'phone_id', typ: u(undefined, '') },
			{ json: 'properties', js: 'properties', typ: u(undefined, m(u(a('any'), true, ''))) },
			{ json: 'schedule_id', js: 'schedule_id', typ: u(undefined, '') },
			{ json: 'slug', js: 'slug', typ: '' },
			{ json: 'updated_at', js: 'updated_at', typ: r('EdAt') },
			{ json: 'name_ES', js: 'name_ES', typ: u(undefined, '') },
			{ json: 'slug_ES', js: 'slug_ES', typ: u(undefined, '') },
			{ json: 'description_ES', js: 'description_ES', typ: u(undefined, '') },
			{ json: 'notes_log', js: 'notes_log', typ: u(undefined, a(r('NotesLog'))) },
		],
		false
	),
	AccessInstruction: o(
		[
			{ json: '_id', js: '_id', typ: r('ID') },
			{ json: 'access_value', js: 'access_value', typ: u(undefined, u(null, '')) },
			{ json: 'access_type', js: 'access_type', typ: u(undefined, r('AccessType')) },
			{ json: 'instructions', js: 'instructions', typ: u(undefined, '') },
			{ json: 'access_value_ES', js: 'access_value_ES', typ: u(undefined, '') },
			{ json: 'instructions_ES', js: 'instructions_ES', typ: u(undefined, '') },
		],
		false
	),
	Tags: o(
		[
			{ json: 'united_states', js: 'united_states', typ: u(undefined, r('UnitedStates')) },
			{ json: 'canada', js: 'canada', typ: u(undefined, r('Canada')) },
			{ json: 'mexico', js: 'mexico', typ: u(undefined, r('Mexico')) },
		],
		false
	),
	Canada: o(
		[
			{ json: 'Mental Health', js: 'Mental Health', typ: u(undefined, r('CanadaMentalHealth')) },
			{ json: 'Legal', js: 'Legal', typ: u(undefined, r('CanadaLegal')) },
			{
				json: 'Education and Employment',
				js: 'Education and Employment',
				typ: u(undefined, r('CanadaEducationAndEmployment')),
			},
			{
				json: 'Hygiene and Clothing',
				js: 'Hygiene and Clothing',
				typ: u(undefined, r('CanadaHygieneAndClothing')),
			},
			{ json: 'Food', js: 'Food', typ: u(undefined, '') },
			{ json: 'Community Support', js: 'Community Support', typ: u(undefined, r('CanadaCommunitySupport')) },
			{ json: 'Medical', js: 'Medical', typ: u(undefined, r('CanadaMedical')) },
			{ json: 'Housing', js: 'Housing', typ: u(undefined, r('CanadaHousing')) },
			{ json: 'Translation and Interpretation', js: 'Translation and Interpretation', typ: u(undefined, '') },
			{ json: 'Sports and Entertainment', js: 'Sports and Entertainment', typ: u(undefined, '') },
			{ json: 'Transportation', js: 'Transportation', typ: u(undefined, r('CanadaTransportation')) },
			{ json: 'Computers and Internet', js: 'Computers and Internet', typ: u(undefined, '') },
			{ json: 'Abortion Care', js: 'Abortion Care', typ: u(undefined, r('CanadaAbortionCare')) },
		],
		false
	),
	CanadaAbortionCare: o(
		[
			{ json: 'Abortion Providers', js: 'Abortion Providers', typ: u(undefined, '') },
			{ json: 'Mail Order Services', js: 'Mail Order Services', typ: u(undefined, '') },
			{ json: 'Mental Health Support', js: 'Mental Health Support', typ: u(undefined, '') },
			{ json: 'Financial Assistance', js: 'Financial Assistance', typ: u(undefined, '') },
		],
		false
	),
	CanadaCommunitySupport: o(
		[
			{ json: 'LGBTQ centres', js: 'LGBTQ centres', typ: u(undefined, '') },
			{ json: 'Reception services', js: 'Reception services', typ: u(undefined, '') },
			{ json: 'Cultural centres', js: 'Cultural centres', typ: u(undefined, '') },
			{ json: 'Spiritual Support', js: 'Spiritual Support', typ: u(undefined, '') },
		],
		false
	),
	CanadaEducationAndEmployment: o(
		[
			{ json: 'Language classes', js: 'Language classes', typ: u(undefined, '') },
			{ json: 'Scholarships', js: 'Scholarships', typ: u(undefined, '') },
			{ json: 'Career counseling', js: 'Career counseling', typ: u(undefined, '') },
			{
				json: 'Educational support for LGBTQ youth',
				js: 'Educational support for LGBTQ youth',
				typ: u(undefined, ''),
			},
			{ json: 'Libraries', js: 'Libraries', typ: u(undefined, '') },
		],
		false
	),
	CanadaHousing: o(
		[
			{
				json: 'Housing information and referrals',
				js: 'Housing information and referrals',
				typ: u(undefined, ''),
			},
			{ json: 'Short-term housing', js: 'Short-term housing', typ: u(undefined, '') },
			{
				json: 'Drop-in centres for LGBTQ youth',
				js: 'Drop-in centres for LGBTQ youth',
				typ: u(undefined, ''),
			},
			{ json: 'Emergency housing', js: 'Emergency housing', typ: u(undefined, '') },
		],
		false
	),
	CanadaHygieneAndClothing: o(
		[
			{ json: 'Gender-affirming items', js: 'Gender-affirming items', typ: u(undefined, '') },
			{ json: 'Gender-neutral washrooms', js: 'Gender-neutral washrooms', typ: u(undefined, '') },
			{ json: 'Clothes', js: 'Clothes', typ: u(undefined, '') },
			{ json: 'Hygiene', js: 'Hygiene', typ: u(undefined, '') },
			{ json: 'Haircuts and stylists', js: 'Haircuts and stylists', typ: u(undefined, '') },
		],
		false
	),
	CanadaLegal: o(
		[
			{ json: 'Deportation or removal', js: 'Deportation or removal', typ: u(undefined, '') },
			{ json: 'Refugee claim', js: 'Refugee claim', typ: u(undefined, '') },
			{ json: 'Immigration detention', js: 'Immigration detention', typ: u(undefined, '') },
			{ json: 'Name and gender change', js: 'Name and gender change', typ: u(undefined, '') },
			{ json: 'Crime and discrimination', js: 'Crime and discrimination', typ: u(undefined, '') },
			{ json: 'Legal hotlines', js: 'Legal hotlines', typ: u(undefined, '') },
		],
		false
	),
	CanadaMedical: o(
		[
			{ json: 'HIV and sexual health', js: 'HIV and sexual health', typ: u(undefined, '') },
			{ json: 'Trans health', js: 'Trans health', typ: u(undefined, '') },
			{ json: 'Medical clinics', js: 'Medical clinics', typ: u(undefined, '') },
			{
				json: 'Physical evaluations for refugee claim',
				js: 'Physical evaluations for refugee claim',
				typ: u(undefined, ''),
			},
			{ json: 'Dental care', js: 'Dental care', typ: u(undefined, '') },
			{ json: 'OBGYN services', js: 'OBGYN services', typ: u(undefined, '') },
			{ json: 'COVID-19 services', js: 'COVID-19 services', typ: u(undefined, '') },
			{
				json: 'Trans Health - Hormone and Surgery Letters',
				js: 'Trans Health - Hormone and Surgery Letters',
				typ: u(undefined, ''),
			},
			{ json: 'Trans Health - Primary Care', js: 'Trans Health - Primary Care', typ: u(undefined, '') },
			{ json: 'Trans Health - Hormone Therapy', js: 'Trans Health - Hormone Therapy', typ: u(undefined, '') },
			{
				json: 'Trans Health - Gender Affirming Surgery',
				js: 'Trans Health - Gender Affirming Surgery',
				typ: u(undefined, ''),
			},
			{ json: 'Trans Health - Speech Therapy', js: 'Trans Health - Speech Therapy', typ: u(undefined, '') },
			{
				json: 'Physical evaluations for asylum claim',
				js: 'Physical evaluations for asylum claim',
				typ: u(undefined, ''),
			},
		],
		false
	),
	CanadaMentalHealth: o(
		[
			{ json: 'Support groups', js: 'Support groups', typ: u(undefined, '') },
			{ json: 'Trans support groups', js: 'Trans support groups', typ: u(undefined, '') },
			{ json: 'Hotlines', js: 'Hotlines', typ: u(undefined, '') },
			{ json: 'Private therapy and counseling', js: 'Private therapy and counseling', typ: u(undefined, '') },
			{
				json: 'Psychological evaluations for refugee claim',
				js: 'Psychological evaluations for refugee claim',
				typ: u(undefined, ''),
			},
			{ json: 'BIPOC support groups', js: 'BIPOC support groups', typ: u(undefined, '') },
			{ json: 'Substance use', js: 'Substance use', typ: u(undefined, '') },
		],
		false
	),
	CanadaTransportation: o(
		[
			{ json: 'Transportation assistance', js: 'Transportation assistance', typ: u(undefined, '') },
			{ json: 'Transit passes and discounts', js: 'Transit passes and discounts', typ: u(undefined, '') },
		],
		false
	),
	Mexico: o(
		[
			{ json: 'Mental Health', js: 'Mental Health', typ: u(undefined, r('MexicoMentalHealth')) },
			{ json: 'Food', js: 'Food', typ: u(undefined, '') },
			{
				json: 'Hygiene and Clothing',
				js: 'Hygiene and Clothing',
				typ: u(undefined, r('MexicoHygieneAndClothing')),
			},
			{ json: 'Medical', js: 'Medical', typ: u(undefined, r('MexicoMedical')) },
			{ json: 'Community Support', js: 'Community Support', typ: u(undefined, r('MexicoCommunitySupport')) },
			{ json: 'Legal', js: 'Legal', typ: u(undefined, r('MexicoLegal')) },
			{ json: 'Housing', js: 'Housing', typ: u(undefined, r('MexicoHousing')) },
			{ json: 'Sports and Entertainment', js: 'Sports and Entertainment', typ: u(undefined, '') },
			{
				json: 'Education and Employment',
				js: 'Education and Employment',
				typ: u(undefined, r('CanadaEducationAndEmployment')),
			},
			{ json: 'Transportation', js: 'Transportation', typ: u(undefined, r('MexicoTransportation')) },
			{ json: 'Translation and Interpretation', js: 'Translation and Interpretation', typ: u(undefined, '') },
			{ json: 'Computers and Internet', js: 'Computers and Internet', typ: u(undefined, '') },
			{ json: 'Abortion Care', js: 'Abortion Care', typ: u(undefined, r('MexicoAbortionCare')) },
			{ json: 'Comida', js: 'Comida', typ: u(undefined, '') },
		],
		false
	),
	MexicoAbortionCare: o(
		[
			{ json: 'Abortion Providers', js: 'Abortion Providers', typ: '' },
			{ json: 'Mail Order Services', js: 'Mail Order Services', typ: u(undefined, '') },
		],
		false
	),
	MexicoCommunitySupport: o(
		[
			{ json: 'LGBTQ centers', js: 'LGBTQ centers', typ: u(undefined, '') },
			{ json: 'Cultural centers', js: 'Cultural centers', typ: u(undefined, '') },
			{ json: 'Spiritual Support', js: 'Spiritual Support', typ: u(undefined, '') },
			{ json: 'Sponsors', js: 'Sponsors', typ: u(undefined, '') },
		],
		false
	),
	MexicoHousing: o(
		[
			{
				json: 'Housing information and referrals',
				js: 'Housing information and referrals',
				typ: u(undefined, ''),
			},
			{ json: 'Emergency housing', js: 'Emergency housing', typ: u(undefined, '') },
			{
				json: 'Drop-in centers for LGBTQ youth',
				js: 'Drop-in centers for LGBTQ youth',
				typ: u(undefined, ''),
			},
		],
		false
	),
	MexicoHygieneAndClothing: o(
		[
			{ json: 'Hygiene', js: 'Hygiene', typ: u(undefined, '') },
			{ json: 'Clothes', js: 'Clothes', typ: u(undefined, '') },
			{ json: 'Gender-affirming items', js: 'Gender-affirming items', typ: u(undefined, '') },
			{ json: 'Gender-neutral bathrooms', js: 'Gender-neutral bathrooms', typ: u(undefined, '') },
		],
		false
	),
	MexicoLegal: o(
		[
			{
				json: 'Asylum application in the US from Mexico',
				js: 'Asylum application in the US from Mexico',
				typ: u(undefined, ''),
			},
			{ json: 'Asylum application in Mexico', js: 'Asylum application in Mexico', typ: u(undefined, '') },
			{ json: 'Deportation or removal', js: 'Deportation or removal', typ: u(undefined, '') },
			{ json: 'Name and gender change', js: 'Name and gender change', typ: u(undefined, '') },
			{ json: 'Immigration detention', js: 'Immigration detention', typ: u(undefined, '') },
			{ json: 'Crime and discrimination', js: 'Crime and discrimination', typ: u(undefined, '') },
		],
		false
	),
	MexicoMedical: o(
		[
			{ json: 'HIV and sexual health', js: 'HIV and sexual health', typ: u(undefined, '') },
			{ json: 'OBGYN services', js: 'OBGYN services', typ: u(undefined, '') },
			{ json: 'Trans health', js: 'Trans health', typ: u(undefined, '') },
			{ json: 'Medical clinics', js: 'Medical clinics', typ: u(undefined, '') },
			{ json: 'COVID-19 services', js: 'COVID-19 services', typ: u(undefined, '') },
			{ json: 'Dental care', js: 'Dental care', typ: u(undefined, '') },
			{
				json: 'Physical evaluations for refugee claim',
				js: 'Physical evaluations for refugee claim',
				typ: u(undefined, ''),
			},
			{
				json: 'Physical evaluations for asylum claim',
				js: 'Physical evaluations for asylum claim',
				typ: u(undefined, ''),
			},
		],
		false
	),
	MexicoMentalHealth: o(
		[
			{ json: 'Trans support groups', js: 'Trans support groups', typ: u(undefined, '') },
			{ json: 'Support groups', js: 'Support groups', typ: u(undefined, '') },
			{ json: 'Hotlines', js: 'Hotlines', typ: u(undefined, '') },
			{ json: 'Private therapy and counseling', js: 'Private therapy and counseling', typ: u(undefined, '') },
			{
				json: 'Support for conversion therapy survivors',
				js: 'Support for conversion therapy survivors',
				typ: u(undefined, ''),
			},
			{ json: 'Substance use', js: 'Substance use', typ: u(undefined, '') },
			{
				json: 'Psychological evaluations for asylum claim',
				js: 'Psychological evaluations for asylum claim',
				typ: u(undefined, ''),
			},
			{ json: 'BIPOC support groups', js: 'BIPOC support groups', typ: u(undefined, '') },
			{
				json: 'Support for caregivers of trans youth',
				js: 'Support for caregivers of trans youth',
				typ: u(undefined, ''),
			},
		],
		false
	),
	MexicoTransportation: o(
		[{ json: 'Transportation assistance', js: 'Transportation assistance', typ: '' }],
		false
	),
	UnitedStates: o(
		[
			{ json: 'Medical', js: 'Medical', typ: u(undefined, r('CanadaMedical')) },
			{ json: 'Mental Health', js: 'Mental Health', typ: u(undefined, r('MexicoMentalHealth')) },
			{ json: 'Housing', js: 'Housing', typ: u(undefined, r('UnitedStatesHousing')) },
			{
				json: 'Education and Employment',
				js: 'Education and Employment',
				typ: u(undefined, r('UnitedStatesEducationAndEmployment')),
			},
			{
				json: 'Hygiene and Clothing',
				js: 'Hygiene and Clothing',
				typ: u(undefined, r('UnitedStatesHygieneAndClothing')),
			},
			{ json: 'Food', js: 'Food', typ: u(undefined, '') },
			{ json: 'Legal', js: 'Legal', typ: u(undefined, r('UnitedStatesLegal')) },
			{ json: 'Community Support', js: 'Community Support', typ: u(undefined, r('MexicoCommunitySupport')) },
			{ json: 'Computers and Internet', js: 'Computers and Internet', typ: u(undefined, '') },
			{ json: 'Sports and Entertainment', js: 'Sports and Entertainment', typ: u(undefined, '') },
			{ json: 'Translation and Interpretation', js: 'Translation and Interpretation', typ: u(undefined, '') },
			{ json: 'Mail', js: 'Mail', typ: u(undefined, '') },
			{ json: 'Transportation', js: 'Transportation', typ: u(undefined, r('CanadaTransportation')) },
			{
				json: 'Translation/interpretation for healthcare',
				js: 'Translation/interpretation for healthcare',
				typ: u(undefined, ''),
			},
			{
				json: 'Translation/interpretation for legal services',
				js: 'Translation/interpretation for legal services',
				typ: u(undefined, ''),
			},
			{ json: 'Translation & interpretation', js: 'Translation & interpretation', typ: u(undefined, '') },
			{ json: 'Abortion Care', js: 'Abortion Care', typ: u(undefined, r('UnitedStatesAbortionCare')) },
			{ json: 'Deportation', js: 'Deportation', typ: u(undefined, '') },
			{ json: 'Immigration detention', js: 'Immigration detention', typ: u(undefined, '') },
			{ json: 'Legal advice', js: 'Legal advice', typ: u(undefined, '') },
		],
		false
	),
	UnitedStatesAbortionCare: o(
		[
			{ json: 'Abortion Providers', js: 'Abortion Providers', typ: u(undefined, '') },
			{ json: 'Mail Order Services', js: 'Mail Order Services', typ: u(undefined, '') },
			{ json: 'Mental Health Support', js: 'Mental Health Support', typ: u(undefined, '') },
			{ json: 'Financial Assistance', js: 'Financial Assistance', typ: u(undefined, '') },
			{ json: 'Travel Assistance', js: 'Travel Assistance', typ: u(undefined, '') },
			{ json: 'Lodging Assistance', js: 'Lodging Assistance', typ: u(undefined, '') },
		],
		false
	),
	UnitedStatesEducationAndEmployment: o(
		[
			{ json: 'Career counseling', js: 'Career counseling', typ: u(undefined, '') },
			{ json: 'Career counselling', js: 'Career counselling', typ: u(undefined, '') },
			{
				json: 'Leadership training and professional development',
				js: 'Leadership training and professional development',
				typ: u(undefined, ''),
			},
			{ json: 'Scholarships', js: 'Scholarships', typ: u(undefined, '') },
			{ json: 'Libraries', js: 'Libraries', typ: u(undefined, '') },
			{
				json: 'Educational support for LGBTQ youth',
				js: 'Educational support for LGBTQ youth',
				typ: u(undefined, ''),
			},
			{ json: 'English classes', js: 'English classes', typ: u(undefined, '') },
		],
		false
	),
	UnitedStatesHousing: o(
		[
			{ json: 'Emergency housing', js: 'Emergency housing', typ: u(undefined, '') },
			{
				json: 'Housing information and referrals',
				js: 'Housing information and referrals',
				typ: u(undefined, ''),
			},
			{ json: 'Trans housing', js: 'Trans housing', typ: u(undefined, '') },
			{
				json: 'Drop-in centers for LGBTQ youth',
				js: 'Drop-in centers for LGBTQ youth',
				typ: u(undefined, ''),
			},
			{ json: 'Short-term housing', js: 'Short-term housing', typ: u(undefined, '') },
		],
		false
	),
	UnitedStatesHygieneAndClothing: o(
		[
			{ json: 'Hygiene', js: 'Hygiene', typ: u(undefined, '') },
			{ json: 'Clothes', js: 'Clothes', typ: u(undefined, '') },
			{ json: 'Gender-neutral bathrooms', js: 'Gender-neutral bathrooms', typ: u(undefined, '') },
			{ json: 'Gender-affirming items', js: 'Gender-affirming items', typ: u(undefined, '') },
			{ json: 'Haircuts and stylists', js: 'Haircuts and stylists', typ: u(undefined, '') },
			{ json: 'Gender-affirming items ', js: 'Gender-affirming items ', typ: u(undefined, '') },
			{ json: 'Hygienee', js: 'Hygienee', typ: u(undefined, '') },
		],
		false
	),
	UnitedStatesLegal: o(
		[
			{ json: 'Legal hotlines', js: 'Legal hotlines', typ: u(undefined, '') },
			{ json: 'Crime and discrimination', js: 'Crime and discrimination', typ: u(undefined, '') },
			{ json: 'Name and gender change', js: 'Name and gender change', typ: u(undefined, '') },
			{ json: 'Deportation or removal', js: 'Deportation or removal', typ: u(undefined, '') },
			{
				json: 'Deferred Action for Childhood Arrivals (DACA)',
				js: 'Deferred Action for Childhood Arrivals (DACA)',
				typ: u(undefined, ''),
			},
			{ json: 'Asylum application', js: 'Asylum application', typ: u(undefined, '') },
			{ json: 'Immigration detention', js: 'Immigration detention', typ: u(undefined, '') },
			{
				json: 'Special Immigrant Juvenile Status (SIJS)',
				js: 'Special Immigrant Juvenile Status (SIJS)',
				typ: u(undefined, ''),
			},
			{ json: 'Employment Authorization', js: 'Employment Authorization', typ: u(undefined, '') },
			{ json: 'Citizenship', js: 'Citizenship', typ: u(undefined, '') },
			{ json: 'U Visa', js: 'U Visa', typ: u(undefined, '') },
			{ json: 'Residency', js: 'Residency', typ: u(undefined, '') },
			{ json: 'T Visa', js: 'T Visa', typ: u(undefined, '') },
			{ json: 'Family Petitions', js: 'Family Petitions', typ: u(undefined, '') },
		],
		false
	),
	SocialMedia: o(
		[
			{ json: '_id', js: '_id', typ: r('ID') },
			{ json: 'name', js: 'name', typ: u(undefined, r('Name')) },
			{ json: 'url', js: 'url', typ: '' },
		],
		false
	),
	EEs: ['initial value'],
	CountryES: [
		'Canada',
		'CDMX',
		'EE.UU',
		'Estados Unidos ',
		'Los Estados Unidos ',
		'Mexico ',
		'México ',
		'United States ',
		'Cánada',
		'EE.UU.',
		'EEUU',
		'',
		'Estados Unidos',
		'Estados unidos',
		'Georgetown',
		'Los EEU ',
		'Los EEUU',
		'Los Estados Unidos',
		'Loss EEUU',
		'Mexico',
		'Michoacán',
		'México',
		'Nueva York',
		'Estados Unidos  ',
		'mexico',
		'United States',
		'US',
		'USA',
	],
	Type: ['Point'],
	Timezone: ['AST', 'AKST', 'CDT', 'CST', 'EDT', '', 'EST', 'HST', 'MDT', 'MST', 'NST', 'PDT', 'PST'],
	AccessType: ['email', '', 'file', 'link', 'location', 'other', 'phone'],
	Name: ['facebook', 'instagram', 'twitter', 'youtube'],
	Source: ['OneDegree'],
}
