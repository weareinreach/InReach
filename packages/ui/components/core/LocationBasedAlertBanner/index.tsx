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
		// width: '100vw',
	},

	primary: {
		height: rem(52),
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		textAlign: 'center',
		width: '100vw',
		borderRadius: 0, // Square corners for primary
		padding: 0, // No horizontal padding for primary
		...theme.other.utilityFonts.utility1,
		position: 'sticky',
		marginTop: rem(-20),
		[theme.fn.smallerThan('lg')]: {
			marginTop: rem(-40),
		},

		'&[data-alert-level="INFO_PRIMARY"]': {
			backgroundColor: theme.other.colors.secondary.cornflower,
			span: {
				color: theme.other.colors.secondary.white,
			},
		},
		'&[data-alert-level="WARN_PRIMARY"]': {
			backgroundColor: theme.other.colors.tertiary.pink,
			span: {
				color: theme.other.colors.secondary.white,
			},
		},
		'&[data-alert-level="CRITICAL_PRIMARY"]': {
			backgroundColor: theme.other.colors.tertiary.red,
			span: {
				color: theme.other.colors.secondary.white,
			},
		},
	},
	secondary: {
		width: '100%',
		'&[data-alert-level="INFO_SECONDARY"]': {
			backgroundColor: theme.other.colors.secondary.cornflower,
			// span: {
			// 	color: theme.other.colors.secondary.white,
			// },
			borderRadius: rem(10), // Rounded corners for secondary
		},
		'&[data-alert-level="WARN_SECONDARY"]': {
			height: 'unset',
			backgroundColor: theme.other.colors.tertiary.pink,
			// span: {
			// 	...theme.other.utilityFonts.utility3,
			// 	color: theme.other.colors.secondary.white,
			// },
			borderRadius: rem(8), // Rounded corners for secondary
			padding: `${rem(8)} ${rem(12)}`,
		},
		'&[data-alert-level="CRITICAL_SECONDARY"]': {
			backgroundColor: theme.other.colors.tertiary.red,
			// span: {
			// 	color: theme.other.colors.secondary.black,
			// },
			borderRadius: rem(10), // Rounded corners for secondary
		},
	},

	// banner: {
	// 	height: rem(52),
	// 	display: 'flex',
	// 	alignItems: 'center',
	// 	justifyContent: 'center',
	// 	textAlign: 'center',
	// 	marginBottom: rem(4),
	// 	padding: '0.5rem', // Add some padding by default
	// 	borderRadius: rem(10), // Rounded corners for default style
	// 	width: '100%',
	// 	'&[data-alert-level="INFO_PRIMARY"]': {
	// 		...theme.other.utilityFonts.utility1,
	// 		backgroundColor: theme.other.colors.secondary.cornflower,
	// 		span: {
	// 			color: theme.other.colors.secondary.white,
	// 		},
	// 		width: '100vw', // Full width for primary
	// 		borderRadius: 0, // Square corners for primary
	// 		padding: 0, // No horizontal padding for primary
	// 	},
	// 	'&[data-alert-level="WARN_PRIMARY"]': {
	// 		...theme.other.utilityFonts.utility1,
	// 		backgroundColor: theme.other.colors.tertiary.pink,
	// 		span: {
	// 			color: theme.other.colors.secondary.black,
	// 		},
	// 		width: '100vw', // Full width for primary
	// 		borderRadius: 0, // Square corners for primary
	// 		padding: 0, // No horizontal padding for primary
	// 	},
	// 	'&[data-alert-level="CRITICAL_PRIMARY"]': {
	// 		...theme.other.utilityFonts.utility1,
	// 		backgroundColor: theme.other.colors.tertiary.red,
	// 		span: {
	// 			color: theme.other.colors.secondary.white,
	// 		},
	// 		width: '100vw', // Full width for primary
	// 		borderRadius: 0, // Square corners for primary
	// 		padding: 0, // No horizontal padding for primary
	// 	},
	// 	'&[data-alert-level="INFO_SECONDARY"]': {
	// 		backgroundColor: theme.other.colors.secondary.cornflower,
	// 		// span: {
	// 		// 	color: theme.other.colors.secondary.white,
	// 		// },
	// 		borderRadius: rem(10), // Rounded corners for secondary
	// 	},
	// 	'&[data-alert-level="WARN_SECONDARY"]': {
	// 		height: 'unset',
	// 		backgroundColor: theme.other.colors.tertiary.pink,
	// 		// span: {
	// 		// 	...theme.other.utilityFonts.utility3,
	// 		// 	color: theme.other.colors.secondary.white,
	// 		// },
	// 		borderRadius: rem(8), // Rounded corners for secondary
	// 		padding: `${rem(8)} ${rem(12)}`,
	// 	},
	// 	'&[data-alert-level="CRITICAL_SECONDARY"]': {
	// 		backgroundColor: theme.other.colors.tertiary.red,
	// 		// span: {
	// 		// 	color: theme.other.colors.secondary.black,
	// 		// },
	// 		borderRadius: rem(10), // Rounded corners for secondary
	// 	},
	// },
}))

export const LocationBasedAlertBanner = ({ lat, lon, type }: LocationBasedAlertBannerProps) => {
	const { classes } = useStyles()
	const variants = useCustomVariant()

	const { data: locationBasedAlertBannerProps, isLoading } = api.component.LocationBasedAlertBanner.useQuery({
		lat,
		lon,
	})

	return isLoading ? null : (
		<div className={classes.alertContainer}>
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
