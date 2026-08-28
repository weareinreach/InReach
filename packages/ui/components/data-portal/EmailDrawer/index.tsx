import { zodResolver } from '@hookform/resolvers/zod'
import {
	Box,
	createPolymorphicComponent,
	Drawer,
	Group,
	LoadingOverlay,
	Modal,
	Stack,
	Text,
	Title,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { useRouter } from 'next/router'
import { forwardRef, useCallback, useEffect, useMemo, useState } from 'react'
import { type Resolver, useForm } from 'react-hook-form'
import { Checkbox, TextInput } from 'react-hook-form-mantine'
import { z } from 'zod'

import { generateId } from '@weareinreach/db/lib/idGen'
import { Breadcrumb } from '~ui/components/core/Breadcrumb'
import { Button } from '~ui/components/core/Button'
import { useNewNotification } from '~ui/hooks/useNewNotification'
import { useOrgInfo } from '~ui/hooks/useOrgInfo'
import { Icon } from '~ui/icon'
import { trpc as api } from '~ui/lib/trpcClient'

import classes from './index.module.css'

const FormSchema = z.object({
	id: z.string(),
	orgId: z.string(),
	firstName: z.string().nullish(),
	lastName: z.string().nullish(),
	primary: z.boolean().optional(),
	email: z.email(),
	published: z.boolean().default(true),
	deleted: z.boolean().default(false),
	titleId: z.string().nullish(),
	locationOnly: z.boolean().default(false),
	serviceOnly: z.boolean().default(false),
	description: z.string().nullish(),
	descriptionId: z.string().nullish(),
	linkLocationId: z.string().nullish(),
})
type FormSchema = z.infer<typeof FormSchema>
export const _EmailDrawer = forwardRef<HTMLButtonElement, EmailDrawerProps>(
	({ id, createNew, ...props }, ref) => {
		const router = useRouter<'/org/[slug]/edit' | '/org/[slug]/[orgLocationId]/edit'>()
		const emailId = useMemo(() => {
			if (createNew || !id) {
				return generateId('orgEmail')
			}
			return id
		}, [createNew, id])
		const { id: orgId } = useOrgInfo()

		const hasLocationId = typeof router.query.orgLocationId === 'string' ? router.query.orgLocationId : null

		const [drawerOpened, drawerHandler] = useDisclosure(false)
		const [modalOpened, modalHandler] = useDisclosure(false)
		const { data: initialData, isFetching } = api.orgEmail.forEditDrawer.useQuery(
			{ id: emailId },
			{
				enabled: drawerOpened && !!orgId && (!!id || !createNew),
				select: (data) => (data ? { ...data, orgId: orgId ?? '' } : data),
			}
		)
		const apiUtils = api.useUtils()
		const notifySave = useNewNotification({ displayText: 'Saved', icon: 'success' })

		const {
			control,
			handleSubmit,
			formState,
			reset,
			getValues,
			setValue: setFormValue,
		} = useForm<FormSchema>({
			resolver: zodResolver(FormSchema) as Resolver<FormSchema>,
			values: initialData ?? undefined,
			defaultValues: {
				id: emailId,
				published: true,
				deleted: false,
				linkLocationId: hasLocationId,
			},
		})
		useEffect(() => {
			const formValues = getValues()
			if (!formValues.orgId && orgId) {
				setFormValue('orgId', orgId)
			}
		}, [getValues, orgId, setFormValue])

		const { isDirty: formIsDirty } = formState
		const [isSaved, setIsSaved] = useState(formIsDirty)

		const emailUpdate = api.orgEmail.update.useMutation({
			onSettled: () => {
				apiUtils.orgEmail.forContactInfoEdit.invalidate()
				apiUtils.orgEmail.forContactInfo.invalidate()
				// This drawer's own detail query is keyed by this specific email id - without
				// marking it stale too, reopening this same email later would show the pre-save
				// data, making a second edit silently start from a stale field state instead of
				// what was just saved. `refetchType: 'none'` marks it stale for next time without
				// forcing an immediate refetch here - nothing is displaying this query while the
				// drawer is closed, and forcing one batches it alongside the forContactInfoEdit
				// refetch above in a way that ends up blocking that one from reaching the list.
				apiUtils.orgEmail.forEditDrawer.invalidate({ id: emailId }, { refetchType: 'none' })
			},
			onSuccess: (data) => {
				setIsSaved(true)
				reset(data)
				notifySave()
				modalHandler.close()
				setTimeout(() => drawerHandler.close(), 500)
			},
		})
		const unlinkFromLocation = api.orgEmail.locationLink.useMutation({
			onSuccess: () => {
				apiUtils.orgEmail.forContactInfoEdit.invalidate()
			},
		})
		// useEffect(() => {
		// 	if (createNew && orgId) {
		// 		setFormValue('published', true)
		// 		setFormValue('orgId', orgId)
		// 		setFormValue('id', emailId)
		// 		hasLocationId && setFormValue('linkLocationId', hasLocationId)
		// 	}
		// }, [createNew, hasLocationId, setFormValue, orgId, emailId])
		useEffect(() => {
			if (isSaved && formIsDirty) {
				setIsSaved(false)
			}
		}, [formIsDirty, isSaved])
		const handleClose = useCallback(() => {
			if (formIsDirty) {
				return modalHandler.open()
			} else {
				return drawerHandler.close()
			}
		}, [formIsDirty, drawerHandler, modalHandler])

		const handleUnlink = useCallback(() => {
			if (hasLocationId) {
				unlinkFromLocation.mutate({
					orgEmailId: emailId,
					orgLocationId: hasLocationId,
					action: 'unlink',
				})
			}
		}, [emailId, hasLocationId, unlinkFromLocation])

		const handleSaveFromModal = useCallback(() => {
			const valuesToSubmit = getValues()
			emailUpdate.mutate(valuesToSubmit)
		}, [emailUpdate, getValues])

		const handleCloseAndDiscard = useCallback(() => {
			reset()
			modalHandler.close()
			drawerHandler.close()
		}, [reset, modalHandler, drawerHandler])

		return (
			<>
				<Drawer.Root onClose={handleClose} opened={drawerOpened} position='right' zIndex={10001} keepMounted>
					<Drawer.Overlay />
					<Drawer.Content className={classes.drawerContent}>
						<form
							onSubmit={handleSubmit(
								(data) => {
									emailUpdate.mutate(data)
								},
								(error) => console.error(error)
							)}
						>
							<Drawer.Header>
								<Group wrap='nowrap' justify='space-between' w='100%'>
									<Breadcrumb option='close' onClick={handleClose} />
									<Button
										variant='primary-icon'
										leftIcon={<Icon icon={isSaved ? 'carbon:checkmark' : 'carbon:save'} />}
										loading={emailUpdate.isPending}
										disabled={!formIsDirty}
										type='submit'
									>
										{isSaved ? 'Saved' : 'Save'}
									</Button>
								</Group>
							</Drawer.Header>
							<Drawer.Body>
								<LoadingOverlay visible={isFetching && !createNew} />
								<Stack gap={24} align='center'>
									<Title order={2}>{`${createNew ? 'Add New' : 'Edit'} Email`}</Title>
									<Stack gap={24} align='flex-start' w='100%'>
										<TextInput label='Email' required name='email' control={control} />
										<Group wrap='nowrap'>
											<TextInput label='First name' name='firstName' control={control} />
											<TextInput label='Last name' name='lastName' control={control} />
										</Group>

										<TextInput label='Description' name='description' control={control} />
										<Group wrap='nowrap' justify='space-between' w='100%'>
											<Stack>
												<Checkbox label='Published' name='published' control={control} />
												<Checkbox label='Deleted' name='deleted' control={control} />
											</Stack>
											{hasLocationId !== null && (
												<Button
													leftIcon={<Icon icon='carbon:unlink' />}
													onClick={handleUnlink}
													disabled={createNew}
													// Button's root has `overflow: hidden` (for its loading-state
													// pseudo-element), which zeroes its flexbox automatic minimum
													// size - without this, the surrounding `justify='space-between'`
													// Group was free to shrink it below its label's width, silently
													// clipping the text instead of holding its size.
													style={{ flexShrink: 0 }}
												>
													Unlink from this location
												</Button>
											)}
										</Group>
									</Stack>
								</Stack>
							</Drawer.Body>
							<Modal opened={modalOpened} onClose={modalHandler.close} title='Unsaved Changes' zIndex={10002}>
								<Stack align='center'>
									<Text>You have unsaved changes</Text>
									<Group wrap='nowrap'>
										<Button
											variant='primary-icon'
											leftIcon={<Icon icon='carbon:save' />}
											loading={emailUpdate.isPending}
											onClick={handleSaveFromModal}
										>
											Save
										</Button>
										<Button variant='secondaryLg' onClick={handleCloseAndDiscard}>
											Discard
										</Button>
									</Group>
								</Stack>
							</Modal>
						</form>
					</Drawer.Content>
				</Drawer.Root>
				<Stack>
					<Box component='button' onClick={drawerHandler.open} ref={ref} {...props} />
				</Stack>
			</>
		)
	}
)
_EmailDrawer.displayName = 'EmailDrawer'

export const EmailDrawer = createPolymorphicComponent<'button', EmailDrawerProps>(_EmailDrawer)

type EmailDrawerProps = EmailDrawerExisting | EmailDrawerNew
interface EmailDrawerExisting {
	id: string
	createNew?: never
}
interface EmailDrawerNew {
	id?: never
	createNew: true
}
