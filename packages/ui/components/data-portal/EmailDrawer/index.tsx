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
	// Not a real user-facing field (nothing in this form renders it) and not reliably trustworthy
	// from form-tracked state (only ever populated from the `useOrgInfo` hook, not a real column on
	// OrgEmail) - `.optional()` so validation never blocks a submit on it. `submitEmail` below always
	// overrides it with a fresh value from the hook regardless of what's here.
	orgId: z.string().optional(),
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
		const notifySaveError = useNewNotification({
			displayText: 'Something went wrong saving this email. Please try again.',
			icon: 'warning',
		})

		const { control, handleSubmit, formState, reset } = useForm<FormSchema>({
			resolver: zodResolver(FormSchema) as Resolver<FormSchema>,
			values: initialData ?? undefined,
			defaultValues: {
				id: emailId,
				orgId: '',
				published: true,
				deleted: false,
				linkLocationId: hasLocationId,
			},
		})

		const { isDirty: formIsDirty } = formState
		const [isSaved, setIsSaved] = useState(formIsDirty)

		// A tRPC query response can be served from an intermediate cache under
		// `stale-while-revalidate`, so `invalidate()`'s own refetch for an *update* isn't reliable -
		// it can come back with the pre-save row even though the write already succeeded. Patching
		// the list with what was actually submitted (mirroring PhoneDrawer's identical
		// `patchContactListCaches`) sidesteps that: the visible list always reflects the save
		// immediately, and a real refetch still corrects anything this patch can't infer (e.g. the
		// title's translation key) whenever it eventually lands.
		const patchContactListCaches = useCallback(
			(submitted: FormSchema) => {
				const parentIds = [orgId, hasLocationId].filter((value): value is string => Boolean(value))
				for (const parentId of parentIds) {
					apiUtils.orgEmail.forContactInfoEdit.setData({ parentId }, (old) => {
						if (!old) {
							return old
						}
						return old.map((item) =>
							item.id === submitted.id
								? {
										...item,
										email: submitted.email ?? item.email,
										firstName: submitted.firstName ?? item.firstName,
										lastName: submitted.lastName ?? item.lastName,
										primary: submitted.primary ?? item.primary,
										locationOnly: submitted.locationOnly ?? item.locationOnly,
										serviceOnly: submitted.serviceOnly ?? item.serviceOnly,
										published: submitted.published ?? item.published,
										deleted: submitted.deleted ?? item.deleted,
										description:
											submitted.description === undefined
												? item.description
												: submitted.description === null
													? null
													: { key: item.description?.key ?? '', defaultText: submitted.description },
									}
								: item
						)
					})
				}
			},
			[apiUtils, orgId, hasLocationId]
		)

		const emailUpdate = api.orgEmail.update.useMutation({
			onSettled: (_data, error, variables) => {
				// A failed save must not reach `patchContactListCaches` below - it writes `variables`
				// (what was *submitted*) straight into the cache, so patching on an error would make
				// the list show a change that was never actually persisted.
				if (error) {
					return
				}
				if (createNew) {
					// A brand-new email has no existing entry in the cached list for the patch above
					// to match against, so a real invalidate is the only way it appears at all - safe
					// here specifically because there's no existing cached data for this id that a
					// slower, earlier response could race against and stomp.
					apiUtils.orgEmail.forContactInfoEdit.invalidate()
				} else {
					patchContactListCaches(variables as FormSchema)
					apiUtils.orgEmail.forContactInfoEdit.invalidate(undefined, { refetchType: 'none' })
				}
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
			onError: notifySaveError,
		})
		const unlinkFromLocation = api.orgEmail.locationLink.useMutation({
			onSuccess: () => {
				apiUtils.orgEmail.forContactInfoEdit.invalidate()
			},
		})
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

		// Single submit path for both the drawer's own Save button and the "Unsaved Changes" modal's
		// Save button - previously each called `emailUpdate.mutate` separately (the modal via a raw
		// `getValues()`, bypassing zod validation entirely), which is how the `orgId` override ended up
		// applied in only one of the two places. `orgId` isn't rendered as a field and can't be trusted
		// from form-tracked state (it's only ever populated from this hook, not a real column on
		// OrgEmail) - reading it fresh here, in the one place both paths funnel through, avoids
		// submitting a stale/missing value if this drawer is reopened for a second edit shortly after a
		// previous save.
		const submitEmail = useMemo(
			() =>
				handleSubmit(
					(data) => emailUpdate.mutate({ ...data, orgId: orgId ?? '' }),
					(error) => console.error(error)
				),
			[handleSubmit, emailUpdate, orgId]
		)

		const handleCloseAndDiscard = useCallback(() => {
			reset()
			modalHandler.close()
			drawerHandler.close()
		}, [reset, modalHandler, drawerHandler])

		return (
			<>
				<Drawer.Root
					onClose={handleClose}
					opened={drawerOpened}
					position='right'
					zIndex={10001}
					keepMounted
					// A `createNew` instance (used as the "Create new" trigger in a location's Contact
					// menu - see e.g. Emails.tsx) sits nested inside a Menu.Item for its whole lifetime.
					// Once saved and this closes, the same record also starts appearing in the main
					// linked-items list below, mounting a second EmailDrawer with the same id at the same
					// moment - the resulting re-render storm reliably desyncs Mantine's close transition,
					// leaving this Drawer stuck fully visible even though `opened` has already gone false.
					// Skipping the transition removes the window for that: the closed state applies
					// immediately instead of after a 200ms animation that never gets to finish.
					transitionProps={createNew ? { duration: 0 } : undefined}
				>
					<Drawer.Overlay />
					<Drawer.Content className={classes.drawerContent}>
						<form onSubmit={submitEmail}>
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
											loading={emailUpdate.isPending}
											onClick={submitEmail}
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
