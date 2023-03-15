import { createStyles, Grid, rem, Stack } from '@mantine/core'
import { ReactNode } from 'react'

const useStyles = createStyles((theme, { backgroundColor }: { backgroundColor: string }) => ({
	root: {
		backgroundColor,
		position: 'absolute',
		left: 0,
		right: 0,
		zIndex: -1,
		padding: `${rem(38)} ${rem(0)}`,
		[theme.fn.largerThan('sm')]: { padding: `${rem(60)} ${rem(0)}` },
	},
}))

export const CallOut = ({ children, backgroundColor }: CallOutProps) => {
	const { classes } = useStyles({ backgroundColor })

	return (
		<Stack className={classes.root} align='center' spacing={0}>
			<Grid.Col sm={8}>{children}</Grid.Col>
		</Stack>
	)
}

type CallOutProps = {
	children: ReactNode
	backgroundColor: string
}
