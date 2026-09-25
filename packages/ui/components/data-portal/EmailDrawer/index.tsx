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

import { type ApiOutput } from '@weareinreach/api'
import { generateId } from '@weareinreach/db/lib/idGen'
import { Breadcrumb } from '~ui/components/core/Breadcrumb'
import { Button } from '~ui/components/core/Button'
import { useNewNotification } from '~ui/hooks/useNewNotification'
import { useOrgInfo } from '~ui/hooks/useOrgInfo'
import { Icon } from '~ui/icon'
import { trpc as api } from '~ui/lib/trpcClient'

import classes from './index.module.css'

type EmailRow = NonNullable<ApiOutput['orgEmail']['forEditDrawer']>

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
		const { id: orgId } = useOrgInfo()

		const hasLocationId = typeof router.query.orgLocationId === 'string' ? router.query.orgLocationId : null

		const [drawerOpened, drawerHandler] = useDisclosure(false)
		const [modalOpened, modalHandler] = useDisclosure(false)
		// `drawerOpened` is a dependency so a "Create new" trigger gets a fresh id on every open, not
		// just once at mount - the trigger stays mounted (only this Drawer's open state toggles) once
		// the email list already has an entry, so without this a second create would reuse the first
		// one's id, and now that `onSettled` below patches `forEditDrawer`'s cache under that id, the
		// reused id would read back the first item's own cached data instead of starting blank
		// (confirmed live - this is what broke a second "Create new" open, cascading into the drawer's
		// Close button no longer working either). Edit mode (an `id` prop is passed) is unaffected - it
		// always returns that same `id` regardless of this dependency.
		const emailId = useMemo(() => {
			if (createNew || !id) {
				return generateId('orgEmail')
			}
			return id
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, [createNew, id, drawerOpened])
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

		// `orgEmail.update`'s response matches `forEditDrawer`'s own output shape exactly (both come
		// from the same handler-side reformatting), so unlike PhoneDrawer's `upsert` (whose raw-row
		// response needs reshaping first) it can be written straight into that cache. Never waits on a
		// real refetch to do it - this API's underlying database has been confirmed live to lag behind
		// its own writes (see PhoneDrawer for the fuller account), so a forced immediate re-read right
		// after save risks coming back without the change just made and silently reverting it.
		const patchEmailListCaches = useCallback(
			(row: EmailRow) => {
				const parentIds = [orgId, hasLocationId].filter((value): value is string => Boolean(value))
				for (const parentId of parentIds) {
					apiUtils.orgEmail.forContactInfoEdit.setData({ parentId }, (old) => {
						if (!old) {
							return old
						}
						const existingIndex = old.findIndex((item) => item.id === row.id)
						const patchedItem = {
							id: row.id,
							email: row.email,
							firstName: row.firstName,
							lastName: row.lastName,
							primary: row.primary,
							locationOnly: row.locationOnly,
							serviceOnly: row.serviceOnly,
							published: row.published,
							deleted: row.deleted,
							// Neither a translation key for a custom title nor a separate one for the
							// description text is available from this response (only `titleId` and plain
							// resolved `description` text) - same "no exact key yet" gap PhoneDrawer
							// already works around for `phoneType`. This drawer has no Title field at
							// all, so `titleId` is effectively always null in practice; a real key (if
							// one's ever needed) arrives on the next natural, background refetch below.
							title: row.titleId ? (old[existingIndex]?.title ?? { key: '' }) : null,
							description: row.description
								? { key: old[existingIndex]?.description?.key ?? '', defaultText: row.description }
								: null,
						}
						const next =
							existingIndex === -1
								? [...old, patchedItem]
								: old.map((item, index) => (index === existingIndex ? patchedItem : item))
						return next.toSorted(
							(a, b) => Number(b.published) - Number(a.published) || Number(a.deleted) - Number(b.deleted)
						)
					})
				}
			},
			[apiUtils, orgId, hasLocationId]
		)

		const emailUpdate = api.orgEmail.update.useMutation({
			onSettled: (data) => {
				if (data) {
					apiUtils.orgEmail.forEditDrawer.setData({ id: emailId }, () => data)
					patchEmailListCaches(data)
				}
				// Deliberately NOT invalidating `forContactInfoEdit`/`forEditDrawer` - live-confirmed
				// real bug this used to cause: marking a query stale doesn't refetch it immediately,
				// but the *next* time it's naturally re-enabled (e.g. `forEditDrawer` going
				// disabled→enabled on this same drawer's next open) react-query refetches
				// automatically because the data is stale, and that refetch reads from the same
				// database confirmed to lag behind its own writes - silently overwriting the
				// just-patched, correct cache with a still-lagging response. The patch above is
				// already the authoritative, correct value; leaving these two unmarked keeps them
				// "fresh" for the normal staleTime window (~10 minutes, ~ui/lib/trpcClient.ts)
				// instead of inviting that race on every reopen. `forContactInfo` below is different -
				// it's never patched at all, so it still needs an eventual (soft) refetch to pick up
				// this change at all.
				apiUtils.orgEmail.forContactInfo.invalidate(undefined, { refetchType: 'none' })
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
				apiUtils.orgEmail.forContactInfo.invalidate()
				apiUtils.orgEmail.forEditDrawer.invalidate({ id: emailId }, { refetchType: 'none' })
				// Found via a deliberate audit for this same class of gap, not a live report: the "Link
				// or create new..." menu kept omitting this email from its options as if it were still
				// linked, since nothing ever told it the unlink had just happened.
				apiUtils.orgEmail.getLinkOptions.invalidate()
			},
		})
		// Runs on every open of a "Create new" trigger (not just at mount) - fully resets the form back
		// to blank defaults with the freshly-generated `emailId`. Without this, reopening the same
		// still-mounted trigger after a successful create could show the previously-created email's own
		// values: this drawer's `values: initialData ?? undefined` prop re-syncs from `forEditDrawer`'s
		// cache, which `onSettled` above now patches with real data - a fresh `emailId` on its own
		// (see that memo's comment) keeps the QUERY from colliding with the old one, but only an
		// explicit reset here guarantees the FORM itself starts blank rather than momentarily reflecting
		// whatever the previous item's save last put into it.
		useEffect(() => {
			if (createNew && drawerOpened) {
				reset(
					{
						id: emailId,
						orgId: orgId ?? '',
						firstName: null,
						lastName: null,
						primary: false,
						email: '',
						published: true,
						deleted: false,
						titleId: null,
						locationOnly: false,
						serviceOnly: false,
						description: null,
						descriptionId: null,
						linkLocationId: hasLocationId,
					},
					{ keepDirtyValues: false }
				)
			}
		}, [createNew, drawerOpened, emailId, orgId, hasLocationId, reset])
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
									<Stack
										gap={24}
										align='flex-start'
										w='100%'
										// Forces a fresh mount once the detail query's data actually arrives (and
										// again whenever it changes, e.g. reopening after a save). These fields'
										// own `useController` subscriptions (via `control` below) don't reliably
										// react to a value applied through this form's `values` prop *after*
										// they've already mounted and subscribed - the same gap PhoneNumberEntry
										// already works around for its own masked field (see that component for
										// the fuller account, confirmed directly against react-hook-form
										// 7.85.0/React 19 here too). Mounting fresh instead of updating in place
										// sidesteps it, since the value is already correct at mount time.
										key={`${emailId}:${JSON.stringify(initialData)}`}
									>
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
