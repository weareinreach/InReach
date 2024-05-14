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

	banner: {
		...theme.other.utilityFonts.utility1,
		height: rem(52),
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		textAlign: 'center',
		marginBottom: rem(4),
		// [theme.fn.largerThan('sm')]: {
		// 	marginTop: rem(-40),
		// },
		// [theme.fn.largerThan('xl')]: {
		// 	marginTop: rem(-20),
		// },
		// [theme.fn.smallerThan('sm')]: {
		// 	height: rem(80),
		// },
		'&[data-alert-level="INFO"]': {
			// "Info" level style overrides
			backgroundColor: theme.other.colors.secondary.cornflower,
			span: {
				color: theme.other.colors.secondary.white,
			},
		},
		'&[data-alert-level="WARN"]': {
			// "Warning" level style overrides
			backgroundColor: theme.other.colors.tertiary.pink,
			span: {
				color: theme.other.colors.secondary.black,
			},
		},
		'&[data-alert-level="CRITICAL"]': {
			// "Critical" level style overrides
			backgroundColor: theme.other.colors.tertiary.red,
			span: {
				color: theme.other.colors.secondary.white,
			},
		},
	},
}))

export const LocationBasedAlertBanner = ({ lat, lon }: LocationBasedAlertBannerProps) => {
	const { classes } = useStyles()
	const variants = useCustomVariant()

	const { data: locationBasedAlertBannerProps, isLoading } = api.component.LocationBasedAlertBanner.useQuery({
		lat,
		lon,
	})

	return isLoading ? null : (
		<div className={classes.alertContainer}>
			{locationBasedAlertBannerProps?.map((alertProps) => (
				<Box className={classes.banner} data-alert-level={alertProps.level} key={alertProps.id}>
					<Text variant={variants.Text.utility1white}>
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

type LocationBasedAlertBannerProps = { lat: number; lon: number }
