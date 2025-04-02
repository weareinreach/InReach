import { createStyles, Drawer, rem, Stack, Table, Text, Textarea, Title } from '@mantine/core'
import { useForm, zodResolver } from '@mantine/form'
import { useEffect, useMemo } from 'react'
import { z } from 'zod'

import { Button } from '~ui/components/core/Button'
import { ModalTitle } from '~ui/modals/ModalTitle'

const noteSchema = z.object({
	note: z.string().min(1, 'Note cannot be empty'),
	organizationId: z.string(),
})

const useStyles = createStyles((theme) => ({
	contentContainer: {
		gap: rem(24),
		padding: `${rem(40)} ${rem(64)} ${rem(40)} ${rem(64)}`,
	},
	commentsContainer: {
		display: 'flex',
		gap: rem(40),
		width: '100%',
		alignItems: 'flex-start',
		paddingTop: rem(40),
	},
	commentsTable: {
		flex: 3,
		paddingRight: '20px',
		minHeight: '200px',
		gap: rem(24),
	},
	commentsForm: {
		flex: 1,
		minWidth: '250px',
		gap: rem(24),
	},
}))

const comments = [
	{
		id: 1,
		name: 'John Doe',
		date: '2025-03-15',
		comment: 'This is a sample comment.',
	},
	{
		id: 2,
		name: 'Jane Smith',
		date: '2025-03-14',
		comment: 'Another sample comment.',
	},
]

interface FormFields {
	note: string
	organizationId: string
}

interface InternalNotesDrawerProps {
	opened: boolean
	onClose: () => void
}

export const InternalNotesDrawer: React.FC<InternalNotesDrawerProps> = ({ opened, onClose }) => {
	const { classes } = useStyles()

	const drawerTitle = useMemo(
		() => <ModalTitle breadcrumb={{ option: 'close', onClick: onClose }} maxWidth='100%' />,
		[onClose]
	)

	const form = useForm<FormFields>({
		initialValues: {
			organizationId: '',
			note: '',
		},
		validate: zodResolver(noteSchema),
	})

	// Simulating external data for organization ID
	const status = 'success' // Mock status
	const orgQuery = { id: '123' } // Mock organization ID

	useEffect(() => {
		if (status === 'success' && orgQuery?.id && form.values.organizationId !== orgQuery.id) {
			form.setFieldValue('organizationId', orgQuery.id)
		}
	}, [status, orgQuery?.id, form])

	// Placeholder function for submitting notes
	const submitNote = (values: FormFields) => {
		console.log('Note submitted:', values)
	}

	return (
		<Drawer
			opened={opened}
			onClose={onClose}
			position='bottom'
			size='95vh'
			padding='md'
			withCloseButton={false}
			title={drawerTitle}
		>
			<div className={classes.contentContainer}>
				<Stack style={{ textAlign: 'center', paddingTop: rem(40) }}>
					<Title>Internal Notes</Title>
					<Text>Organization name: Placeholder</Text>
				</Stack>
				<div className={classes.commentsContainer}>
					<div className={classes.commentsTable}>
						<Table striped>
							<tbody>
								{comments.map((comment, index) => (
									<tr key={comment.id}>
										<td>
											<div style={{ display: 'flex', flexDirection: 'column' }}>
												<Text size='sm' weight={500}>
													{comment.name}
												</Text>
												<Text size='xs' color='dimmed'>
													{comment.date}
												</Text>
											</div>
										</td>
										<td>
											<Text size='sm'>{comment.comment}</Text>
										</td>
									</tr>
								))}
							</tbody>
						</Table>
					</div>
					<div className={classes.commentsForm}>
						<form
							onSubmit={form.onSubmit((values) => {
								submitNote(values)
							})}
						>
							<Stack spacing='sm'>
								<Textarea
									label='Add a note'
									placeholder='Enter your note here...'
									{...form.getInputProps('note')}
									minRows={3}
								/>
								<Button variant='secondary' type='submit'>
									Add Note
								</Button>
							</Stack>
						</form>
					</div>
				</div>
			</div>
		</Drawer>
	)
}
