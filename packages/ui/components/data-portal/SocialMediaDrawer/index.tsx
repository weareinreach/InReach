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
import { useDebouncedValue, useDisclosure } from '@mantine/hooks'
import { useRouter } from 'next/router'
import {
	type ComponentPropsWithoutRef,
	forwardRef,
	type ReactElement,
	useCallback,
	useEffect,
	useMemo,
	useState,
} from 'react'
import { useForm } from 'react-hook-form'
import { Checkbox, Select, TextInput } from 'react-hook-form-mantine'
import SocialLinks from 'social-links'
import { z } from 'zod'

import { prefixedId } from '@weareinreach/api/schemas/idPrefix'
import { generateId } from '@weareinreach/db/lib/idGen'
import { Breadcrumb } from '~ui/components/core/Breadcrumb'
import { Button } from '~ui/components/core/Button'
import { useNewNotification } from '~ui/hooks/useNewNotification'
import { useOrgInfo } from '~ui/hooks/useOrgInfo'
import { Icon } from '~ui/icon'
import { trpc as api } from '~ui/lib/trpcClient'

const socialLinkValidator = new SocialLinks()

const useStyles = createStyles(() => ({
	drawerContent: {
		borderRadius: `${rem(32)} 0 0 0`,
		minWidth: '40vw',
	},
}))

const FormSchema = z.object({
	id: prefixedId('orgSocialMedia'),
	username: z.string(),
	url: z.string(),
	published: z.boolean().default(true),
	deleted: z.boolean().default(false),
	serviceId: z.string(),
	organizationId: prefixedId('organization').nullable(),
	orgLocationOnly: z.boolean().default(false),
	service: z
		.object({
			id: prefixedId('socialMediaService'),
			name: z.string(),
			logoIcon: z.string(),
		})
		.optional(),
	orgLocationId: z.string().nullish(),
})
type FormSchema = z.infer<typeof FormSchema>
interface ItemProps extends ComponentPropsWithoutRef<'div'> {
	value: string
	label: string
	icon: ReactElement
}
const SelectItem = forwardRef<HTMLDivElement, ItemProps>(({ value: _value, label, icon, ...props }, ref) => (
	<div ref={ref} {...props}>
		<Group noWrap spacing={12}>
			{icon} {label}
		</Group>
	</div>
))
SelectItem.displayName = 'SelectItem'

const _SocialMediaDrawer = forwardRef<HTMLButtonElement, SocialMediaDrawerProps>(
	({ id, createNew, ...props }, ref) => {
		const router = useRouter<'/org/[slug]/edit' | '/org/[slug]/[orgLocationId]/edit'>()
		const { id: organizationId } = useOrgInfo()
		const socialId = useMemo(() => (createNew ? generateId('orgSocialMedia') : id), [createNew, id])
		const { data, isFetching } = api.orgSocialMedia.forEditDrawer.useQuery(
			{ id: socialId },
			{ enabled: !createNew }
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
			watch,
		} = useForm<FormSchema>({
			resolver: zodResolver(FormSchema),
			values: data ?? undefined,
		})
		const apiUtils = api.useUtils()
		const { data: socialMediaServices } = api.orgSocialMedia.getServiceTypes.useQuery(undefined, {
			select: (serviceTypeData) =>
				serviceTypeData
					? serviceTypeData.map(({ id: value, name, logoIcon }) => ({
							value,
							label: name,
							icon: <Icon icon={logoIcon} />,
						}))
					: [],
			placeholderData: [],
		})

		const { isDirty: formIsDirty } = formState
		const [isSaved, setIsSaved] = useState(formIsDirty)
		const notifySave = useNewNotification({ displayText: 'Saved', icon: 'success' })
		const databaseUpdate = api.orgSocialMedia.upsert.useMutation({
			onSettled: () => {
				apiUtils.orgSocialMedia.invalidate()
				reset()
			},
			onSuccess: () => {
				setIsSaved(true)
				notifySave()
				modalHandler.close()
				setTimeout(() => drawerHandler.close(), 500)
				reset({ id: generateId('orgSocialMedia') })
			},
		})
		const hasLocationId = typeof router.query.orgLocationId === 'string' ? router.query.orgLocationId : null
		const unlinkFromLocation = api.orgSocialMedia.locationLink.useMutation({
			onSuccess: () => apiUtils.orgSocialMedia.invalidate(),
		})

		const [urlValue] = useDebouncedValue(watch('url'), 300)
		const parsedUsername = useMemo(() => {
			if (!urlValue) {
				return null
			}
			const detectedService = socialLinkValidator.detectProfile(urlValue)
			if (!detectedService) {
				return null
			}
			return socialLinkValidator.getProfileId(detectedService, urlValue)
		}, [urlValue])

		useEffect(() => {
			if (parsedUsername) {
				const currentUsername = getValues('username')
				console.log('parsedUsername', parsedUsername)
				console.log('current username', currentUsername)
				if (parsedUsername !== currentUsername) {
					setFormValue('username', parsedUsername)
				}
			}
		}, [getValues, parsedUsername, setFormValue])

		useEffect(() => {
			if (createNew) {
				setFormValue('published', true)
				setFormValue('id', socialId)
				organizationId && setFormValue('organizationId', organizationId)
				if (hasLocationId !== null) {
					setFormValue('orgLocationId', hasLocationId)
					setFormValue('orgLocationOnly', true)
				}
			}
		}, [createNew, hasLocationId, setFormValue, socialId, organizationId])
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
					orgSocialMediaId: socialId,
					orgLocationId: hasLocationId,
					action: 'unlink',
				}),
			[unlinkFromLocation, socialId, hasLocationId]
		)

		const handleModalSubmit = useCallback(() => {
			databaseUpdate.mutate({ operation: createNew ? 'create' : 'update', ...getValues() })
		}, [createNew, databaseUpdate, getValues])

		const handleModalDismiss = useCallback(() => {
			reset()
			modalHandler.close()
			drawerHandler.close()
		}, [drawerHandler, modalHandler, reset])

		return (
			<>
				<Drawer.Root onClose={handleClose} opened={drawerOpened} position='right' zIndex={10001} keepMounted>
					<Drawer.Overlay />
					<Drawer.Content className={classes.drawerContent}>
						<form
							onSubmit={handleSubmit(
								(formData) => {
									databaseUpdate.mutate({ operation: createNew ? 'create' : 'update', ...formData })
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
										loading={databaseUpdate.isLoading}
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
									<Title order={2}>{`${createNew ? 'Add New' : 'Edit'} Social Media`}</Title>
									<Stack spacing={24} align='flex-start' w='100%'>
										<Select
											label='Service'
											required
											name='serviceId'
											control={control}
											data={socialMediaServices ?? []}
											itemComponent={SelectItem}
										/>
										<TextInput label='Website URL' required name='url' control={control} />
										<TextInput label='Username/handle' required name='username' control={control} />
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
											loading={databaseUpdate.isLoading}
											onClick={handleModalSubmit}
										>
											Save
										</Button>
										<Button variant='secondaryLg' onClick={handleModalDismiss}>
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
_SocialMediaDrawer.displayName = 'WebsiteDrawer'

export const SocialMediaDrawer = createPolymorphicComponent<'button', SocialMediaDrawerProps>(
	_SocialMediaDrawer
)

type SocialMediaDrawerProps = SocialMediaExisting | SocialMediaNew

interface SocialMediaExisting {
	id: string
	createNew?: never
}
interface SocialMediaNew {
	id?: never
	createNew: true
}
