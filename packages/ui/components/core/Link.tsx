import { Text, createStyles, useMantineTheme, Anchor } from '@mantine/core'
import NextLink, { type LinkProps } from 'next/link'

const useStyles = createStyles((theme) => ({
	link: {
		color: `${theme.other.colors.secondary.black} !important`,
		paddingBottom: theme.spacing.sm,
		paddingTop: theme.spacing.sm,
		paddingLeft: theme.spacing.xs,
		paddingRight: theme.spacing.xs,
		borderRadius: theme.spacing.sm,
		textDecoration: 'underline !important',

		'&:hover': {
			backgroundColor: theme.other.colors.primary.lightGray,
			textDecoration: 'none !important',
		},
	},
	text: {},
}))

export const Link = ({ children, href, ...rest }: Props) => {
	const { classes } = useStyles()
	const theme = useMantineTheme()

	if (typeof href === 'string' && href.substring(0, 3) === 'http') {
		return (
			<Anchor
				component='a'
				href={href}
				className={classes.link}
				fw={theme.other.fontWeight.semibold}
				variant='link'
				{...rest}
			>
				{children}
			</Anchor>
		)
	}

	return (
		<Text
			component={NextLink}
			href={href}
			className={classes.link}
			fw={theme.other.fontWeight.semibold}
			variant='link'
			{...rest}
		>
			{children}
		</Text>
	)
}

interface Props extends Omit<LinkProps, 'href'> {
	href: LinkProps['href'] | `http${string}`
}
