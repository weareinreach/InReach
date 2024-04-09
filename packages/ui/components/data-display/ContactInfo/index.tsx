import { Stack } from '@mantine/core'

import { Emails } from './Emails'
import { PhoneNumbers } from './PhoneNumbers'
import { SocialMedia } from './SocialMedia'
import { type ContactInfoProps, type ContactMap, type PassedDataObject } from './types'
import { Websites } from './Websites'

export const ContactInfo = ({
	passedData,
	parentId,
	order = ['website', 'phone', 'email', 'socialMedia'],
	gap = 24,
	...commonProps
}: ContactInfoProps) => {
	const sections: ContactMap = {
		website: (
			<Websites
				key='Websites'
				{...commonProps}
				{...(passedData ? { passedData: passedData.websites } : { parentId })}
			/>
		),
		phone: (
			<PhoneNumbers
				key='PhoneNumbers'
				{...commonProps}
				{...(passedData ? { passedData: passedData.phones } : { parentId })}
			/>
		),
		email: (
			<Emails
				key='Emails'
				{...commonProps}
				{...(passedData ? { passedData: passedData.emails } : { parentId })}
			/>
		),
		socialMedia: (
			<SocialMedia
				key='SocialMedia'
				{...commonProps}
				{...(passedData ? { passedData: passedData.socialMedia } : { parentId })}
			/>
		),
	}
	const items = order.map((item) => sections[item])
	return <Stack spacing={gap}>{items}</Stack>
}

export const hasContactInfo = (data: PassedDataObject | null | undefined): data is PassedDataObject => {
	if (!data) {
		return false
	}
	const { websites, phones, emails, socialMedia } = data
	return Boolean(websites.length || phones.length || emails.length || socialMedia.length)
}
