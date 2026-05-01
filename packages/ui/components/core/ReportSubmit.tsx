import { Paper, Stack, Text, Title, useMantineTheme } from '@mantine/core'
import { useTranslation } from 'next-i18next'

import { Button } from '~ui/components/core/Button'
import { useCustomVariant } from '~ui/hooks/useCustomVariant'
import { Icon } from '~ui/icon'

export const ReportSubmit = ({
	type = 'body',
	itemId,
	itemName,
	orgId,
	orgName,
	serviceId,
	serviceName,
}: ReportSubmitProps) => {
	const { t } = useTranslation('common')
	const theme = useMantineTheme()
	const variant = useCustomVariant()
	const isBody = type === 'body'

	const component = (
		<Stack align='flex-start' spacing='xs'>
			<Title order={4}>{t('words.report')}</Title>
			<Stack spacing={0}>
				<Text size='sm'>
					Organization Name:{' '}
					<strong>
						{orgName || (!serviceId ? itemName : '') || t('words.unknown', { defaultValue: 'Unknown' })}
					</strong>
				</Text>
				<Text size='xs' color='dimmed' italic>
					Organization ID: {orgId || (!serviceId ? itemId : '') || 'N/A'}
				</Text>
			</Stack>
			{serviceId && (
				<Stack spacing={0} mt='xs'>
					<Text size='sm'>
						Service Name:{' '}
						<strong>{serviceName || itemName || t('words.unknown', { defaultValue: 'Unknown' })}</strong>
					</Text>
					<Text size='xs' color='dimmed' italic>
						Service ID: {serviceId || itemId || 'N/A'}
					</Text>
				</Stack>
			)}
			<Text size='sm' mt='md' color='dimmed'>
				{/* Placeholder for the future form logic */}
				The reporting form for updating organization or service information will be implemented here.
			</Text>
			<Button variant={isBody ? 'primary' : 'primary-icon'} fullWidth={!isBody} type='submit'>
				{t('submit')}
			</Button>{' '}
		</Stack>
	)

	if (type === 'modal') {
		return component
	}

	return (
		<Paper withBorder radius='lg' p={theme.spacing.lg}>
			{component}
		</Paper>
	)
}

export interface ReportSubmitProps {
	/** Is this being used in a page body or in a modal? */
	type?: 'body' | 'modal'
	closeModalHandler?: () => void
	itemId: string
	itemName: string
	orgId?: string
	orgName?: string
	serviceId?: string
	serviceName?: string
}
