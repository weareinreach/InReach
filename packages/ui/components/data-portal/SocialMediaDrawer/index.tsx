import { zodResolver } from '@hookform/resolvers/zod'
import {
	Box,
	type ComboboxItem,
	type ComboboxLikeRenderOptionInput,
	createPolymorphicComponent,
	Drawer,
	Group,
	LoadingOverlay,
	Modal,
	Stack,
	Text,
	Title,
} from '@mantine/core'
import { useDebouncedValue, useDisclosure } from '@mantine/hooks'
import { useRouter } from 'next/router'
import { forwardRef, useCallback, useEffect, useMemo, useState } from 'react'
import { type Resolver, useForm } from 'react-hook-form'
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

import classes from './index.module.css'

const socialLinkValidator = new SocialLinks()

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

const _SocialMediaDrawer = forwardRef<HTMLButtonElement, SocialMediaDrawerProps>(
	({ id, createNew, ...props }, ref) => {
		const router = useRouter<'/org/[slug]/edit' | '/org/[slug]/[orgLocationId]/edit'>()
		const { id: organizationId } = useOrgInfo()
		const hasLocationId = typeof router.query.orgLocationId === 'string' ? router.query.orgLocationId : null
		const socialId = useMemo(() => (createNew ? generateId('orgSocialMedia') : id), [createNew, id])
		const [drawerOpened, drawerHandler] = useDisclosure(false)
		const [modalOpened, modalHandler] = useDisclosure(false)
		const { data, isFetching } = api.orgSocialMedia.forEditDrawer.useQuery(
			{ id: socialId },
			{ enabled: drawerOpened && !createNew }
		)
		const {
			control,
			handleSubmit,
			formState,
			reset,
			getValues,
			setValue: setFormValue,
			watch,
		} = useForm<FormSchema>({
			resolver: zodResolver(FormSchema) as Resolver<FormSchema>,
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
		const notifySaveError = useNewNotification({
			displayText: 'Something went wrong saving this social media link. Please try again.',
			icon: 'warning',
		})
		// A tRPC query response can be served from an intermediate cache under
		// `stale-while-revalidate`, so `invalidate()`'s own refetch for an *update* isn't reliable -
		// it can come back with the pre-save row even though the write already succeeded. Patching
		// the list with what was actually submitted (mirroring PhoneDrawer's identical
		// `patchContactListCaches`) sidesteps that: the visible list always reflects the save
		// immediately, and a real refetch still corrects anything this patch can't infer whenever it
		// eventually lands.
		const patchContactListCaches = useCallback(
			(submitted: FormSchema) => {
				const parentIds = [organizationId, hasLocationId].filter((value): value is string => Boolean(value))
				for (const parentId of parentIds) {
					apiUtils.orgSocialMedia.forContactInfoEdits.setData({ parentId }, (old) => {
						if (!old) {
							return old
						}
						return old.map((item) =>
							item.id === submitted.id
								? {
										...item,
										url: submitted.url ?? item.url,
										username: submitted.username ?? item.username,
										published: submitted.published ?? item.published,
										deleted: submitted.deleted ?? item.deleted,
										orgLocationOnly: submitted.orgLocationOnly ?? item.orgLocationOnly,
										service: submitted.service?.name ?? item.service,
										serviceIcon: submitted.service?.logoIcon ?? item.serviceIcon,
									}
								: item
						)
					})
				}
			},
			[apiUtils, organizationId, hasLocationId]
		)

		const databaseUpdate = api.orgSocialMedia.upsert.useMutation({
			onSettled: (_data, error, variables) => {
				// A failed save must not reach `patchContactListCaches`/`reset()` below - it writes
				// `variables` (what was *submitted*) straight into the cache and form, so patching on
				// an error would make the list and form show a change that was never actually persisted.
				if (error) {
					return
				}
				if (variables.operation === 'create') {
					// A brand-new record has no existing entry in the cached list for the patch above to
					// match against, so a real invalidate is the only way it appears at all - safe here
					// specifically because there's no existing cached data for this id that a slower,
					// earlier response could race against and stomp.
					apiUtils.orgSocialMedia.forContactInfoEdits.invalidate()
				} else {
					patchContactListCaches(variables as FormSchema)
					apiUtils.orgSocialMedia.forContactInfoEdits.invalidate(undefined, { refetchType: 'none' })
				}
				apiUtils.orgSocialMedia.forContactInfo.invalidate()
				// This drawer's own detail query is keyed by this specific social media id -
				// without marking it stale too, reopening this same record later would show the
				// pre-save data, making a second edit silently start from a stale field state
				// instead of what was just saved. `refetchType: 'none'` marks it stale for next
				// time without forcing an immediate refetch here - nothing is displaying this
				// query while the drawer is closed, and forcing one batches it alongside the
				// forContactInfoEdits refetch above in a way that ends up blocking that one from
				// reaching the list.
				apiUtils.orgSocialMedia.forEditDrawer.invalidate({ id: socialId }, { refetchType: 'none' })
			},
			onSuccess: (_data, variables) => {
				setIsSaved(true)
				notifySave()
				modalHandler.close()
				setTimeout(() => drawerHandler.close(), 500)
				// Resets to what was actually just submitted, not a throwaway blank id - resetting to
				// an unrelated fresh id discarded the just-saved values from the form's own display
				// even though the database write itself was correct.
				reset(variables as FormSchema)
			},
			onError: notifySaveError,
		})
		const unlinkFromLocation = api.orgSocialMedia.locationLink.useMutation({
			onSuccess: () => {
				apiUtils.orgSocialMedia.forContactInfoEdits.invalidate()
			},
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
			if (formIsDirty) {
				return modalHandler.open()
			} else {
				return drawerHandler.close()
			}
		}, [formIsDirty, drawerHandler, modalHandler])

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

		// Single submit path for both the drawer's own Save button and the "Unsaved Changes" modal's
		// Save button - previously the modal called `databaseUpdate.mutate` from a raw `getValues()`,
		// bypassing zod validation entirely (only the primary Save button validated via `handleSubmit`).
		const submitSocialMedia = useMemo(
			() =>
				handleSubmit(
					(formData) => databaseUpdate.mutate({ operation: createNew ? 'create' : 'update', ...formData }),
					(error) => console.error(error)
				),
			[createNew, databaseUpdate, handleSubmit]
		)

		const handleModalDismiss = useCallback(() => {
			reset()
			modalHandler.close()
			drawerHandler.close()
		}, [drawerHandler, modalHandler, reset])

		const renderServiceOption = useCallback(
			({ option }: ComboboxLikeRenderOptionInput<ComboboxItem>) => {
				const service = socialMediaServices?.find(({ value }) => value === option.value)
				return (
					<Group wrap='nowrap' gap={12}>
						{service?.icon} {option.label}
					</Group>
				)
			},
			[socialMediaServices]
		)

		return (
			<>
				<Drawer.Root
					onClose={handleClose}
					opened={drawerOpened}
					position='right'
					zIndex={10001}
					keepMounted
					// A `createNew` instance is used as the "Create new" trigger in a location's Contact
					// menu (see e.g. Emails.tsx) and sits nested inside a Menu.Item for its whole
					// lifetime. Once saved and this closes, the same record also starts appearing in the
					// main linked-items list below, mounting a second SocialMediaDrawer with the same id
					// at the same moment - the resulting re-render storm reliably desyncs Mantine's close
					// transition, leaving this Drawer stuck fully visible even though `opened` has already
					// gone false. Skipping the transition removes the window for that: the closed state
					// applies immediately instead of after an animation that never gets to finish.
					transitionProps={createNew ? { duration: 0 } : undefined}
				>
					<Drawer.Overlay />
					<Drawer.Content className={classes.drawerContent}>
						<form onSubmit={submitSocialMedia}>
							<Drawer.Header>
								<Group wrap='nowrap' justify='space-between' w='100%'>
									<Breadcrumb option='close' onClick={handleClose} />
									<Button
										variant='primary-icon'
										leftIcon={<Icon icon={isSaved ? 'carbon:checkmark' : 'carbon:save'} />}
										loading={databaseUpdate.isPending}
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
									<Title order={2}>{`${createNew ? 'Add New' : 'Edit'} Social Media`}</Title>
									<Stack gap={24} align='flex-start' w='100%'>
										<Select
											label='Service'
											required
											name='serviceId'
											control={control}
											data={socialMediaServices ?? []}
											comboboxProps={{ zIndex: 10002 }}
											renderOption={renderServiceOption}
										/>
										<TextInput label='Website URL' required name='url' control={control} />
										<TextInput label='Username/handle' required name='username' control={control} />
										<Group wrap='nowrap' justify='space-between' w='100%'>
											<Stack>
												<Checkbox
													label='Published'
													description="Unchecking this temporarily removes the entry from the public site and search. Use this when something's still being sorted out and you expect it to come back — re-verifying, waiting to hear back, or a temporary inactive period."
													name='published'
													control={control}
												/>
												<Checkbox
													label='Deleted'
													description="Checking this removes the entry from the public site until deliberately restored. Use this when the entry shouldn't be active at all — a duplicate, permanently discontinued, or rejected during review — not for a temporary pause."
													name='deleted'
													control={control}
												/>
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
											loading={databaseUpdate.isPending}
											onClick={submitSocialMedia}
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
