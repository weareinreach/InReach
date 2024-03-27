import { Box, createStyles, rem, Text, useMantineTheme, type Variants } from '@mantine/core'
import { type BackgroundColor } from 'csstype'
import { Trans } from 'next-i18next'

import { Link } from '~ui/components/core/Link'

export default {}

const stateRiskLevels: Record<string, string> = {
	FL: 'alerts.search-page-do-not-fly-florida',
	KS: 'alerts.search-page-high-risk-state',
	MT: 'alerts.search-page-high-risk-state',
	OK: 'alerts.search-page-high-risk-state',
	ND: 'alerts.search-page-high-risk-state',
	TN: 'alerts.search-page-high-risk-state',
	UT: 'alerts.search-page-high-risk-state',
	AL: 'alerts.search-page-high-risk-state',
	AR: 'alerts.search-page-high-risk-state',
	IA: 'alerts.search-page-high-risk-state',
	IN: 'alerts.search-page-high-risk-state',
	LA: 'alerts.search-page-high-risk-state',
	MO: 'alerts.search-page-high-risk-state',
	MS: 'alerts.search-page-high-risk-state',
	NE: 'alerts.search-page-high-risk-state',
	OH: 'alerts.search-page-high-risk-state',
	SC: 'alerts.search-page-high-risk-state',
	TX: 'alerts.search-page-high-risk-state',
	WV: 'alerts.search-page-high-risk-state',
	AK: 'alerts.search-page-med-risk-state',
	GA: 'alerts.search-page-med-risk-state',
	ID: 'alerts.search-page-med-risk-state',
	KY: 'alerts.search-page-med-risk-state',
	NC: 'alerts.search-page-med-risk-state',
	NH: 'alerts.search-page-med-risk-state',
	SD: 'alerts.search-page-med-risk-state',
	WY: 'alerts.search-page-med-risk-state',
	AZ: 'alerts.search-page-low-risk-state',
	DE: 'alerts.search-page-low-risk-state',
	ME: 'alerts.search-page-low-risk-state',
	MI: 'alerts.search-page-low-risk-state',
	NV: 'alerts.search-page-low-risk-state',
	PA: 'alerts.search-page-low-risk-state',
	RI: 'alerts.search-page-low-risk-state',
	VA: 'alerts.search-page-low-risk-state',
	WI: 'alerts.search-page-low-risk-state',
	CA: 'alerts.search-page-most-protective-state',
	CO: 'alerts.search-page-most-protective-state',
	CT: 'alerts.search-page-most-protective-state',
	DC: 'alerts.search-page-most-protective-state',
	HI: 'alerts.search-page-most-protective-state',
	IL: 'alerts.search-page-most-protective-state',
	MA: 'alerts.search-page-most-protective-state',
	MD: 'alerts.search-page-most-protective-state',
	MN: 'alerts.search-page-most-protective-state',
	NJ: 'alerts.search-page-most-protective-state',
	NM: 'alerts.search-page-most-protective-state',
	NY: 'alerts.search-page-most-protective-state',
	OR: 'alerts.search-page-most-protective-state',
	VT: 'alerts.search-page-most-protective-state',
	WA: 'alerts.search-page-most-protective-state',
}
const protectiveStates = [
	'CA',
	'CO',
	'CT',
	'DC',
	'HI',
	'IL',
	'MA',
	'MD',
	'MN',
	'NJ',
	'NM',
	'NY',
	'OR',
	'VT',
	'WA',
]

const useStyles = createStyles((theme) => ({
	searchBanner: {
		...theme.other.utilityFonts.utility1,
		color: theme.other.colors.secondary.black,
		width: '100%',
		maxWidth: '100%',
		height: 'auto',
		display: 'flex',
		alignItems: 'flex-start',
		justifyContent: 'center',
		textAlign: 'center',
		position: 'relative',
		borderRadius: rem(8),
		padding: `${rem(12)} ${rem(16)} ${rem(16)}`,
		marginBottom: rem(32),
		[theme.fn.largerThan('sm')]: {
			marginTop: rem(-40),
		},
		[theme.fn.largerThan('md')]: {
			marginTop: rem(-20),
		},
		[theme.fn.smallerThan('sm')]: {
			height: rem(80),
		},
	},
	emoji: {
		marginRight: rem(8),
		verticalAlign: 'top',
		display: 'block',
	},
}))

/** Used to display an alert message on an organization/location/service. */
export const StateAlertBanner = ({
	stateInUS,
	variantInheritStyle,
	variantBlack,
	variantWhite,
	infoColor: cornflower,
	warningColor: pink,
}: Props) => {
	const { classes } = useStyles()

	return (
		stateRiskLevels[stateInUS] && (
			<div>
				<Box
					className={classes.searchBanner}
					style={{
						backgroundColor: protectiveStates.includes(stateInUS) ? cornflower : pink,
					}}
				>
					<div className={classes.emoji}>🔔</div>
					<Text variant={protectiveStates.includes(stateInUS) ? variantWhite : variantBlack}>
						<Trans
							i18nKey={stateRiskLevels[stateInUS]}
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
			</div>
		)
	)
}

type Props = {
	stateInUS: string
	variantInheritStyle: Variants<'text' | 'gradient'> | undefined
	variantBlack: Variants<'text' | 'gradient'> | undefined
	variantWhite: Variants<'text' | 'gradient'> | undefined
	infoColor: BackgroundColor
	warningColor: BackgroundColor
}
