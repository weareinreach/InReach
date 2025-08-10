import { createStyles, rem } from '@mantine/core'
import { useState } from 'react'

import { Button } from '~ui/components/core/Button'
import { AuditDrawer } from '~ui/components/data-portal/AuditDrawer'
import { InternalNotesDrawer } from '~ui/components/data-portal/InternalNotesDrawer'

const useStyles = createStyles(() => ({
	actionBlock: {
		display: 'flex',
		gap: rem(10),
		paddingRight: rem(20),
	},
}))

export const Action = ({ data }: { data: { id: string; name: string } }) => {
	const [auditOpen, setAuditOpen] = useState(false)
	const [internalOpen, setInternalOpen] = useState(false)
	const { classes } = useStyles()

	// Define the event handlers as separate functions
	const onAuditOpen = () => {
		setAuditOpen(true)
	}

	const onInternalOpen = () => {
		setInternalOpen(true)
	}

	const onAuditClose = () => {
		setAuditOpen(false)
	}

	const onInternalClose = () => {
		setInternalOpen(false)
	}

	return (
		<div className={classes.actionBlock}>
			{/* Pass a reference to the named functions instead of an inline arrow function */}
			<Button variant='secondary' size='small' onClick={onAuditOpen}>
				View activity log
			</Button>
			<Button variant='secondary' size='small' onClick={onInternalOpen}>
				View internal notes
			</Button>
			<AuditDrawer opened={auditOpen} onClose={onAuditClose} recordId={data.id} name={data.name} />
			<InternalNotesDrawer
				opened={internalOpen}
				onClose={onInternalClose}
				recordId={data.id}
				name={data.name}
			/>
		</div>
	)
}
