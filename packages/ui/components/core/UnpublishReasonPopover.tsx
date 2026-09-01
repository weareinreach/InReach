import { Button, Group, Popover, type PopoverProps, Select, Stack, Text, Textarea } from '@mantine/core'
import { type ReactElement, useCallback, useState } from 'react'

import { OrgUnpublishedReason } from '@weareinreach/db/enums'
import { trpc as api } from '~ui/lib/trpcClient'

// First-pass values, pending final sign-off from Abby Davies - see
// docs/DataPortal/2026-Redesign/unpublished-status.md. Exported so the Organizations table's Status
// column/filter can render the same labels without a second copy of this map.
export const REASON_LABELS: Record<OrgUnpublishedReason, string> = {
	[OrgUnpublishedReason.NEW]: 'New',
	[OrgUnpublishedReason.IN_PROGRESS]: 'In progress',
	[OrgUnpublishedReason.WAITING]: 'Waiting to hear back',
	[OrgUnpublishedReason.INACTIVE]: 'Inactive',
	[OrgUnpublishedReason.UNAFFIRMING]: 'Unaffirming',
}

export const REASON_OPTIONS = Object.entries(REASON_LABELS).map(([value, label]) => ({ value, label }))

interface UnpublishReasonPopoverProps {
	slug: string
	currentReason: OrgUnpublishedReason | null | undefined
	/** The trigger element - wrapped in `Popover.Target`, so it should already handle its own styling. */
	children: ReactElement
	position?: PopoverProps['position']
	onSuccess?: () => void
}

/**
 * Shared by the Organizations table's row action and the org edit page's Edit Mode Bar - both unpublish an
 * Organization the same way: pick a reason (required, so picking one IS the unpublish action), plus an
 * optional note. Deliberately one-directional - it never re-publishes. Publishing has a real public
 * consequence (the org becomes searchable again), so that stays a plain instant action on whichever surface
 * already handles it, not something this shared popover offers. See
 * docs/DataPortal/2026-Redesign/unpublished-status.md.
 */
export const UnpublishReasonPopover = ({
	slug,
	currentReason,
	children,
	position = 'bottom-end',
	onSuccess,
}: UnpublishReasonPopoverProps) => {
	const [note, setNote] = useState('')
	const [reason, setReason] = useState<OrgUnpublishedReason | undefined>(
		(currentReason as OrgUnpublishedReason | null) ?? undefined
	)

	const updateStatus = api.component.EditModeBarPublish.useMutation({
		onSuccess: () => onSuccess?.(),
	})

	const handleReasonChange = useCallback(
		(value: string | null) => {
			if (!value) {
				return
			}
			const nextReason = value as OrgUnpublishedReason
			setReason(nextReason)
			updateStatus.mutate({
				slug,
				published: false,
				unpublishedReason: nextReason,
				note: note.trim() || undefined,
			})
		},
		[updateStatus, slug, note]
	)

	const handleSaveNote = useCallback(() => {
		if (!reason) {
			return
		}
		updateStatus.mutate({ slug, published: false, unpublishedReason: reason, note: note.trim() || undefined })
	}, [updateStatus, slug, reason, note])

	return (
		<Popover position={position} withArrow shadow='md'>
			<Popover.Target>{children}</Popover.Target>
			<Popover.Dropdown miw={230}>
				<Stack gap={6}>
					<Select
						label='Set status'
						size='xs'
						placeholder='Choose a reason'
						data={REASON_OPTIONS}
						value={reason ?? null}
						onChange={handleReasonChange}
					/>
					<Textarea
						label='Note (optional)'
						size='xs'
						minRows={2}
						placeholder='e.g. followed up by email on 8/28'
						value={note}
						onChange={(event) => setNote(event.currentTarget.value)}
					/>
					<Group justify='space-between' wrap='nowrap' gap={8}>
						<Text size='xs' c='dimmed'>
							Blank = no note added
						</Text>
						<Button size='xs' variant='subtle' disabled={!reason} onClick={handleSaveNote}>
							Done
						</Button>
					</Group>
				</Stack>
			</Popover.Dropdown>
		</Popover>
	)
}
