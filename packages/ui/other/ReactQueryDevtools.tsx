import { rem } from '@mantine/core'
import { ReactTableDevtools as RTDevtools } from '@tanstack/react-table-devtools'
import { type ComponentProps } from 'react'

import classes from './ReactQueryDevtools.module.css'

type ReactTableDevtoolsProps = ComponentProps<typeof RTDevtools>
export const ReactTableDevtools = ({ table }: ReactTableDevtoolsProps) => {
	return (
		<RTDevtools
			table={table}
			toggleButtonProps={{ style: { margin: 12 }, className: classes.toggleButton }}
			containerElement='aside'
			panelProps={{
				className: classes.panel,
				style: { position: 'fixed', bottom: 0, left: 0, right: 0, height: rem(464), zIndex: 99999 },
			}}
		/>
	)
}
