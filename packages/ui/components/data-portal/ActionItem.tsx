import { ActionIcon, Group, Modal, Stack, Text, Tooltip, useMantineTheme } from '@mantine/core'
import { type ReactNode } from 'react'

import { Button } from '~ui/components/core/Button'
import { Icon } from '~ui/icon'

/**
 * Shared shell for a tooltip-labeled icon that opens a confirm modal - originally built for UserTable's four
 * account-recovery actions, now also used by OrgUrlDuplicateExceptionTable. Open/close state is owned by the
 * caller (passed in as props) rather than internally via `useDisclosure` here, so each action's own handlers
 *
 * - Which need to close the modal once a mutation settles - can be real top-level `useCallback`s instead of
 *   arrow functions recreated inline in JSX on every render.
 */
export const ActionItem = ({
	tooltipLabel,
	modalTitle,
	icon,
	opened,
	onOpen,
	onClose,
	children,
}: {
	tooltipLabel: string
	modalTitle: string
	icon: string
	opened: boolean
	onOpen: () => void
	onClose: () => void
	children: ReactNode
}) => {
	const theme = useMantineTheme()

	return (
		<>
			<Modal opened={opened} onClose={onClose} title={modalTitle}>
				{children}
			</Modal>
			<Tooltip multiline maw={240} label={tooltipLabel}>
				<ActionIcon variant='subtle' onClick={onOpen}>
					<Icon icon={icon} color={theme.other.colors.primary.allyGreen} />
				</ActionIcon>
			</Tooltip>
		</>
	)
}

/**
 * The common confirm-dialog body shape: a "when to use"/explanatory line, then the confirm question on its
 * own line, then Yes/No.
 */
export const ConfirmBody = ({
	explanation,
	confirmText,
	isPending,
	onConfirm,
	onCancel,
}: {
	explanation: string
	confirmText: string
	isPending: boolean
	onConfirm: () => void
	onCancel: () => void
}) => (
	// This app defaults Text to `component: 'span'` (inline) app-wide (see theme/common.tsx's Text
	// defaultProps), so two bare sibling <Text> elements flow together with no line break between them.
	// Stack forces each child onto its own line regardless of Text's own inline rendering.
	<Stack gap='sm'>
		<Text size='sm' c='dimmed'>
			{explanation}
		</Text>
		<Text>{confirmText}</Text>
		<Group wrap='nowrap'>
			<Button onClick={onConfirm} loading={isPending}>
				Yes
			</Button>
			<Button variant='secondaryLg' onClick={onCancel}>
				No
			</Button>
		</Group>
	</Stack>
)
