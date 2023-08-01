import { Card, createStyles, rem, Stack, Text, Title } from '@mantine/core'
import { Trans, useTranslation } from 'next-i18next'
import { type ReactNode } from 'react'

import { Badge } from '~ui/components/core/Badge'

import { InternationalCard } from './InternationalCard'
import { NationalCard } from './NationalCard'

const useStyles = createStyles((theme) => ({
	parentCard: {
		background: theme.other.colors.tertiary.yellow,
	},
	categoryBadge: {
		background: theme.other.colors.secondary.white,
	},
	staySafeCard: {
		border: `${rem(1)} solid ${theme.other.colors.secondary.white}`,
		borderRadius: rem(16),
	},
}))

export const CrisisSupport = ({ children, role }: ContainerProps) => {
	const { classes } = useStyles()
	const { t } = useTranslation(['services', 'common', 'attribute'])

	const topContent =
		role === 'international' ? (
			<>
				<Stack spacing={16}>
					<Badge
						variant='service'
						tsKey='international-support.CATEGORTYNAME'
						hideTooltip
						className={classes.categoryBadge}
					/>
					<Title order={2}>{t('common:crisis-support.intl-we-recommend')}</Title>
					<Text>{t('common:crisis-support.intl-these-verified')}</Text>
				</Stack>
				<Stack spacing={16} p={20} className={classes.staySafeCard}>
					<Trans
						i18nKey='common:crisis-support.intl-stay-safe'
						components={{ Title3: <Title order={3}></Title>, Text: <Text></Text> }}
					/>
				</Stack>
			</>
		) : (
			<>
				<Stack spacing={16}>
					<Badge
						variant='service'
						tsKey='crisis-support.CATEGORYNAME'
						hideTooltip
						className={classes.categoryBadge}
					/>
					<Title order={2}>{t('common:crisis-support.natl-find-help-now')}</Title>
					<Trans i18nKey='common:crisis-support.natl-these-verified' components={{ Text: <Text></Text> }} />
				</Stack>
			</>
		)

	return (
		<Card className={classes.parentCard}>
			<Stack spacing={32}>
				{topContent}
				{children}
			</Stack>
		</Card>
	)
}

interface ContainerProps {
	children: ReactNode
	role: 'national' | 'international'
}

CrisisSupport.International = InternationalCard
CrisisSupport.National = NationalCard
