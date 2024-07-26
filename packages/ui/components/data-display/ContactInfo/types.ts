import { type ReactElement } from 'react'

import { type ApiOutput } from '@weareinreach/api'

type ContactSections = 'phone' | 'email' | 'website' | 'socialMedia'

export type ContactMap = {
	[K in ContactSections]: ReactElement
}

export type ContactInfoProps = CommonProps & {
	order?: ContactSections[]
	gap?: number
} & (ApiData | PassedDataProps)

interface CommonProps {
	direct?: boolean
	locationOnly?: boolean
	serviceOnly?: boolean
	websiteDesc?: boolean
	edit?: boolean
}

export type PhoneNumbersProps = CommonProps & (ApiData | PassedData<'orgPhone', 'forContactInfo'>)
export type WebsitesProps = CommonProps & (ApiData | PassedData<'orgWebsite', 'forContactInfo'>)

export type EmailsProps = CommonProps & (ApiData | PassedData<'orgEmail', 'forContactInfo'>)
export type SocialMediaProps = CommonProps & (ApiData | PassedData<'orgSocialMedia', 'forContactInfo'>)

type PassedData<K1 extends keyof ApiOutput, K2 extends keyof ApiOutput[K1]> = {
	passedData: Array<ApiOutput[K1][K2][number] & { active?: boolean }>
	parentId?: never
}

export interface PassedDataObject {
	phones: ApiOutput['orgPhone']['forContactInfo']
	emails: ApiOutput['orgEmail']['forContactInfo']
	websites: ApiOutput['orgWebsite']['forContactInfo']
	socialMedia: ApiOutput['orgSocialMedia']['forContactInfo']
}
type ApiData = {
	parentId: string
	passedData?: never
}
type PassedDataProps = {
	passedData: PassedDataObject
	parentId?: never
}
