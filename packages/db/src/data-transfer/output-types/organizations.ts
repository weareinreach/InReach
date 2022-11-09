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
