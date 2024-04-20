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
import { useTranslation } from 'next-i18next'
import { forwardRef, useCallback, useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Checkbox, Select, TextInput } from 'react-hook-form-mantine'
import { z } from 'zod'

import { generateId } from '@weareinreach/db/lib/idGen'
import { Breadcrumb } from '~ui/components/core/Breadcrumb'
import { Button } from '~ui/components/core/Button'
import { PhoneNumberEntry } from '~ui/components/data-portal/PhoneNumberEntry/withHookForm'
import { useOrgInfo } from '~ui/hooks/useOrgInfo'
import { Icon } from '~ui/icon'
import { trpc as api } from '~ui/lib/trpcClient'

const useStyles = createStyles(() => ({
	drawerContent: {
		borderRadius: `${rem(32)} 0 0 0`,
		minWidth: '40vw',
	},
}))

const FormSchema = z.object({
	id: z.string(),
	number: z.string(),
	ext: z.string().nullish(),
	primary: z.boolean().optional(),
	published: z.boolean(),
	deleted: z.boolean().default(false),
	countryId: z.string(),
	phoneTypeId: z.string().nullable(),
	description: z.string().nullable(),
	locationOnly: z.boolean().optional(),
	serviceOnly: z.boolean().optional(),
	linkLocationId: z.string().nullish(),
})
type FormSchema = z.infer<typeof FormSchema>
const _PhoneDrawer = forwardRef<HTMLButtonElement, PhoneDrawerProps>(
	({ id, createNew = false, ...props }, ref) => {
		const router = useRouter<'/org/[slug]/edit' | '/org/[slug]/[orgLocationId]/edit'>()
		const { t } = useTranslation(['phone-type'])
		const phoneId = useMemo(() => {
			if (createNew || !id) {
				return generateId('orgPhone')
			}
			return id
		}, [createNew, id])
		const { id: orgId } = useOrgInfo()
		const apiUtils = api.useUtils()
		const { data: initialData, isFetching } = api.orgPhone.forEditDrawer.useQuery(
			{ id: phoneId },
			{
				enabled: !!orgId || !createNew,
			}
		)
		const { data: phoneTypes } = api.fieldOpt.phoneTypes.useQuery(undefined, {
			initialData: [],
			select: (data) => data.map(({ id: value, tsKey, tsNs }) => ({ value, label: t(tsKey, { ns: tsNs }) })),
		})
		const [drawerOpened, drawerHandler] = useDisclosure(false)
		const [modalOpened, modalHandler] = useDisclosure(false)

		const { classes } = useStyles()
		const {
			control,
			handleSubmit,
			formState,
			reset,
			getValues,
			watch,
			setValue: setFormValue,
		} = useForm<FormSchema>({
			resolver: zodResolver(FormSchema),
			values: initialData ?? undefined,
			defaultValues: {
				id: '',
				number: '',
				countryId: '',
				description: '',
				published: true,
				deleted: false,
			},
		})
		const { isDirty: formIsDirty } = formState
		const [isSaved, setIsSaved] = useState(formIsDirty)
		const hasLocationId = typeof router.query.orgLocationId === 'string' ? router.query.orgLocationId : null
		const siteUpdate = api.orgPhone.update.useMutation({
			onSettled: (data) => {
				apiUtils.orgPhone.invalidate()
				reset(data)
			},
			onSuccess: () => {
				setIsSaved(true)
				apiUtils.orgPhone.invalidate()
			},
		})
		// const isSaved = /*siteUpdate.isSuccess &&*/ !formState.isDirty
		const unlinkFromLocation = api.orgPhone.locationLink.useMutation({
			onSuccess: () => {
				drawerHandler.close()

				apiUtils.orgPhone.invalidate()
			},
		})
		useEffect(() => {
			if (createNew) {
				setFormValue('published', true)
				if (hasLocationId !== null) {
					setFormValue('linkLocationId', hasLocationId)
				}
			}
		}, [createNew, hasLocationId, setFormValue])
		useEffect(() => {
			if (isSaved && formIsDirty) {
				setIsSaved(false)
			}
		}, [formIsDirty, isSaved])

		const values = {
			phoneTypeId: watch('phoneTypeId'),
		}

		const handleClose = useCallback(() => {
			if (formIsDirty) {
				return modalHandler.open()
			} else {
				return drawerHandler.close()
			}
		}, [drawerHandler, formIsDirty, modalHandler])

		const handleUnlink = useCallback(() => {
			if (hasLocationId === null) {
				return
			}
			unlinkFromLocation.mutate({
				orgPhoneId: phoneId,
				orgLocationId: hasLocationId,
				action: 'unlink',
			})
		}, [hasLocationId, phoneId, unlinkFromLocation])

		const handleSaveButton = useCallback(() => {
			handleSubmit(
				(data) => {
					siteUpdate.mutate({ orgId: orgId ?? '', ...data })
				},
				(error) => console.error(error)
			)
		}, [handleSubmit, orgId, siteUpdate])

		const handleModalSave = useCallback(() => {
			const valuesToSubmit = getValues()
			siteUpdate.mutate(
				{ ...valuesToSubmit, orgId: orgId ?? '' },
				{
					onSuccess: () => {
						modalHandler.close()
						drawerHandler.close()
					},
				}
			)
		}, [drawerHandler, getValues, modalHandler, orgId, siteUpdate])
		const handleCloseNoSave = useCallback(() => {
			reset()
			modalHandler.close()
			drawerHandler.close()
		}, [drawerHandler, modalHandler, reset])

		return (
			<>
				<Drawer.Root onClose={handleClose} opened={drawerOpened} position='right' zIndex={10001} keepMounted>
					<Drawer.Overlay />
					<Drawer.Content className={classes.drawerContent}>
						<form onSubmit={handleSaveButton}>
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
								<LoadingOverlay visible={isFetching && !createNew} />
								<Stack spacing={24} align='center'>
									<Title order={2}>{`${createNew ? 'Add New' : 'Edit'} Phone`}</Title>
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
											data={[
												...phoneTypes,
												{ value: null as unknown as string, label: 'Custom Text (enter below)' },
											]}
										/>
										{values.phoneTypeId === null && (
											<TextInput label='Description' name='description' control={control} />
										)}
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
											onClick={handleModalSave}
										>
											Save
										</Button>
										<Button variant='secondaryLg' onClick={handleCloseNoSave}>
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
_PhoneDrawer.displayName = 'PhoneDrawer'

export const PhoneDrawer = createPolymorphicComponent<'button', PhoneDrawerProps>(_PhoneDrawer)

type PhoneDrawerProps = PhoneDrawerExisting | PhoneDrawerNew

interface PhoneDrawerExisting {
	id: string
	createNew?: never
}
interface PhoneDrawerNew {
	id?: never
	createNew: true
}
