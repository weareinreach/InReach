import { Card, Stack, Title } from '@mantine/core'
import { useTranslation } from 'next-i18next'

import { ContactInfo } from '~ui/components/data-display/ContactInfo'
import { useScreenSize } from '~ui/hooks'
import { trpc as api } from '~ui/lib/trpcClient'

export const ContactSection = ({ parentId, edit }: ContactSectionProps) => {
	const { t } = useTranslation(['common'])
	const { isMobile, isTablet } = useScreenSize()
	const { data: hasContactInfo } = api.misc.hasContactInfo.useQuery(parentId)

	if (!hasContactInfo && !edit) {
		return null
	}

	const body = (
		<Stack spacing={isMobile ? 32 : 40}>
			<Title order={2}>{t('contact')}</Title>
			<ContactInfo parentId={parentId} gap={40} edit={edit} />
		</Stack>
	)
	return isTablet || isMobile ? body : <Card>{body}</Card>
}

export type ContactSectionProps = {
	role: 'org' | 'location'
	parentId: string
	edit?: boolean
}
