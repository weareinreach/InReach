import { Text } from '@mantine/core'
import { type ReactNode } from 'react'

import { useStyles } from './styles'

export const ModalText = ({ children }: ModalTextprops) => {
	const { classes } = useStyles()
	return (
		<Text component='p' className={classes.blackText}>
			{children}
		</Text>
	)
}
type ModalTextprops = {
	children: ReactNode
}
