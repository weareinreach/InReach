import { zodResolver } from '@hookform/resolvers/zod'
import { Box, Drawer, Group, Modal, Stack, Text, Title } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { forwardRef, useCallback, useEffect, useState } from 'react'
import { FormProvider, useForm, useWatch } from 'react-hook-form'
import { Select, TextInput } from 'react-hook-form-mantine'

import { type TCreateSchema, ZCreateSchema } from '@weareinreach/api/router/location/mutation.create.schema'
import { AddressVisibility } from '@weareinreach/db/enums'
import { Breadcrumb } from '~ui/components/core/Breadcrumb'
import { Button, type ButtonProps } from '~ui/components/core/Button'
import { AddressAutocomplete } from '~ui/components/data-portal/AddressAutocomplete'
import { useNewNotification } from '~ui/hooks/useNewNotification'
import { useOrgInfo } from '~ui/hooks/useOrgInfo'
import { Icon } from '~ui/icon'
import { trpc as api } from '~ui/lib/trpcClient'

const addressVisibilityOptions: { value: AddressVisibility; label: string }[] = [
	{ value: AddressVisibility.FULL, label: 'Show full address' },
	{ value: AddressVisibility.PARTIAL, label: 'Show city & state/province' },
	{ value: AddressVisibility.HIDDEN, label: 'Hide address' },
]

const WatchedAddressAutocomplete = () => {
	const addressVisibility = useWatch<TCreateSchema>({ name: 'addressVisibility' })
	// @ts-expect-error trust the address visibility
	return <AddressAutocomplete name='address' addressVisibility={addressVisibility} />
}

export const LocationDrawer = forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
	const { id: orgId } = useOrgInfo()
	const notifySave = useNewNotification({ displayText: 'Location has been created', icon: 'success' })
	const apiUtils = api.useUtils()

	const [isSaved, setIsSaved] = useState(false)
	const [drawerOpened, drawerHandler] = useDisclosure(false)
	const [modalOpened, modalHandler] = useDisclosure(false)
	const form = useForm<TCreateSchema>({
		resolver: zodResolver(ZCreateSchema),
		mode: 'onChange',
		defaultValues: {
			name: '',
			addressVisibility: AddressVisibility.FULL, //
			orgId,
		},
	})
	const createLocation = api.location.create.useMutation({
		onSuccess: () => {
			modalHandler.close()
			apiUtils.location.invalidate()
			apiUtils.organization.invalidate()
			setIsSaved(true)
			notifySave()
			setTimeout(() => drawerHandler.close(), 500)
			form.reset({
				name: '',
				addressVisibility: AddressVisibility.FULL,
				orgId,
			})
		},
	})

	const handleSave = (values: TCreateSchema) => {
		createLocation.mutate(values)
	}

	const handleCloseAndDiscard = useCallback(() => {
		form.reset()
		modalHandler.close()
		drawerHandler.close()
	}, [form, modalHandler, drawerHandler])

	const handleClose = useCallback(() => {
		if (form.formState.isDirty) {
			return modalHandler.open()
		} else {
			return drawerHandler.close()
		}
	}, [drawerHandler, form.formState.isDirty, modalHandler])

	useEffect(() => {
		if (drawerOpened) {
			form.reset({
				name: '',
				addressVisibility: AddressVisibility.FULL,
				orgId,
			})
		}
	}, [drawerOpened, form, orgId])

	return (
		<FormProvider {...form}>
			<Drawer.Root onClose={handleClose} opened={drawerOpened} position='right'>
				<Drawer.Overlay />
				<Drawer.Content>
					<Drawer.Header>
						<Group noWrap position='apart' w='100%'>
							<Breadcrumb option='close' onClick={handleClose} />
							<Button
								variant='primary'
								leftIcon={<Icon icon={isSaved ? 'carbon:checkmark' : 'carbon:save'} />}
								onClick={form.handleSubmit(handleSave)}
								loading={createLocation.isLoading}
								disabled={!form.formState.isDirty || !form.formState.isValid}
							>
								Save
							</Button>
						</Group>
					</Drawer.Header>
					<Drawer.Body>
						<Stack spacing={24} align='center'>
							<Title order={2}>Add new location</Title>

							<TextInput label='Display name' required control={form.control} name='name' />
							<Select
								label='Address visibility to public'
								control={form.control}
								name='addressVisibility'
								data={addressVisibilityOptions}
							/>
							<WatchedAddressAutocomplete />
						</Stack>
					</Drawer.Body>
					<Modal opened={modalOpened} onClose={modalHandler.close} title='Unsaved Changes' zIndex={10002}>
						<Stack align='center'>
							<Text>You have unsaved changes</Text>
							<Group noWrap>
								<Button
									variant='primary-icon'
									leftIcon={<Icon icon='carbon:save' />}
									loading={createLocation.isLoading} // This should be form.handleSubmit(handleSave)
									onClick={form.handleSubmit(handleSave)}
								>
									Save
								</Button>
								<Button variant='secondaryLg' onClick={handleCloseAndDiscard}>
									Discard
								</Button>
							</Group>
						</Stack>
					</Modal>
				</Drawer.Content>
			</Drawer.Root>
			<Box component={Button} onClick={drawerHandler.open} ref={ref} {...props} />
		</FormProvider>
	)
})
LocationDrawer.displayName = 'LocationDrawer'
