import { useState } from 'react'

import { Button } from '~ui/components/core/Button'
import { AuditDrawer } from '~ui/components/data-portal/AuditDrawer'
import { InternalNotesDrawer } from '~ui/components/data-portal/InternalNotesDrawer'

import classes from './Action.module.css'

export const Action = ({ data }: { data: { id: string; name: string } }) => {
	const [auditOpen, setAuditOpen] = useState(false)
	const [internalOpen, setInternalOpen] = useState(false)

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
			<Button variant='secondary' size='small' onClick={onAuditOpen}>
				View activity log
			</Button>
			<Button variant='secondary' size='small' onClick={onInternalOpen}>
				View internal notes
			</Button>
			{auditOpen && (
				<AuditDrawer opened={auditOpen} onClose={onAuditClose} recordId={data.id} name={data.name} />
			)}
			{internalOpen && (
				<InternalNotesDrawer
					opened={internalOpen}
					onClose={onInternalClose}
					recordId={data.id}
					name={data.name}
				/>
			)}
		</div>
	)
}
