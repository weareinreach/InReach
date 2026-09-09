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

import { type TUpsertSchema, ZUpsertSchema } from '@weareinreach/api/router/orgWebsite/mutation.upsert.schema'
import { generateId } from '@weareinreach/db/lib/idGen'
import { Breadcrumb } from '~ui/components/core/Breadcrumb'
import { Button } from '~ui/components/core/Button'
import { useNewNotification } from '~ui/hooks/useNewNotification'
import { useOrgInfo } from '~ui/hooks/useOrgInfo'
import { Icon } from '~ui/icon'
import { trpc as api } from '~ui/lib/trpcClient'

import classes from './index.module.css'

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

		const [drawerOpened, drawerHandler] = useDisclosure(false)
		const [modalOpened, modalHandler] = useDisclosure(false)
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
		const {
			control,
			handleSubmit,
			formState,
			reset,
			setValue: setFormValue,
		} = useForm<TUpsertSchema>({
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

		// A tRPC query response can be served from an intermediate cache under
		// `stale-while-revalidate`, so `invalidate()`'s own refetch for an *update* isn't reliable -
		// it can come back with the pre-save row even though the write already succeeded (confirmed
		// live: the refetch returned the old url moments after the mutation's own response returned
		// the new one). Patching the list with what was actually submitted, mirroring PhoneDrawer's
		// identical `patchContactListCaches`, sidesteps that: the visible list always reflects the
		// save immediately, and a real refetch still corrects anything this patch can't infer (e.g.
		// the description's translation key) whenever it eventually lands.
		const patchContactListCaches = useCallback(
			(submitted: TUpsertSchema) => {
				const parentIds = [organizationId, hasLocationId].filter((value): value is string => Boolean(value))
				for (const parentId of parentIds) {
					apiUtils.orgWebsite.forContactInfoEdit.setData({ parentId }, (old) => {
						if (!old) {
							return old
						}
						return old.map((item) =>
							item.id === submitted.id
								? {
										...item,
										url: submitted.url ?? item.url,
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
			[apiUtils, organizationId, hasLocationId]
		)

		const siteUpdate = api.orgWebsite.upsert.useMutation({
			onSettled: (_data, error, variables) => {
				// A failed save must not reach `patchContactListCaches` below - it writes `variables`
				// (what was *submitted*) straight into the cache, so patching on an error would make
				// the list show a change that was never actually persisted.
				if (error) {
					return
				}
				if (variables.operation === 'create') {
					// A brand-new website has no existing entry in the cached list for the patch above
					// to match against, so a real invalidate is the only way it appears at all - safe
					// here specifically because there's no existing cached data for this id that a
					// slower, earlier response could race against and stomp.
					apiUtils.orgWebsite.forContactInfoEdit.invalidate()
				} else {
					patchContactListCaches(variables as TUpsertSchema)
					apiUtils.orgWebsite.forContactInfoEdit.invalidate(undefined, { refetchType: 'none' })
				}
				apiUtils.orgWebsite.forContactInfo.invalidate()
				// This drawer's own detail query is keyed by this specific website id - without
				// marking it stale too, reopening this same website later would show the
				// pre-save data, making a second edit silently start from a stale field state
				// instead of what was just saved. `refetchType: 'none'` marks it stale for next
				// time without forcing an immediate refetch here - nothing is displaying this
				// query while the drawer is closed, and forcing one batches it alongside the
				// forContactInfoEdit refetch above in a way that ends up blocking that one from
				// reaching the list.
				apiUtils.orgWebsite.forEditDrawer.invalidate({ id: websiteId }, { refetchType: 'none' })
			},
			onSuccess: (_data, variables) => {
				setIsSaved(true)
				notifySave()
				modalHandler.close()
				setTimeout(() => drawerHandler.close(), 500)
				// Resets to what was actually just submitted, not a throwaway blank id - resetting to
				// an unrelated fresh id discarded the just-saved values from the form's own display
				// (e.g. reopening this exact drawer instance's Unsaved-Changes state) even though the
				// database write itself was correct.
				// Same `unknown`-widening quirk as the resolver cast above - `variables` is structurally
				// `TUpsertSchema`, just not inferred as such through the mutation's own generic.
				reset(variables as TUpsertSchema)
			},
			onError: notifySaveError,
		})

		const unlinkFromLocation = api.orgWebsite.locationLink.useMutation({
			onSuccess: () => {
				apiUtils.orgWebsite.forContactInfoEdit.invalidate()
			},
		})
		useEffect(() => {
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

		// Single submit path for both the drawer's own Save button and the "Unsaved Changes" modal's
		// Save button - previously the modal called `siteUpdate.mutate` from a raw `getValues()`,
		// bypassing zod validation entirely (only the primary Save button validated via `handleSubmit`).
		const submitWebsite = useMemo(
			() =>
				handleSubmit(
					(data) => siteUpdate.mutate({ id: websiteId, ...data }),
					(error) => console.error(error)
				),
			[handleSubmit, siteUpdate, websiteId]
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
					// A `createNew` instance is used as the "Create new" trigger in a location's Contact
					// menu (see e.g. Emails.tsx) and sits nested inside a Menu.Item for its whole
					// lifetime. Once saved and this closes, the same record also starts appearing in the
					// main linked-items list below, mounting a second WebsiteDrawer with the same id at
					// the same moment - the resulting re-render storm reliably desyncs Mantine's close
					// transition, leaving this Drawer stuck fully visible even though `opened` has already
					// gone false. Skipping the transition removes the window for that: the closed state
					// applies immediately instead of after an animation that never gets to finish.
					transitionProps={createNew ? { duration: 0 } : undefined}
				>
					<Drawer.Overlay />
					<Drawer.Content className={classes.drawerContent}>
						<form onSubmit={submitWebsite}>
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
									<Stack gap={24} align='flex-start' w='100%'>
										<TextInput label='Website URL' required name='url' type='url' control={control} />
										{/* <TextInput label='Description' name='description' control={control} /> */}
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
											loading={siteUpdate.isPending}
											onClick={submitWebsite}
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
