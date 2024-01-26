import { Badge, type BadgeProps, ColorSwatch, rem, Text, Tooltip, useMantineTheme } from '@mantine/core'
import compact from 'just-compact'
import { useTranslation } from 'next-i18next'
import { forwardRef, type ReactNode } from 'react'

import { useCustomVariant } from '~ui/hooks/useCustomVariant'
import { Icon } from '~ui/icon'

import { useSharedStyles } from './styles'

export const _National = forwardRef<HTMLDivElement, BadgeNationalProps>(
	({ hideTooltip, countries, ...props }, ref) => {
		const { classes } = useSharedStyles('national')
		const theme = useMantineTheme()
		const { t, i18n } = useTranslation(['common', 'attribute'])
		const variants = useCustomVariant()

		const leftSection = (
			<Icon
				icon='carbon:globe'
				height={24}
				width={24}
				color={theme.other.colors.secondary.black}
				style={{ marginBottom: rem(-12) }}
			/>
		)

		const badge = (
			<Badge variant='outline' classNames={classes} ref={ref} leftSection={leftSection} {...props} />
		)

		const listFormatter = new Intl.ListFormat(i18n.resolvedLanguage, {
			style: 'long',
			type: 'conjunction',
		})

		const countryNameFormatter = new Intl.DisplayNames(i18n.resolvedLanguage, { type: 'region' })

		const translatedCountries = compact(countries.map((cca2) => countryNameFormatter.of(cca2)))

		const tooltipLabel = t('badge.national-tool-tip', {
			country: listFormatter.format(translatedCountries),
		})

		return hideTooltip ? (
			badge
		) : (
			<Tooltip
				multiline
				variant={variants.Tooltip.utility1}
				px={16}
				py={10}
				events={{ hover: true, focus: true, touch: true }}
				label={tooltipLabel}
				disabled={hideTooltip}
			>
				{badge}
			</Tooltip>
		)
	}
)
_National.displayName = 'Badge.National'

export interface BadgeNationalProps extends BadgeProps {
	hideTooltip?: boolean
	/**
	 * Array of two letter country codes
	 *
	 * @example {undefined} 'US', 'CA'
	 */
	countries: string[]
}
