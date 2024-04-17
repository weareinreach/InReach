import { Box, Group, Text, useMantineTheme } from '@mantine/core'
import { useSession } from 'next-auth/react'
import { useTranslation } from 'next-i18next'
import { forwardRef, useMemo } from 'react'

import { type ButtonProps } from '~ui/components/core/Button'
import { Icon } from '~ui/icon'
import { QuickPromotionModal } from '~ui/modals/QuickPromotion'
import { ReviewModal } from '~ui/modals/Review'

import { useStyles } from './styles'

export const Review = forwardRef<HTMLButtonElement, ReviewProps>(({ omitLabel, ...props }, ref) => {
	const { classes } = useStyles()
	const theme = useMantineTheme()
	const { t } = useTranslation('common')
	const { status: sessionStatus } = useSession()

	const BaseComponent = useMemo(() => {
		if (sessionStatus === 'authenticated') {
			return ReviewModal
		}
		return QuickPromotionModal
	}, [sessionStatus])

	return (
		<Box component={BaseComponent} ref={ref} className={classes.button} {...props}>
			<Group spacing={0} noWrap>
				<Icon
					icon='carbon:star'
					color={theme.other.colors.secondary.black}
					className={classes.icon}
					height={24}
					width={24}
				/>
				{!omitLabel && <Text className={classes.text}>{t('words.review')}</Text>}
			</Group>
		</Box>
	)
})
Review.displayName = 'ActionButtons.Review'

export interface ReviewProps extends ButtonProps {
	omitLabel?: boolean
}
