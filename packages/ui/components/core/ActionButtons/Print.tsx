import { Box, Group, Text, useMantineTheme } from '@mantine/core'
import { useTranslation } from 'next-i18next'
import { forwardRef } from 'react'

import { Button, type ButtonProps } from '~ui/components/core/Button'
import { Icon } from '~ui/icon'

import { useStyles } from './styles'

export const Print = forwardRef<HTMLButtonElement, PrintProps>(({ omitLabel, className, ...props }, ref) => {
	const { classes, cx } = useStyles()
	const theme = useMantineTheme()
	const { t } = useTranslation('common')

	return (
		<Box
			component={Button}
			ref={ref}
			onClick={window.print}
			className={cx(classes.button, className)}
			{...props}
		>
			<Group spacing={0} noWrap>
				<Icon
					icon='carbon:printer'
					color={theme.other.colors.secondary.black}
					className={classes.icon}
					height={24}
					width={24}
				/>
				{!omitLabel && <Text className={classes.text}>{t('words.print')}</Text>}
			</Group>
		</Box>
	)
})
Print.displayName = 'ActionButtons.Print'

export interface PrintProps extends ButtonProps {
	omitLabel?: boolean
}
