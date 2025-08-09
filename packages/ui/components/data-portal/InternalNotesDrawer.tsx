import { createStyles, Drawer, rem, Stack, Table, Text, Textarea, Title } from '@mantine/core'
import { useForm, zodResolver } from '@mantine/form'
import { useSession } from 'next-auth/react'
import { useEffect, useMemo } from 'react'
import { z } from 'zod'

import { Button } from '~ui/components/core/Button'
import { trpc as api } from '~ui/lib/trpcClient'
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
		display: 'flex',
		flexDirection: 'column',
	},
	commentsForm: {
		flex: 1,
		minWidth: '250px',
		gap: rem(24),
	},
	drawerTitleWrapper: {
		maxWidth: '100% !important',

		[`& div.mantine-Group-root > div:first-of-type`]: {
			maxWidth: '100% !important',
		},
	},
	scrollableNotes: {
		maxHeight: '400px',
		overflow: 'auto',
	},
}))

interface FormFields {
	note: string
	organizationId: string
}

export const InternalNotesDrawer = ({
	opened,
	onClose,
	recordId,
	name,
}: {
	opened: boolean
	onClose: () => void
	recordId: string
	name: string
}) => {
	const { classes } = useStyles()
	const apiUtils = api.useUtils()
	const { data: session } = useSession()
	const userId = session?.user?.id
	const userName = session?.user?.name

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

	const {
		data: allNotes,
		isLoading: isNotesLoading,
		error: notesError,
	} = api.internalNote.getAllForRecord.useQuery(
		{
			organizationId: recordId,
		},
		{
			enabled: !!recordId,
		}
	)

	const { mutate: createNote, isLoading: isCreatingNote } = api.internalNote.create.useMutation({
		onSuccess: (newNote, variables) => {
			if (!variables.organizationId) {
				return
			}

			const currentNotes =
				apiUtils.internalNote.getAllForRecord.getData({ organizationId: variables.organizationId }) || []

			const newNoteWithUser = {
				...newNote,
				text: variables.text,
				organizationId: variables.organizationId,
				user: {
					name: userName,
				},
				userId: userId,
				createdAt: new Date(),
				updatedAt: new Date(),
				legacyId: null,
				attributeId: null,
				attributeCategoryId: null,
				attributeSupplementId: null,
				attributeSupplementDataSchemaId: null,
				countryId: null,
				govDistId: null,
				govDistTypeId: null,
				languageId: null,
				orgEmailId: null,
				orgHoursId: null,
				orgLocationId: null,
				orgPhoneId: null,
				orgPhotoId: null,
				orgReviewId: null,
				orgServiceId: null,
				orgSocialMediaId: null,
				orgWebsiteId: null,
				outsideApiId: null,
				outsideAPIServiceService: null,
				permissionId: null,
				phoneTypeId: null,
				serviceCategoryId: null,
				serviceTagId: null,
				socialMediaLinkId: null,
				socialMediaServiceId: null,
				sourceId: null,
				suggestionId: null,
				translationKey: null,
				translationNs: null,
				translationNamespaceName: null,
			}

			apiUtils.internalNote.getAllForRecord.setData({ organizationId: variables.organizationId }, [
				...currentNotes,
				newNoteWithUser,
			])

			form.reset()
		},
	})

	useEffect(() => {
		if (recordId && form.values.organizationId !== recordId) {
			form.setFieldValue('organizationId', recordId)
		}
	}, [recordId, form])

	const handleSubmitNote = (values: FormFields) => {
		createNote({
			text: values.note,
			organizationId: values.organizationId,
		})
	}

	const notesToRender = allNotes || []
	const sortedNotes = [...notesToRender].sort((a, b) => {
		const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0
		const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0
		return dateB - dateA
	})
	return (
		<Drawer
			opened={opened}
			onClose={onClose}
			position='bottom'
			size='95vh'
			padding='md'
			withCloseButton={false}
			title={drawerTitle}
			classNames={{
				title: classes.drawerTitleWrapper,
			}}
		>
			<div className={classes.contentContainer}>
				<Stack style={{ textAlign: 'center', paddingTop: rem(40) }}>
					<Title>Internal Notes</Title>
					<Text>Organization name: {name}</Text>
					<Text>Organization id: {recordId}</Text>
				</Stack>
				<div className={classes.commentsContainer}>
					<div className={classes.commentsTable}>
						{isNotesLoading ? (
							<Text align='center'>Loading notes...</Text>
						) : sortedNotes.length === 0 ? (
							<Text align='center'>No notes found for this organization.</Text>
						) : notesError ? (
							<Text color='red' align='center'>
								Error loading notes.
							</Text>
						) : (
							<div className={classes.scrollableNotes}>
								<Table striped>
									<tbody>
										{sortedNotes.map((note) => (
											<tr key={note.id}>
												<td>
													<div style={{ display: 'flex', flexDirection: 'column' }}>
														<Text size='sm' weight={500}>
															{note.user?.name || 'Unknown User'}
														</Text>
														<Text size='xs' color='dimmed'>
															{note.createdAt ? new Date(note.createdAt).toLocaleDateString() : ''}
														</Text>
													</div>
												</td>
												<td>
													<Text size='sm'>{note.text}</Text>
												</td>
											</tr>
										))}
									</tbody>
								</Table>
							</div>
						)}
					</div>
					<div className={classes.commentsForm}>
						<form
							onSubmit={form.onSubmit((values) => {
								handleSubmitNote(values)
							})}
						>
							<Stack spacing='sm'>
								<Textarea
									label='Add a note'
									placeholder='Enter your note here...'
									{...form.getInputProps('note')}
									minRows={3}
									disabled={isCreatingNote}
								/>
								<Button variant='secondary' type='submit' loading={isCreatingNote}>
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
