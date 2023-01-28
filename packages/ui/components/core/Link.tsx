import { Text, createStyles, useMantineTheme } from '@mantine/core'
import NextLink from 'next/link'

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

export const Link = ({ children, href }: Props) => {
	const { classes } = useStyles()
	const theme = useMantineTheme()

	const linkStyle = {
		color: theme.other.colors.secondary.black,
		textDecoration: 'underline',
		'&::hover': {
			textDecoration: 'none !important',
		},
	}
	return (
		<Text
			component={NextLink}
			href={href}
			className={classes.link}
			fw={theme.other.fontWeight.semibold}
			variant='link'
		>
			{children}
		</Text>
	)
}

type Props = {
	children: string
	href: string
}
