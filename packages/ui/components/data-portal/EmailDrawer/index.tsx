import { zodResolver } from '@hookform/resolvers/zod'
import {
	Box,
	createPolymorphicComponent,
	createStyles,
	Drawer,
	Group,
	LoadingOverlay,
	Modal,
	rem,
	Stack,
	Text,
	Title,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { useRouter } from 'next/router'
import { forwardRef, useCallback, useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Checkbox, TextInput } from 'react-hook-form-mantine'
import { z } from 'zod'

import { generateId } from '@weareinreach/db/lib/idGen'
import { Breadcrumb } from '~ui/components/core/Breadcrumb'
import { Button } from '~ui/components/core/Button'
import { useNewNotification } from '~ui/hooks/useNewNotification'
import { useOrgInfo } from '~ui/hooks/useOrgInfo'
import { Icon } from '~ui/icon'
import { trpc as api } from '~ui/lib/trpcClient'

const FormSchema = z.object({
	id: z.string(),
	orgId: z.string(),
	firstName: z.string().nullish(),
	lastName: z.string().nullish(),
	primary: z.boolean().optional(),
	email: z.string().email(),
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
const useStyles = createStyles(() => ({
	drawerContent: {
		borderRadius: `${rem(32)} 0 0 0`,
		minWidth: '40vw',
	},
}))
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

		const { data: initialData, isFetching } = api.orgEmail.forEditDrawer.useQuery(
			{ id: emailId },
			{
				enabled: !!orgId && (!!id || !createNew),
				select: (data) => (data ? { ...data, orgId: orgId ?? '' } : data),
			}
		)
		const [drawerOpened, drawerHandler] = useDisclosure(false)
		const [modalOpened, modalHandler] = useDisclosure(false)
		const { classes } = useStyles()
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
			resolver: zodResolver(FormSchema),
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
			onSuccess: (data) => {
				setIsSaved(true)
				apiUtils.orgEmail.invalidate()
				reset(data)
				notifySave()
				modalHandler.close()
				setTimeout(() => drawerHandler.close(), 500)
			},
		})
		const unlinkFromLocation = api.orgEmail.locationLink.useMutation({
			onSuccess: () => apiUtils.orgEmail.invalidate(),
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
			if (formState.isDirty) {
				return modalHandler.open()
			} else {
				return drawerHandler.close()
			}
		}, [formState.isDirty, drawerHandler, modalHandler])

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
								<Group noWrap position='apart' w='100%'>
									<Breadcrumb option='close' onClick={handleClose} />
									<Button
										variant='primary-icon'
										leftIcon={<Icon icon={isSaved ? 'carbon:checkmark' : 'carbon:save'} />}
										loading={emailUpdate.isLoading}
										disabled={!formState.isDirty}
										type='submit'
									>
										{isSaved ? 'Saved' : 'Save'}
									</Button>
								</Group>
							</Drawer.Header>
							<Drawer.Body>
								<LoadingOverlay visible={isFetching && !createNew} />
								<Stack spacing={24} align='center'>
									<Title order={2}>{`${createNew ? 'Add New' : 'Edit'} Email`}</Title>
									<Stack spacing={24} align='flex-start' w='100%'>
										<TextInput label='Email' required name='email' control={control} />
										<Group noWrap>
											<TextInput label='First name' name='firstName' control={control} />
											<TextInput label='Last name' name='lastName' control={control} />
										</Group>

										<TextInput label='Description' name='description' control={control} />
										<Group noWrap position='apart' w='100%'>
											<Stack>
												<Checkbox label='Published' name='published' control={control} />
												<Checkbox label='Deleted' name='deleted' control={control} />
											</Stack>
											{hasLocationId !== null && (
												<Button
													leftIcon={<Icon icon='carbon:unlink' />}
													onClick={handleUnlink}
													disabled={createNew}
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
									<Group noWrap>
										<Button
											variant='primary-icon'
											leftIcon={<Icon icon='carbon:save' />}
											loading={emailUpdate.isLoading}
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
