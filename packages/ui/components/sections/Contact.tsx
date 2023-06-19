import { Card, Stack, Title } from '@mantine/core'
import { useTranslation } from 'next-i18next'

import { ContactInfo, hasContactInfo } from '~ui/components/data-display/ContactInfo'
import { useScreenSize } from '~ui/hooks'

export const ContactSection = ({ parentId }: ContactSectionProps) => {
	const { t } = useTranslation(['common'])
	const { isMobile, isTablet } = useScreenSize()

	if (!hasContactInfo(parentId)) return null

	const body = (
		<Stack spacing={isMobile ? 32 : 40}>
			<Title order={2}>{t('contact')}</Title>
			<ContactInfo parentId={parentId} gap={40} />
		</Stack>
	)
	return isTablet || isMobile ? body : <Card>{body}</Card>
}

export type ContactSectionProps = {
	role: 'org' | 'location'
	parentId: string
}
