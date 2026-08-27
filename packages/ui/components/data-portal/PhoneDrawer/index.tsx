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
import { getExampleNumber } from 'libphonenumber-js'
import examples from 'libphonenumber-js/examples.mobile.json'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next/pages'
import { forwardRef, useCallback, useEffect, useMemo, useState } from 'react'
import { type Resolver, useForm } from 'react-hook-form'
import { Checkbox, Select, TextInput } from 'react-hook-form-mantine'
import { isValidPhoneNumber } from 'react-phone-number-input'
import { z } from 'zod'

import { type TUpsertSchema } from '@weareinreach/api/router/orgPhone/mutation.upsert.schema'
import { generateId } from '@weareinreach/db/lib/idGen'
import { Breadcrumb } from '~ui/components/core/Breadcrumb'
import { Button } from '~ui/components/core/Button'
import { PhoneNumberEntry } from '~ui/components/data-portal/PhoneNumberEntry/withHookForm'
import { useOrgInfo } from '~ui/hooks/useOrgInfo'
import { isCountryCode } from '~ui/hooks/usePhoneNumber'
import { Icon } from '~ui/icon'
import { trpc as api } from '~ui/lib/trpcClient'

import classes from './index.module.css'

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
		const [drawerOpened, drawerHandler] = useDisclosure(false)
		const [modalOpened, modalHandler] = useDisclosure(false)
		const { data: initialData, isFetching } = api.orgPhone.forEditDrawer.useQuery(
			{ id: phoneId, orgId: orgId ?? '' },
			{
				enabled: drawerOpened && !!orgId,
				// `ext`/`description` come back `null` when unset - fed straight into `values` below,
				// that would hand a controlled TextInput a `null` value and trip React's
				// uncontrolled-to-controlled warning. `phoneTypeId` is deliberately left alone: `null`
				// is a real sentinel value there (selects the "Custom Text" option).
				select: (data) =>
					data ? { ...data, ext: data.ext ?? '', description: data.description ?? '' } : data,
			}
		)
		// No `initialData` here - combined with the client's 10-minute default `staleTime`, an
		// `initialData: []` would make react-query treat the query as already-fresh on mount and
		// never actually fetch, permanently stuck showing zero phone types.
		const { data: phoneTypes } = api.fieldOpt.phoneTypes.useQuery(undefined, {
			select: (data) => data.map(({ id: value, tsKey, tsNs }) => ({ value, label: t(tsKey, { ns: tsNs }) })),
		})
		// Same query PhoneNumberEntry already makes internally - React Query dedupes this against
		// that one rather than firing a second request, so this is free.
		const { data: countryList } = api.fieldOpt.countries.useQuery({ activeForOrgs: true })
		const countryCca2ById = useMemo(() => {
			const lookup = new Map<string, string>()
			countryList?.forEach(({ id: countryId, cca2 }) => lookup.set(countryId, cca2))
			return lookup
		}, [countryList])
		const countryNameById = useMemo(() => {
			const lookup = new Map<string, string>()
			countryList?.forEach(({ id: countryId, name }) => lookup.set(countryId, name))
			return lookup
		}, [countryList])

		// Built dynamically (rather than a module-level constant) because validating the phone
		// number requires resolving the selected countryId to an ISO country code first, and that
		// lookup table only exists once the countries query above has loaded. react-hook-form's
		// per-field `rules` are silently ignored whenever a resolver is set (this form uses one),
		// so the phone-format check has to live in the schema itself to actually run.
		const formResolver = useMemo(
			() =>
				zodResolver(
					FormSchema.superRefine((data, ctx) => {
						if (!data.number) {
							return
						}
						const rawCca2 = countryCca2ById.get(data.countryId)
						const cca2 = rawCca2 && isCountryCode(rawCca2) ? rawCca2 : undefined
						if (!isValidPhoneNumber(data.number, cca2)) {
							if (!cca2) {
								ctx.addIssue({ code: 'custom', path: ['number'], message: 'Not a valid phone number' })
								return
							}
							const countryName = countryNameById.get(data.countryId) ?? cca2
							const example = getExampleNumber(cca2, examples)
							const message = example
								? `Not a valid phone number for ${countryName}. Example: ${example.formatNational()}`
								: `Not a valid phone number for ${countryName}`
							ctx.addIssue({ code: 'custom', path: ['number'], message })
						}
					})
				) as Resolver<FormSchema>,
			[countryCca2ById, countryNameById]
		)
		const {
			control,
			handleSubmit,
			formState,
			reset,
			getValues,
			watch,
			setValue: setFormValue,
		} = useForm<FormSchema>({
			resolver: formResolver,
			values: initialData ?? undefined,
			defaultValues: {
				id: phoneId,
				number: '',
				countryId: '',
				ext: '',
				description: '',
				published: true,
				deleted: false,
			},
		})
		const { isDirty: formIsDirty } = formState
		const [isSaved, setIsSaved] = useState(formIsDirty)
		const hasLocationId = typeof router.query.orgLocationId === 'string' ? router.query.orgLocationId : null

		// Invalidating forContactInfoEdit and letting it refetch has turned out to be racy in
		// practice: two GET requests for the same query can land out of order, and if the stale
		// one (fetched before this save committed) resolves after the fresh one, it silently wins
		// and the list shows old data even though the save succeeded. Patching the cache directly
		// with what we just saved sidesteps that race entirely instead of depending on which
		// response happens to arrive last. This only patches the org-level list plus the
		// location-level list if this phone belongs to one - phoneType and the description's
		// translation key are left as whatever's already cached (only the description text is
		// updated) since those aren't available in the form's submitted values; a real refetch
		// (still triggered, just without forcing this immediate race-prone one) corrects that on
		// next natural load if either was actually changed.
		const patchContactListCaches = useCallback(
			(submitted: TUpsertSchema) => {
				// `update`'s zod branch technically allows every field but `id` to be omitted (only
				// `create` requires `number`/`countryId`), even though this drawer's form always
				// submits all of them - falling back to the existing cached value covers that gap
				// defensively rather than assuming the type's full possibility space away.
				const cca2 = submitted.countryId ? countryCca2ById.get(submitted.countryId) : undefined
				const parentIds = [orgId, hasLocationId].filter((value): value is string => Boolean(value))
				for (const parentId of parentIds) {
					apiUtils.orgPhone.forContactInfoEdit.setData({ parentId }, (old) => {
						if (!old) {
							return old
						}
						const next = old.map((item) =>
							item.id === submitted.id
								? {
										...item,
										number: submitted.number ?? item.number,
										ext: submitted.ext ?? item.ext,
										primary: submitted.primary ?? item.primary,
										locationOnly: submitted.locationOnly ?? item.locationOnly,
										published: submitted.published ?? item.published,
										deleted: submitted.deleted ?? item.deleted,
										country: cca2 ?? item.country,
										description:
											submitted.description === undefined
												? item.description
												: submitted.description === null
													? null
													: { key: item.description?.key ?? '', defaultText: submitted.description },
									}
								: item
						)
						return next.toSorted(
							(a, b) => Number(b.published) - Number(a.published) || Number(a.deleted) - Number(b.deleted)
						)
					})
				}
			},
			[apiUtils, orgId, hasLocationId, countryCca2ById]
		)

		const siteUpdate = api.orgPhone.upsert.useMutation({
			onSettled: (data, _error, variables) => {
				if (variables.operation === 'create') {
					// A brand-new phone has no existing entry in the cached list for the patch below to
					// match against - `patchContactListCaches` only updates an item it can find by id, so
					// for a create it would silently do nothing and the new phone just wouldn't appear
					// until something else happened to refetch the list. Doing a real (not
					// `refetchType: 'none'`) invalidate here is safe specifically for creates: there's no
					// existing cached data for this id that a slower, earlier response could race against
					// and stomp - unlike the update path below.
					apiUtils.orgPhone.forContactInfoEdit.invalidate()
				} else {
					patchContactListCaches(variables)
					apiUtils.orgPhone.forContactInfoEdit.invalidate(undefined, { refetchType: 'none' })
				}
				apiUtils.orgPhone.forContactInfo.invalidate()
				// This drawer's own detail query is keyed by this specific phone id - without
				// marking it stale too, reopening this same phone later would show the pre-save
				// data, making a second edit silently start from a stale checkbox state instead
				// of what was just saved. `refetchType: 'none'` marks it stale for next time
				// without forcing an immediate refetch here - nothing is displaying this query
				// while the drawer is closed, and forcing one batches it alongside the
				// forContactInfoEdit refetch above in a way that ends up blocking that one from
				// reaching the list.
				apiUtils.orgPhone.forEditDrawer.invalidate(
					{ id: phoneId, orgId: orgId ?? '' },
					{ refetchType: 'none' }
				)
				reset(data)
			},
			onSuccess: () => {
				setIsSaved(true)
				modalHandler.close()
				drawerHandler.close()
			},
		})
		const unlinkFromLocation = api.orgPhone.locationLink.useMutation({
			onSuccess: () => {
				drawerHandler.close()
				apiUtils.orgPhone.forContactInfoEdit.invalidate()
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

		const handleSaveButton = useCallback(
			() =>
				handleSubmit(
					(data) => {
						siteUpdate.mutate({ orgId: orgId ?? '', operation: createNew ? 'create' : 'update', ...data })
					},
					(error) => console.error(error)
				),
			[createNew, handleSubmit, orgId, siteUpdate]
		)

		const handleModalSave = useCallback(() => {
			const valuesToSubmit = getValues()
			siteUpdate.mutate(
				{ ...valuesToSubmit, orgId: orgId ?? '', operation: createNew ? 'create' : 'update' },
				{
					onSuccess: () => {
						modalHandler.close()
						drawerHandler.close()
					},
				}
			)
		}, [createNew, drawerHandler, getValues, modalHandler, orgId, siteUpdate])
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
						<form onSubmit={handleSaveButton()}>
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
									<Title order={2}>{`${createNew ? 'Add New' : 'Edit'} Phone`}</Title>
									<Stack gap={24} align='flex-start' w='100%'>
										<PhoneNumberEntry
											label='Phone Number'
											required
											countrySelect={{ name: 'countryId' }}
											phoneInput={{ name: 'number' }}
											control={control}
										/>
										<TextInput label='Extension' name='ext' control={control} />
										<Select
											label='Type'
											control={control}
											name='phoneTypeId'
											data={[
												...(phoneTypes ?? []),
												{ value: null as unknown as string, label: 'Custom Text (enter below)' },
											]}
											comboboxProps={{ zIndex: 10002 }}
										/>
										{values.phoneTypeId === null && (
											<TextInput label='Description' name='description' control={control} />
										)}
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
