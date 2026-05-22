import { Box, createStyles, rem, Stack, Text } from '@mantine/core'
import { Trans } from 'next-i18next'

import { Link } from '~ui/components/core/Link'
import { useCustomVariant } from '~ui/hooks/useCustomVariant'
import { trpc as api } from '~ui/lib/trpcClient'

const useStyles = createStyles((theme) => ({
	primaryContainer: {
		position: 'sticky',
		marginTop: rem(-15),
		[theme.fn.smallerThan('xl')]: {
			marginTop: rem(-40),
		},
		[theme.fn.smallerThan('sm')]: {
			marginBottom: rem(-60),
		},
	},
	secondaryContainer: { marginBottom: rem(10) },

	primary: {
		// display: 'flex',
		// alignItems: 'center',
		// justifyContent: 'center',
		textAlign: 'center',
		width: '100vw',
		borderRadius: 0,
		padding: `${rem(12)} 0`,
		...theme.other.utilityFonts.utility1,

		'&[data-alert-level="INFO_PRIMARY"]': {
			backgroundColor: theme.other.colors.secondary.cornflower,
			span: {
				color: theme.other.colors.secondary.white,
			},
		},
		'&[data-alert-level="WARN_PRIMARY"]': {
			backgroundColor: theme.fn.lighten(theme.other.colors.tertiary.pink, 0.7),
		},
		'&[data-alert-level="CRITICAL_PRIMARY"]': {
			backgroundColor: theme.other.colors.tertiary.pink,
			span: {
				color: theme.other.colors.secondary.white,
			},
		},
	},
	secondary: {
		width: '100%',
		height: 'unset',
		borderRadius: rem(10),
		padding: `${rem(8)} ${rem(12)}`,
		marginBottom: rem(40),

		'&[data-alert-level="INFO_SECONDARY"]': {
			height: 'unset',
			backgroundColor: theme.fn.lighten(theme.other.colors.secondary.cornflower, 0.7),
		},
		'&[data-alert-level="WARN_SECONDARY"]': {
			backgroundColor: theme.fn.lighten(theme.other.colors.tertiary.pink, 0.7),
		},
		'&[data-alert-level="CRITICAL_SECONDARY"]': {
			backgroundColor: theme.other.colors.tertiary.pink,
			span: {
				color: theme.other.colors.secondary.white,
			},
		},
	},
}))

export const LocationBasedAlertBanner = ({ lat, lon, type, onClick }: LocationBasedAlertBannerProps) => {
	const { classes, cx } = useStyles()
	const variants = useCustomVariant()

	const { data: locationBasedAlertBannerProps, isLoading } = api.component.LocationBasedAlertBanner.useQuery({
		lat,
		lon,
	})

	if (isLoading || !locationBasedAlertBannerProps) {
		return null
	}

	return (
		<Stack
			spacing={0}
			className={cx({
				[classes.primaryContainer]: type === 'primary',
				[classes.secondaryContainer]: type === 'secondary',
			})}
		>
			{locationBasedAlertBannerProps
				.filter((alertProps) => alertProps.level.toLowerCase().endsWith(type))
				.map((alertProps) => (
					<Box
						className={classes[type]}
						data-alert-level={alertProps.level}
						key={alertProps.id}
						onClick={onClick}
						style={{ cursor: onClick ? 'pointer' : 'default' }}
					>
						<Text>
							<Trans
								i18nKey={alertProps.i18nKey}
								ns={alertProps.ns}
								defaults={alertProps.defaultText}
								components={{
									Link: <Link external variant={variants.Link.inheritStyle} target='_blank' />,
								}}
							/>
						</Text>
					</Box>
				))}
		</Stack>
	)
}

export type LocationBasedAlertBannerProps = {
	lat: number
	lon: number
	type: 'primary' | 'secondary'
	onClick?: () => void
}
