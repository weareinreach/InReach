import { Stack } from '@mantine/core'
import { type CSSProperties, type ReactNode } from 'react'

import classes from './CallOut.module.css'

export const CallOut = ({ children, backgroundColor }: CallOutProps) => {
	return (
		<Stack
			className={classes.root}
			style={{ '--callout-bg': backgroundColor } as CSSProperties}
			align='center'
			gap={0}
		>
			{children}
		</Stack>
	)
}

type CallOutProps = {
	children: ReactNode
	backgroundColor: string
}
