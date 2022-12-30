import NextLink from 'next/link'

import { Text, createStyles } from '@mantine/core'

const useStyles = createStyles((theme) => ({
	link: {
		color: theme.other.colors.secondary.black,
		paddingBottom: theme.spacing.sm,
		paddingTop: theme.spacing.sm,
		paddingLeft: theme.spacing.xs,
		paddingRight: theme.spacing.xs,
		borderRadius: theme.spacing.sm,
		textDecoration: 'underline',
		'&:hover': {
			backgroundColor: theme.other.colors.primary.lightGray,
			textDecoration: 'none',
		},
	},
	text: {},
}))

export const Link = ({ children, href }: Props) => {
	const { classes } = useStyles()
	return (
		<NextLink href={href} className={classes.link}>
			<Text className={classes.text}>{children}</Text>
		</NextLink>
	)
}

type Props = {
	children: string
	href: string
}
