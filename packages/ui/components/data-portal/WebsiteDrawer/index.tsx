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

import { type ApiOutput } from '@weareinreach/api'
import { type TUpsertSchema, ZUpsertSchema } from '@weareinreach/api/router/orgWebsite/mutation.upsert.schema'
import { generateId } from '@weareinreach/db/lib/idGen'
import { Breadcrumb } from '~ui/components/core/Breadcrumb'
import { Button } from '~ui/components/core/Button'
import { useNewNotification } from '~ui/hooks/useNewNotification'
import { useOrgInfo } from '~ui/hooks/useOrgInfo'
import { Icon } from '~ui/icon'
import { trpc as api } from '~ui/lib/trpcClient'

import classes from './index.module.css'

type WebsiteRow = NonNullable<ApiOutput['orgWebsite']['upsert']>

const _WebsiteDrawer = forwardRef<HTMLButtonElement, WebsiteDrawerProps>(
	({ id, createNew, ...props }, ref) => {
		const router = useRouter<'/org/[slug]/edit' | '/org/[slug]/[orgLocationId]/edit'>()
		const hasLocationId = typeof router.query.orgLocationId === 'string' ? router.query.orgLocationId : null
		const { id: organizationId } = useOrgInfo()

		const [drawerOpened, drawerHandler] = useDisclosure(false)
		const [modalOpened, modalHandler] = useDisclosure(false)
		// `drawerOpened` is a dependency so a "Create new" trigger gets a fresh id on every open, not
		// just once at mount - the trigger stays mounted (only this Drawer's open state toggles) once
		// the website list already has an entry, so without this a second create would reuse the first
		// one's id, and now that `onSettled` below patches `forEditDrawer`'s cache under that id, the
		// reused id would read back the first item's own cached data instead of starting blank
		// (confirmed live - this is what broke a second "Create new" open, cascading into the drawer's
		// Close button no longer working either). Edit mode (an `id` prop is passed) is unaffected - it
		// always returns that same `id` regardless of this dependency.
		const websiteId = useMemo(() => {
			if (createNew || !id) {
				return generateId('orgWebsite')
			}
			return id
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, [createNew, id, drawerOpened])
		const { data: websiteData, isFetching } = api.orgWebsite.forEditDrawer.useQuery(
			{ id: websiteId },
			{
				enabled: drawerOpened && !createNew,
				// select: (returnedData) => ({
				// 	...returnedData,
				// 	...(createNew && hasLocationId && { orgLocationId: hasLocationId }),
				// }),
			}
		)
		const { control, handleSubmit, formState, reset, getValues } = useForm<TUpsertSchema>({
			// zod's `.preprocess()` on `orgLocationId` makes @hookform/resolvers' structural
			// inference of the resolver's raw input type widen to `unknown`; the schema's actual
			// parsed output is `TUpsertSchema`, confirmed via z.infer.
			resolver: zodResolver(ZUpsertSchema) as Resolver<TUpsertSchema>,
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
		const notifySaveError = useNewNotification({
			displayText: 'Something went wrong saving this website. Please try again.',
			icon: 'warning',
		})

		const { isDirty: formIsDirty } = formState
		const [isSaved, setIsSaved] = useState(formIsDirty)

		// `upsert`'s response is the raw DB row (`descriptionId` as a bare FK, no resolved text) - unlike
		// EmailDrawer's `update`, it doesn't match either cache's shape directly. `description` (this
		// drawer's own field, submitted but currently un-rendered - see the commented-out TextInput
		// below) is only ever available as the plain text actually submitted (`variables`, not `data`),
		// same gap PhoneDrawer already works around for `phoneType`. Never waits on a real refetch to
		// patch these caches - this API's underlying database has been confirmed live to lag behind its
		// own writes (see PhoneDrawer for the fuller account), so a forced immediate re-read right after
		// save risks coming back without the change just made and silently reverting it.
		const patchWebsiteListCaches = useCallback(
			(row: WebsiteRow, submittedDescription: string | null | undefined) => {
				const parentIds = [organizationId, hasLocationId].filter((value): value is string => Boolean(value))
				for (const parentId of parentIds) {
					apiUtils.orgWebsite.forContactInfoEdit.setData({ parentId }, (old) => {
						if (!old) {
							return old
						}
						const existingIndex = old.findIndex((item) => item.id === row.id)
						const existingDescription = old[existingIndex]?.description
						const patchedItem = {
							id: row.id,
							url: row.url,
							published: row.published,
							deleted: row.deleted,
							description:
								submittedDescription !== undefined
									? submittedDescription
										? { key: existingDescription?.key ?? '', defaultText: submittedDescription }
										: null
									: (existingDescription ?? null),
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
			[apiUtils, organizationId, hasLocationId]
		)

		const siteUpdate = api.orgWebsite.upsert.useMutation({
			onSettled: (data, _error, variables) => {
				if (data) {
					apiUtils.orgWebsite.forEditDrawer.setData({ id: websiteId }, () => ({
						...data,
						description: variables.description ?? undefined,
					}))
					patchWebsiteListCaches(data, variables.description)
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
				apiUtils.orgWebsite.forContactInfo.invalidate(undefined, { refetchType: 'none' })
			},
			onSuccess: () => {
				setIsSaved(true)
				notifySave()
				modalHandler.close()
				setTimeout(() => drawerHandler.close(), 500)
				// Only "Create new" needs a fresh id primed for a possible next creation - doing this
				// unconditionally on every save also fired on a plain edit, blanking the just-saved
				// form's fields (url/published/etc. fall back to `defaultValues`, not the row just
				// written) in the half-second before the drawer's own close timeout above fires.
				if (createNew) {
					reset({ id: generateId('orgWebsite') })
				}
			},
			onError: () => {
				notifySaveError()
			},
		})

		const unlinkFromLocation = api.orgWebsite.locationLink.useMutation({
			onSuccess: () => {
				apiUtils.orgWebsite.forContactInfoEdit.invalidate()
				apiUtils.orgWebsite.forContactInfo.invalidate()
				apiUtils.orgWebsite.forEditDrawer.invalidate({ id: websiteId }, { refetchType: 'none' })
				// Found via a deliberate audit for this same class of gap, not a live report: the "Link
				// or create new..." menu kept omitting this website from its options as if it were still
				// linked, since nothing ever told it the unlink had just happened.
				apiUtils.orgWebsite.getLinkOptions.invalidate()
			},
		})
		// Runs on every open of a "Create new" trigger (not just at mount) - fully resets the form back
		// to blank defaults with the freshly-generated `websiteId`. Without this, reopening the same
		// still-mounted trigger after a successful create could show the previously-created website's
		// own values: this drawer's `values: websiteData && organizationId ? {...} : undefined` prop
		// re-syncs from `forEditDrawer`'s cache, which `onSettled` above now patches with real data - a
		// fresh `websiteId` on its own (see that memo's comment) keeps the QUERY from colliding with the
		// old one, but only an explicit reset here guarantees the FORM itself starts blank rather than
		// momentarily reflecting whatever the previous item's save last put into it.
		useEffect(() => {
			if (createNew && drawerOpened && organizationId) {
				reset(
					{
						id: websiteId,
						operation: 'create',
						url: '',
						description: null,
						isPrimary: false,
						published: true,
						deleted: false,
						organizationId,
						orgLocationId: hasLocationId,
						orgLocationOnly: false,
					},
					{ keepDirtyValues: false }
				)
			}
		}, [createNew, drawerOpened, hasLocationId, websiteId, organizationId, reset])
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
								<Group wrap='nowrap' justify='space-between' w='100%'>
									<Breadcrumb option='close' onClick={handleClose} />
									<Button
										variant='primary-icon'
										leftIcon={<Icon icon={isSaved ? 'carbon:checkmark' : 'carbon:save'} />}
										loading={siteUpdate.isPending}
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
									<Title order={2}>{`${createNew ? 'Add New' : 'Edit'} Website`}</Title>
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
										key={`${websiteId}:${JSON.stringify(websiteData)}`}
									>
										<TextInput label='Website URL' required name='url' type='url' control={control} />
										{/* <TextInput label='Description' name='description' control={control} /> */}
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
											loading={siteUpdate.isPending}
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
