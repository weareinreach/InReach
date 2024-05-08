import { Box, createStyles, rem, Text } from '@mantine/core'
import { Trans } from 'next-i18next'

import { type ApiOutput } from '@weareinreach/api'
import { Link } from '~ui/components/core/Link'
import { useCustomVariant } from '~ui/hooks/useCustomVariant'

const useStyles = createStyles((theme) => ({
	banner: {
		...theme.other.utilityFonts.utility1,

		width: '100vw',
		height: rem(52),
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		textAlign: 'center',
		position: 'absolute',
		marginBottom: rem(40),
		[theme.fn.largerThan('sm')]: {
			marginTop: rem(-40),
		},
		[theme.fn.largerThan('xl')]: {
			marginTop: rem(-20),
		},
		[theme.fn.smallerThan('sm')]: {
			height: rem(80),
		},
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

export const LocationBasedAlertBanner = ({
	i18nKey,
	ns,
	defaultText,
	level,
}: LocationBasedAlertBannerProps) => {
	const { classes } = useStyles()
	const variants = useCustomVariant()

	return (
		<Box className={classes.banner} data-alert-level={level}>
			<Text variant={variants.Text.utility1white}>
				<Trans
					i18nKey={i18nKey}
					ns={ns}
					defaults={defaultText}
					components={{
						Link: <Link external variant={variants.Link.inheritStyle} target='_blank'></Link>,
					}}
				/>
			</Text>
		</Box>
	)
}

type LocationBasedAlertBannerProps = Omit<
	NonNullable<ApiOutput['component']['LocationBasedAlertBanner']>[number],
	'id'
>
