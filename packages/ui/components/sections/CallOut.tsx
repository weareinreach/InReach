import { createStyles, rem, Stack } from '@mantine/core'
import { type ReactNode } from 'react'

const useStyles = createStyles((theme, { backgroundColor }: { backgroundColor: string }) => ({
	root: {
		backgroundColor,
		left: 0,
		right: 0,
		zIndex: -1,
		// width: '100vw',
		overflow: 'visible',
		padding: `${rem(38)} ${rem(0)}`,
		[theme.fn.largerThan('sm')]: { padding: `${rem(60)} ${rem(0)}` },
	},
}))

export const CallOut = ({ children, backgroundColor }: CallOutProps) => {
	const { classes } = useStyles({ backgroundColor })

	return (
		<Stack className={classes.root} align='center' spacing={0}>
			{children}
		</Stack>
	)
}

type CallOutProps = {
	children: ReactNode
	backgroundColor: string
}
