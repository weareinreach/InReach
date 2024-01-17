// import { DevTool } from '@hookform/devtools'
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
import { useTranslation } from 'next-i18next'
import { forwardRef, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Checkbox, Select, TextInput } from 'react-hook-form-mantine'
import { z } from 'zod'

import { Breadcrumb } from '~ui/components/core/Breadcrumb'
import { Button } from '~ui/components/core/Button'
import { PhoneNumberEntry } from '~ui/components/data-portal/PhoneNumberEntry/withHookForm'
import { useOrgInfo } from '~ui/hooks/useOrgInfo'
import { parsePhoneNumber } from '~ui/hooks/usePhoneNumber'
import { Icon } from '~ui/icon'
import { trpc as api } from '~ui/lib/trpcClient'

const useStyles = createStyles((theme) => ({
	drawerContent: {
		borderRadius: `${rem(32)} 0 0 0`,
		minWidth: '40vw',
	},
}))

const FormSchema = z.object({
	id: z.string(),
	number: z.string(),
	ext: z.string().nullish(),
	primary: z.boolean(),
	published: z.boolean(),
	deleted: z.boolean(),
	countryId: z.string(),
	phoneTypeId: z.string().nullable(),
	description: z.string().nullable(),
	locationOnly: z.boolean(),
	serviceOnly: z.boolean(),
})
type FormSchema = z.infer<typeof FormSchema>
const _PhoneDrawer = forwardRef<HTMLButtonElement, PhoneDrawerProps>(({ id, ...props }, ref) => {
	const { t } = useTranslation(['phone-type'])
	const { id: orgId } = useOrgInfo()
	const apiUtils = api.useUtils()
	const { isFetching } = api.orgPhone.forEditDrawer.useQuery(
		{ id },
		{
			select: (data) => ({ ...data, orgId: orgId ?? '' }),
		}
	)
	const { data: phoneTypes } = api.fieldOpt.phoneTypes.useQuery(undefined, {
		initialData: [],
		select: (data) => data.map(({ id, tsKey, tsNs }) => ({ value: id, label: t(tsKey, { ns: tsNs }) })),
	})
	const [drawerOpened, drawerHandler] = useDisclosure(false)
	const [modalOpened, modalHandler] = useDisclosure(false)

	const { classes } = useStyles()
	const { control, handleSubmit, formState, reset, getValues, watch } = useForm<FormSchema>({
		resolver: zodResolver(FormSchema),
		// values: data,
		defaultValues: async () => {
			const data = await apiUtils.orgPhone.forEditDrawer.fetch({ id })
			if (!data) throw new Error('Failed to fetch data')
			const parsedPhone = parsePhoneNumber(data.number, data.country)
			return { ...data, number: parsedPhone?.number ?? data.number }
		},
	})
	const { isDirty: formIsDirty } = formState
	const [isSaved, setIsSaved] = useState(formIsDirty)
	const siteUpdate = api.orgPhone.update.useMutation({
		onSettled: (data) => {
			apiUtils.orgPhone.forEditDrawer.invalidate()
			apiUtils.orgPhone.forContactInfoEdit.invalidate()
			const parsedPhone = parsePhoneNumber(data?.number ?? '')
			reset({ ...data, number: parsedPhone?.number ?? data?.number })
		},
		onSuccess: () => {
			setIsSaved(true)
		},
	})
	// const isSaved = /*siteUpdate.isSuccess &&*/ !formState.isDirty

	useEffect(() => {
		if (isSaved && formIsDirty) {
			setIsSaved(false)
		}
	}, [formIsDirty, isSaved])

	const values = {
		phoneTypeId: watch('phoneTypeId'),
	}

	const handleClose = () => {
		if (formIsDirty) {
			return modalHandler.open()
		} else {
			return drawerHandler.close()
		}
	}
	return (
		<>
			<Drawer.Root
				onClose={handleClose}
				opened={drawerOpened}
				position='right'
				zIndex={10001}
				keepMounted={false}
			>
				<Drawer.Overlay />
				<Drawer.Content className={classes.drawerContent}>
					<form
						onSubmit={handleSubmit(
							(data) => {
								siteUpdate.mutate({ orgId: orgId ?? '', ...data })
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
									disabled={!formIsDirty}
									type='submit'
								>
									{isSaved ? 'Saved' : 'Save'}
								</Button>
							</Group>
						</Drawer.Header>
						<Drawer.Body>
							<LoadingOverlay visible={isFetching} />
							<Stack spacing={24} align='center'>
								<Title order={2}>Edit Phone</Title>
								<Stack spacing={24} align='flex-start' w='100%'>
									<PhoneNumberEntry
										label='Phone Number'
										required
										countrySelect={{ name: 'countryId' }}
										phoneInput={{ name: 'number' }}
										control={control}
									/>
									<Select
										label='Type'
										control={control}
										name='phoneTypeId'
										data={[...phoneTypes, { value: null as unknown as string, label: 'Custom' }]}
									/>
									{values.phoneTypeId === null && (
										<TextInput label='Description' name='description' control={control} />
									)}
									<Stack>
										<Checkbox label='Published' name='published' control={control} />
										<Checkbox label='Deleted' name='deleted' control={control} />
									</Stack>
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
										onClick={() => {
											siteUpdate.mutate(
												{ ...getValues(), orgId: orgId ?? '' },
												{
													onSuccess: () => {
														modalHandler.close()
														drawerHandler.close()
													},
												}
											)
										}}
									>
										Save
									</Button>
									<Button
										variant='secondaryLg'
										onClick={() => {
											reset()
											modalHandler.close()
											drawerHandler.close()
										}}
									>
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
			{/* <DevTool control={control} id={id} styles={{ button: { display: drawerOpened ? 'block' : 'none' } }} /> */}
		</>
	)
})
_PhoneDrawer.displayName = 'PhoneDrawer'

export const PhoneDrawer = createPolymorphicComponent<'button', PhoneDrawerProps>(_PhoneDrawer)

interface PhoneDrawerProps {
	id: string
}
