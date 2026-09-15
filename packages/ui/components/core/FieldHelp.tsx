import { Group, Tooltip } from '@mantine/core'
import { type ReactNode } from 'react'

import { Icon } from '~ui/icon'

interface FieldHelpProps {
	help: string
	label?: ReactNode
	w?: number
}

export const FieldHelp = ({ help, label, w = 260 }: FieldHelpProps) => (
	<Group gap={4} wrap='nowrap' component='span' align='center'>
		{label}
		<Tooltip label={help} multiline w={w} withArrow>
			<Icon icon='carbon:information' width={14} height={14} style={{ cursor: 'help' }} />
		</Tooltip>
	</Group>
)
