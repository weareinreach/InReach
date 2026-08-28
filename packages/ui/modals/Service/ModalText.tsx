import { Text } from '@mantine/core'
import { type ReactNode } from 'react'

import classes from './styles.module.css'

export const ModalText = ({ children }: ModalTextprops) => {
	return (
		<Text component='p' className={classes.blackText}>
			{children}
		</Text>
	)
}
type ModalTextprops = {
	children: ReactNode
}
