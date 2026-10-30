import { Drawer, rem, Stack, Table, Text, Textarea, Title } from '@mantine/core'
import { schemaResolver, useForm } from '@mantine/form'
import { z } from 'zod'

import { Button } from '~ui/components/core/Button'
import { trpc as api } from '~ui/lib/trpcClient'
import { ModalTitle } from '~ui/modals/ModalTitle'

const noteSchema = z.object({ note: z.string().min(1, 'Note cannot be empty') })
type FormFields = z.infer<typeof noteSchema>

/**
 * Change-history notes for a base-URL exception - the `active`/description/baseUrl columns are the row's own
 * static state, but _why_ something changed (deactivated, baseUrl corrected, etc.) belongs here instead, same
 * distinction `InternalNotesDrawer` draws for organizations. Deliberately simpler than that component:
 * invalidates the query on success rather than hand-constructing an optimistic update across ~30 possible
 * link-column fields, which is a lot of fragile surface area for a drawer that isn't on a hot path.
 */
export const OrgUrlExceptionNotesDrawer = ({
	opened,
	onClose,
	exceptionId,
	baseUrl,
}: {
	opened: boolean
	onClose: () => void
	exceptionId: string
	baseUrl: string
}) => {
	const apiUtils = api.useUtils()

	const { data: notes, isLoading } = api.internalNote.getAllForRecord.useQuery(
		{ orgUrlDuplicateExceptionId: exceptionId },
		{ enabled: opened }
	)

	const form = useForm<FormFields>({
		initialValues: { note: '' },
		validate: schemaResolver(noteSchema, { sync: true }),
	})

	const { mutate: createNote, isPending } = api.internalNote.create.useMutation({
		onSuccess: () => {
			apiUtils.internalNote.getAllForRecord.invalidate({ orgUrlDuplicateExceptionId: exceptionId })
			form.reset()
		},
	})

	const sortedNotes = [...(notes ?? [])].sort(
		(a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
	)

	return (
		<Drawer
			opened={opened}
			onClose={onClose}
			position='bottom'
			size='75vh'
			padding='md'
			withCloseButton={false}
			title={<ModalTitle breadcrumb={{ option: 'close', onClick: onClose }} />}
		>
			<Stack align='center' pt={rem(24)}>
				<Title order={3}>Internal Notes</Title>
				<Text size='sm' c='dimmed'>
					{baseUrl}
				</Text>
			</Stack>
			{isLoading ? (
				<Text ta='center' mt='md'>
					Loading notes...
				</Text>
			) : sortedNotes.length === 0 ? (
				<Text ta='center' mt='md'>
					No notes yet.
				</Text>
			) : (
				<Table striped mt='md'>
					<tbody>
						{sortedNotes.map((note) => (
							<tr key={note.id}>
								<td>
									<Text size='sm' fw={500}>
										{note.user?.name ?? 'Unknown User'}
									</Text>
									<Text size='xs' c='dimmed'>
										{new Date(note.createdAt).toLocaleDateString()}
									</Text>
								</td>
								<td>
									<Text size='sm'>{note.text}</Text>
								</td>
							</tr>
						))}
					</tbody>
				</Table>
			)}
			<form
				onSubmit={form.onSubmit((values) =>
					createNote({ text: values.note, orgUrlDuplicateExceptionId: exceptionId })
				)}
			>
				<Stack gap='sm' mt='md'>
					<Textarea
						label='Add a note'
						placeholder='What changed, and why?'
						minRows={3}
						disabled={isPending}
						{...form.getInputProps('note')}
					/>
					<Button variant='secondary' type='submit' loading={isPending}>
						Add Note
					</Button>
				</Stack>
			</form>
		</Drawer>
	)
}
