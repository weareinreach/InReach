import { Box, createStyles, rem, Text, type Variants } from '@mantine/core'
import { Trans } from 'next-i18next'

import { Link } from '~ui/components/core/Link'

export default {}

const useStyles = createStyles((theme) => ({
	banner: {
		backgroundColor: theme.other.colors.secondary.cornflower,
		...theme.other.utilityFonts.utility1,
		color: theme.other.colors.secondary.white,
		width: '100vw',
		height: rem(52),
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		textAlign: 'center',
		position: 'absolute',
		[theme.fn.largerThan('sm')]: {
			marginTop: rem(-40),
		},
		[theme.fn.largerThan('xl')]: {
			marginTop: rem(-20),
		},
		[theme.fn.smallerThan('sm')]: {
			height: rem(80),
		},
	},
}))

/** Used to display an alert message on an organization/location/service. */
export const CountryAlertBanner = ({ variant, variantInheritStyle }: Props) => {
	const { classes } = useStyles()

	return (
		<Box className={classes.banner}>
			<Text variant={variant}>
				<Trans
					i18nKey='alerts.search-page-legislative-map'
					ns='common'
					components={{
						ATLink: (
							<Link
								external
								variant={variantInheritStyle}
								href='https://www.erininthemorning.com/p/anti-trans-legislative-risk-assessment-96f'
								target='_blank'
							></Link>
						),
					}}
				/>
			</Text>
		</Box>
	)
}

type Props = {
	variant: Variants<'text' | 'gradient'> | undefined
	variantInheritStyle: Variants<'text' | 'gradient'> | undefined
}
