import { Paper, Stack, Text, Title, useMantineTheme } from '@mantine/core'
import { useTranslation } from 'next-i18next'

export const ReportSubmit = ({ type = 'body', itemId, itemName }: ReportSubmitProps) => {
	const { t } = useTranslation('common')
	const theme = useMantineTheme()

	const component = (
		<Stack align='flex-start' spacing='xs'>
			<Title order={4}>{t('words.report')}</Title>
			<Text size='sm'>
				{t('reporting-item', { defaultValue: 'Reporting item' })}: <strong>{itemName}</strong>
			</Text>
			<Text size='xs' color='dimmed' italic>
				ID: {itemId}
			</Text>
			<Text size='sm' mt='md' color='dimmed'>
				{/* Placeholder for the future form logic */}
				The reporting form for updating organization or service information will be implemented here.
			</Text>
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
}
