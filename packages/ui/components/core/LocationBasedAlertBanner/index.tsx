import { Box, createStyles, rem, Text } from '@mantine/core'
import { Trans } from 'next-i18next'

import { type ApiOutput } from '@weareinreach/api'
import { Link } from '~ui/components/core/Link'
import { useCustomVariant } from '~ui/hooks/useCustomVariant'
import { trpc as api } from '~ui/lib/trpcClient'

const useStyles = createStyles((theme) => ({
	alertContainer: {
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		justifyContent: 'flex-start',
	},

	primaryContainer: {
		[theme.fn.smallerThan('sm')]: {
			// marginTop: rem(0),
			// marginBottom: rem(0),
		},
	},

	secondaryContainer: {
		[theme.fn.smallerThan('sm')]: {
			// Add specific styles for secondary alert if needed
		},
	},

	primary: {
		height: rem(52),
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		textAlign: 'center',
		width: '100vw',
		borderRadius: 0,
		padding: 0,
		...theme.other.utilityFonts.utility1,
		position: 'sticky',
		marginTop: rem(-10),

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
		marginBottom: rem(10),
		'&[data-alert-level="INFO_SECONDARY"]': {
			height: 'unset',
			backgroundColor: theme.other.colors.secondary.cornflower,
			span: {
				color: theme.other.colors.secondary.white,
			},
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

export const LocationBasedAlertBanner = ({ lat, lon, type }: LocationBasedAlertBannerProps) => {
	const { classes } = useStyles()
	const variants = useCustomVariant()

	const { data: locationBasedAlertBannerProps, isLoading } = api.component.LocationBasedAlertBanner.useQuery({
		lat,
		lon,
	})

	return isLoading ? null : (
		<div className={`${classes.alertContainer} ${classes[type]}`}>
			{locationBasedAlertBannerProps
				?.filter((alertProps) => alertProps.level.toLowerCase().endsWith(type))
				.map((alertProps) => (
					<Box className={classes[type]} data-alert-level={alertProps.level} key={alertProps.id}>
						<Text>
							<Trans
								i18nKey={alertProps.i18nKey}
								ns={alertProps.ns}
								defaults={alertProps.defaultText}
								components={{
									Link: <Link external variant={variants.Link.inheritStyle} target='_blank'></Link>,
								}}
							/>
						</Text>
					</Box>
				))}
		</div>
	)
}

type LocationBasedAlertBannerProps = { lat: number; lon: number; type: 'primary' | 'secondary' }
