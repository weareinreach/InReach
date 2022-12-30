import Link from 'next/link'

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

export const LinkComponent = ({ text, href, size }: Props) => {
	const { classes } = useStyles()
	return (
		<Link href={href} className={classes.link}>
			<Text size={size} className={classes.text}>
				{text}
			</Text>
		</Link>
	)
}

type Props = {
	text: string
	href: string
	size: number
}
