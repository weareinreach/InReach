import { Affix, createStyles, rem } from '@mantine/core'
import { ReactTableDevtools as RTDevtools } from '@tanstack/react-table-devtools'
import { type ComponentProps } from 'react'

const useStyles = createStyles((theme) => ({
	panel: {
		'& button': {
			backgroundColor: theme.other.colors.tertiary.darkBlue,
			borderRadius: rem(8),
		},
		// width: '100vw',
		position: 'fixed',
		bottom: 0,
		left: 0,
		right: 0,
		height: rem(464),
		zIndex: 99999,
		'& div:not(:first-of-type) *': { fontSize: `${rem(12)} !important` },
	},
	toggleButton: {
		position: 'fixed',
		bottom: rem(2),
		left: rem(52),
		zIndex: 99998,
	},
}))

type ReactTableDevtoolsProps = ComponentProps<typeof RTDevtools>
export const ReactTableDevtools = ({ table }: ReactTableDevtoolsProps) => {
	const { classes } = useStyles()

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
