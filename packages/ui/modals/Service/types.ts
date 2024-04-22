import { type ApiOutput } from '@weareinreach/api'

export type AccessDetailsAPI =
	| ApiOutput['service']['forServiceModal']['accessDetails']
	| ApiOutput['service']['forServiceEditDrawer']['accessDetails']
export type AccessDetailRecord = NonNullable<AccessDetailsAPI>[number]
export type LocationsAPI =
	| ApiOutput['service']['forServiceModal']['locations']
	| ApiOutput['service']['forServiceEditDrawer']['locations']
export type LocationsRecord = NonNullable<LocationsAPI>[number]
export type AttributesAPI =
	| ApiOutput['service']['forServiceModal']['attributes']
	| ApiOutput['service']['forServiceEditDrawer']['attributes']
export type AttributeRecord = NonNullable<AttributesAPI>[number]
