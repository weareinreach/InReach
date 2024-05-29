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

import { type TUpsertSchema, ZUpsertSchema } from '@weareinreach/api/router/orgWebsite/mutation.upsert.schema'
import { generateId } from '@weareinreach/db/lib/idGen'
import { Breadcrumb } from '~ui/components/core/Breadcrumb'
import { Button } from '~ui/components/core/Button'
import { useNewNotification } from '~ui/hooks/useNewNotification'
import { useOrgInfo } from '~ui/hooks/useOrgInfo'
import { Icon } from '~ui/icon'
import { trpc as api } from '~ui/lib/trpcClient'

const useStyles = createStyles(() => ({
	drawerContent: {
		borderRadius: `${rem(32)} 0 0 0`,
		minWidth: '40vw',
	},
}))

const _WebsiteDrawer = forwardRef<HTMLButtonElement, WebsiteDrawerProps>(
	({ id, createNew, ...props }, ref) => {
		const router = useRouter<'/org/[slug]/edit' | '/org/[slug]/[orgLocationId]/edit'>()
		const hasLocationId = typeof router.query.orgLocationId === 'string' ? router.query.orgLocationId : null
		const { id: organizationId } = useOrgInfo()
		const websiteId = useMemo(() => {
			if (createNew || !id) {
				return generateId('orgWebsite')
			}
			return id
		}, [createNew, id])

		const { data: websiteData, isFetching } = api.orgWebsite.forEditDrawer.useQuery(
			{ id: websiteId },
			{
				enabled: !createNew,
				// select: (returnedData) => ({
				// 	...returnedData,
				// 	...(createNew && hasLocationId && { orgLocationId: hasLocationId }),
				// }),
			}
		)
		const [drawerOpened, drawerHandler] = useDisclosure(false)
		const [modalOpened, modalHandler] = useDisclosure(false)
		const { classes } = useStyles()
		const {
			control,
			handleSubmit,
			formState,
			reset,
			getValues,
			setValue: setFormValue,
		} = useForm<TUpsertSchema>({
			resolver: zodResolver(ZUpsertSchema),
			values:
				websiteData && organizationId
					? {
							...websiteData,
							operation: createNew ? 'create' : 'update',
							orgLocationId: hasLocationId,
							organizationId: websiteData.organizationId ?? organizationId,
						}
					: undefined,
			defaultValues: {
				operation: 'create',
				orgLocationId: hasLocationId ?? '',
				organizationId: organizationId ?? '',
				url: '',
				published: true,
				deleted: false,
			},
		})
		const apiUtils = api.useUtils()

		const notifySave = useNewNotification({ displayText: 'Saved', icon: 'success' })

		const { isDirty: formIsDirty } = formState
		const [isSaved, setIsSaved] = useState(formIsDirty)

		const siteUpdate = api.orgWebsite.upsert.useMutation({
			onSettled: () => {
				apiUtils.orgWebsite.invalidate()
			},
			onSuccess: () => {
				setIsSaved(true)
				notifySave()
				modalHandler.close()
				setTimeout(() => drawerHandler.close(), 500)
				reset({ id: generateId('orgWebsite') })
			},
		})

		const unlinkFromLocation = api.orgWebsite.locationLink.useMutation({
			onSuccess: () => apiUtils.orgWebsite.invalidate(),
		})
		useEffect(() => {
			console.log('useEffect', { createNew, hasLocationId, organizationId })

			if (createNew && organizationId) {
				setFormValue('published', true)
				setFormValue('organizationId', organizationId)
				if (hasLocationId !== null) {
					setFormValue('orgLocationId', hasLocationId)
				}
			}
		}, [createNew, hasLocationId, setFormValue, organizationId])
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

		const handleUnlink = useCallback(
			() =>
				hasLocationId &&
				unlinkFromLocation.mutate({
					orgWebsiteId: websiteId,
					orgLocationId: hasLocationId,
					action: 'unlink',
				}),
			[unlinkFromLocation, websiteId, hasLocationId]
		)

		const handleSaveFromModal = useCallback(() => {
			const valuesToSubmit = getValues()
			siteUpdate.mutate({ id: websiteId, ...valuesToSubmit })
		}, [getValues, siteUpdate, websiteId])

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
									siteUpdate.mutate({ id: websiteId, ...data })
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
										loading={siteUpdate.isLoading}
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
									<Title order={2}>{`${createNew ? 'Add New' : 'Edit'} Website`}</Title>
									<Stack spacing={24} align='flex-start' w='100%'>
										<TextInput label='Website URL' required name='url' type='url' control={control} />
										{/* <TextInput label='Description' name='description' control={control} /> */}
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
											loading={siteUpdate.isLoading}
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
_WebsiteDrawer.displayName = 'WebsiteDrawer'

export const WebsiteDrawer = createPolymorphicComponent<'button', WebsiteDrawerProps>(_WebsiteDrawer)
WebsiteDrawer.whyDidYouRender = true
type WebsiteDrawerProps = WebsiteExisting | WebsiteNew

interface WebsiteExisting {
	id: string
	createNew?: never
}
interface WebsiteNew {
	id?: never
	createNew: true
}
