import { Card, Stack, Text, Title } from '@mantine/core'
import { Trans, useTranslation } from 'next-i18next/pages'
import { type ReactNode } from 'react'

import { Badge } from '~ui/components/core/Badge'

import classes from './index.module.css'
import { InternationalCard } from './InternationalCard'
import { NationalCard } from './NationalCard'

export const CrisisSupport = ({ children, role }: ContainerProps) => {
	const { t } = useTranslation(['services', 'common', 'attribute'])

	const topContent =
		role === 'international' ? (
			<>
				<Stack gap={16}>
					<Badge.Service hideTooltip className={classes.categoryBadge}>
						{t('international-support.CATEGORTYNAME')}
					</Badge.Service>
					<Title order={2}>{t('common:crisis-support.intl-we-recommend')}</Title>
					<Text>{t('common:crisis-support.intl-these-verified')}</Text>
				</Stack>
				<Stack gap={16} p={20} className={classes.staySafeCard}>
					<Trans
						i18nKey='common:crisis-support.intl-stay-safe'
						components={{ Title3: <Title order={3}></Title>, Text: <Text></Text> }}
					/>
				</Stack>
			</>
		) : (
			<>
				<Stack gap={16}>
					<Badge.Service hideTooltip className={classes.categoryBadge}>
						{t('crisis-support.CATEGORYNAME')}
					</Badge.Service>
					<Title order={2}>{t('common:crisis-support.natl-find-help-now')}</Title>
					<Trans i18nKey='common:crisis-support.natl-these-verified' components={{ Text: <Text></Text> }} />
				</Stack>
			</>
		)

	return (
		<Card className={classes.parentCard}>
			<Stack gap={32}>
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
