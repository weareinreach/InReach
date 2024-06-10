import { zodResolver } from '@hookform/resolvers/zod'
import { Box, Drawer, Group, Modal, Stack, Text, Title } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { useTranslation } from 'next-i18next'
import { forwardRef, useCallback, useEffect, useState } from 'react'
import { FormProvider, useForm, useWatch } from 'react-hook-form'
import { Checkbox, Select, TextInput } from 'react-hook-form-mantine'

import { type TCreateSchema, ZCreateSchema } from '@weareinreach/api/router/location/mutation.create.schema'
import { Breadcrumb } from '~ui/components/core/Breadcrumb'
import { Button, type ButtonProps } from '~ui/components/core/Button'
import { AddressAutocomplete } from '~ui/components/data-portal/AddressAutocomplete'
import { useNewNotification } from '~ui/hooks/useNewNotification'
import { useOrgInfo } from '~ui/hooks/useOrgInfo'
import { Icon } from '~ui/icon'
import { trpc as api } from '~ui/lib/trpcClient'

export const LocationDrawer = forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
	const { id: orgId } = useOrgInfo()
	const notifySave = useNewNotification({ displayText: 'Location has been created', icon: 'success' })
	const apiUtils = api.useUtils()
	const { i18n } = useTranslation()
	const countryTranslation = new Intl.DisplayNames(i18n.language, { type: 'region' })
	const [isSaved, setIsSaved] = useState(false)
	const [drawerOpened, drawerHandler] = useDisclosure(false)
	const [modalOpened, modalHandler] = useDisclosure(false)
	const form = useForm<TCreateSchema>({
		resolver: zodResolver(ZCreateSchema),
	})
	const { data: govDistsByCountry } = api.fieldOpt.govDistsByCountryNoSub.useQuery(
		{ activeForOrgs: true },
		{
			refetchOnWindowFocus: false,
			select: (results) =>
				results.map(({ id, flag, cca2 }) => ({
					flag,
					value: id,
					label: countryTranslation.of(cca2) ?? cca2,
				})),
		}
	)
	const createLocation = api.location.create.useMutation({
		onSuccess: () => {
			modalHandler.close()
			apiUtils.location.invalidate()
			apiUtils.organization.invalidate()
			setIsSaved(true)
			notifySave()
			setTimeout(() => drawerHandler.close(), 500)
			form.reset()
		},
	})
	useEffect(() => {
		const formValues = form.getValues()
		if (orgId && formValues.orgId !== orgId) {
			form.setValue('orgId', orgId)
		}
	}, [form, orgId])

	const isNotVisitable = useWatch({ control: form.control }).notVisitable
	const handleSave = useCallback(() => {
		const valuesToSubmit = form.getValues()
		createLocation.mutate(valuesToSubmit)
	}, [createLocation, form])

	const handleCloseAndDiscard = useCallback(() => {
		form.reset()
		modalHandler.close()
		drawerHandler.close()
	}, [form, modalHandler, drawerHandler])

	useEffect(() => {
		const hasAddress = Object.keys(form.getValues('address') ?? {}).length > 0
		const countryId = form.getValues('address.countryId')
		if (isNotVisitable && hasAddress) {
			const blankAddress = {
				street1: undefined,
				street2: undefined,
				city: undefined,
				postCode: undefined,
				govDistId: undefined,
				longitude: undefined,
				latitude: undefined,
				countryId,
			}
			form.setValue('address', blankAddress)
		}
		if (isNotVisitable && countryId) {
			form.setValue('address.countryId', countryId)
		}
	}, [form, isNotVisitable])

	const handleClose = useCallback(() => {
		if (form.formState.isDirty) {
			return modalHandler.open()
		} else {
			return drawerHandler.close()
		}
	}, [drawerHandler, form.formState.isDirty, modalHandler])

	return (
		<FormProvider {...form}>
			<Drawer.Root onClose={handleClose} opened={drawerOpened} position='right'>
				<Drawer.Overlay />
				<Drawer.Content>
					<Drawer.Header>
						<Group noWrap position='apart' w='100%'>
							<Breadcrumb option='close' onClick={handleClose} />
							<Button
								variant='primary-icon'
								leftIcon={<Icon icon={isSaved ? 'carbon:checkmark' : 'carbon:save'} />}
								onClick={handleSave}
								loading={createLocation.isLoading}
								disabled={!form.formState.isDirty}
							>
								Save
							</Button>
						</Group>
					</Drawer.Header>
					<Drawer.Body>
						<Stack spacing={24} align='center'>
							<Title order={2}>Add new location</Title>

							<TextInput label='Display name' required control={form.control} name='name' />

							<Checkbox label='This location is NOT visitable' control={form.control} name='notVisitable' />
							{!isNotVisitable ? (
								<AddressAutocomplete name='address' />
							) : (
								<Select
									control={form.control}
									name='address.countryId'
									label='Country'
									data={govDistsByCountry ?? []}
								/>
							)}
						</Stack>
					</Drawer.Body>
					<Modal opened={modalOpened} onClose={modalHandler.close} title='Unsaved Changes' zIndex={10002}>
						<Stack align='center'>
							<Text>You have unsaved changes</Text>
							<Group noWrap>
								<Button
									variant='primary-icon'
									leftIcon={<Icon icon='carbon:save' />}
									loading={createLocation.isLoading}
									onClick={handleSave}
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
