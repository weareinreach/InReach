import { Stack, Title, Card } from '@mantine/core'
import { type ApiOutput } from '@weareinreach/api'
import { useTranslation } from 'next-i18next'

import { ContactInfo, hasContactInfo } from '~ui/components/data-display'
import { useScreenSize } from '~ui/hooks'

export const ContactSection = (props: ContactSectionProps) => {
	const { t } = useTranslation(['common'])
	const { isMobile } = useScreenSize()

	if (!hasContactInfo(props.data)) return null

	const body = (
		<Stack spacing={isMobile ? 32 : 40}>
			<Title order={2}>{t('contact')}</Title>
			<ContactInfo data={props.data} />
		</Stack>
	)
	return isMobile ? body : <Card>{body}</Card>
}

type PageQueryResult = NonNullable<ApiOutput['organization']['getBySlug']>

export type ContactSectionProps = OrganizationContact | LocationContact

type OrganizationContact = {
	role: 'org'
	data: {
		websites: PageQueryResult['websites']
		phones: PageQueryResult['phones']
		emails: PageQueryResult['emails']
		socialMedia: PageQueryResult['socialMedia']
	}
}
type Location = NonNullable<PageQueryResult['locations']>[number]

type LocationContact = {
	role: 'location'
	data: {
		websites: Location['websites']
		phones: Location['phones']
		emails: Location['emails']
		socialMedia: Location['socialMedia']
	}
}
