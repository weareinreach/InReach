import { Box, Group, Text, useMantineTheme } from '@mantine/core'
import { useSession } from 'next-auth/react'
import { useTranslation } from 'next-i18next/pages'
import { forwardRef, useMemo } from 'react'

import { type ButtonProps } from '~ui/components/core/Button'
import { Icon } from '~ui/icon'
import { cx } from '~ui/lib/cx'
import { QuickPromotionModal } from '~ui/modals/QuickPromotion'
import { ReviewModal } from '~ui/modals/Review'

import classes from './styles.module.css'

export const Review = forwardRef<HTMLButtonElement, ReviewProps>(
	({ omitLabel, className, ...props }, ref) => {
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
			// `BaseComponent` is a union of two `createPolymorphicComponent` factories - TS can't
			// unify their generic `component` signatures even though both wrap `Button` with a
			// `ButtonProps`-compatible interface. Bypassed here rather than redesigning either modal's
			// polymorphic typing.
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			<Box component={BaseComponent as any} ref={ref} className={cx(classes.button, className)} {...props}>
				<Group gap={0} wrap='nowrap'>
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
	}
)
Review.displayName = 'ActionButtons.Review'

export interface ReviewProps extends ButtonProps {
	omitLabel?: boolean
}
