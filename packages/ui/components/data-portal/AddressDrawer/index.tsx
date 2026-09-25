import {
	Box,
	type ButtonProps,
	Combobox,
	type ComboboxItem,
	type ComboboxLikeRenderOptionInput,
	type ComboboxStore,
	createPolymorphicComponent,
	Divider,
	Drawer,
	Group,
	Modal,
	Radio,
	Select,
	Stack,
	Text,
	TextInput,
	Title,
	useCombobox,
} from '@mantine/core'
import { schemaResolver, useForm, type UseFormReturnType } from '@mantine/form'
import { useDebouncedValue, useDisclosure } from '@mantine/hooks'
import compact from 'just-compact'
import filterObject from 'just-filter-object'
import { useTranslation } from 'next-i18next/pages'
import { forwardRef, useCallback, useEffect, useMemo, useState } from 'react'
import reactStringReplace from 'react-string-replace'
import { type z } from 'zod'

import { type ApiOutput } from '@weareinreach/api'
import { type ZUpdateSchema } from '@weareinreach/api/router/location/mutation.update.schema'
import { AddressVisibility } from '@weareinreach/db/enums'
import { Breadcrumb } from '~ui/components/core/Breadcrumb'
import { Button } from '~ui/components/core/Button'
import { isExternal, Link } from '~ui/components/core/Link'
import { useCustomVariant } from '~ui/hooks/useCustomVariant'
import { useNewNotification } from '~ui/hooks/useNewNotification'
import { useOrgInfo } from '~ui/hooks/useOrgInfo'
import { Icon } from '~ui/icon'
import { cx } from '~ui/lib/cx'
import { createWktFromLatLng } from '~ui/lib/geotools'
import { trpc as api } from '~ui/lib/trpcClient'

import { AddressVisibilitySchema, FormSchema, schemaTransform } from './schema'
import classes from './styles.module.css'
import { MultiSelectPopover } from '../MultiSelectPopover'

type AutocompleteResult = ApiOutput['geo']['autocomplete']['results'][number]

/**
 * Mirrors `packages/api/router/location/lib.formatAddressVisibility.ts`'s `isEditMode: true` branch (the one
 * `query.forVisitCardEdits.handler.ts` actually uses) - that file lives in the API package and isn't
 * reachable from here, so the rule is reproduced rather than imported: FULL passes through untouched; PARTIAL
 * and HIDDEN both null out street1/street2/postCode/latitude/longitude, but - unlike the public (non-edit)
 * variant - never null `city`/`govDist`, since an editor needs to see those regardless of what a visitor
 * would.
 */
const applyAddressVisibilityEditMode = <
	T extends {
		street1: string | null
		street2: string | null
		postCode: string | null
		latitude: number | null
		longitude: number | null
	},
>(
	// A plain `string` rather than the `AddressVisibility` enum type itself - the value flowing in here
	// at the one call site below is inferred from `forVisitCardEdits`'s Prisma-generated output type,
	// a structurally-identical but nominally distinct enum from this file's own `AddressVisibility`
	// import (same member names, different declaration), so TS rejects it against the stricter type.
	// Comparing against `AddressVisibility.FULL` below still works fine across that boundary.
	visibility: string,
	address: T
): T => {
	if (visibility === AddressVisibility.FULL) {
		return address
	}
	return { ...address, street1: null, street2: null, postCode: null, latitude: null, longitude: null }
}

const matchText = (result: string, textToMatch: string | undefined | null) => {
	if (!textToMatch) {
		return result
	}
	const matcher = new RegExp(`(${textToMatch})`, 'ig')
	return reactStringReplace(result, matcher, (match, i) => (
		<span key={i} className={classes.matchedText}>
			{match}
		</span>
	))
}

const addressVisibilityOptions: { value: AddressVisibility; label: string }[] = [
	{ value: AddressVisibility.FULL, label: 'Show full address' },
	{ value: AddressVisibility.PARTIAL, label: 'Show city & state/province' },
	{ value: AddressVisibility.HIDDEN, label: 'Hide address' },
]

interface AddressAutocompleteFieldProps {
	fieldName: 'data.street1' | 'data.city'
	fieldLabel: string
	fieldRequired: boolean
	form: UseFormReturnType<FormSchema>
	results: ApiOutput['geo']['autocomplete']['results'] | undefined
	handleAutocompleteSelection: (item: AutocompleteResult) => void
	addressCombobox: ComboboxStore
	setSearchTerm: (value: string) => void
	countryNotSelected: boolean
}

/**
 * A single street/city autocomplete field, backed by the shared `addressCombobox` store. Rendered
 * conditionally (only one of street1/city ever shows an autocomplete field at a time, per
 * `addressVisibility`) rather than conditionally _called_ as a plain function - as an actual component it's
 * free to use hooks (`useCallback`) internally without running afoul of the rules of hooks.
 */
const AddressAutocompleteField = ({
	fieldName,
	fieldLabel,
	fieldRequired,
	form,
	results,
	handleAutocompleteSelection,
	addressCombobox,
	setSearchTerm,
	countryNotSelected,
}: AddressAutocompleteFieldProps) => {
	const { value, onChange, ...fieldProps } = form.getInputProps(fieldName)

	const handleOptionSubmit = useCallback(
		(optionValue: string) => {
			const item = (results ?? []).find((result) => result.value === optionValue)
			if (item) {
				handleAutocompleteSelection(item)
				// `item.value` is the full "main_text, secondary_text" prediction text (only used above to
				// identify which option was picked) - it already contains city/state/country, so writing
				// it into street1 (or city) duplicates those once the address is composed for display.
				// `item.label` is Google's `structured_formatting.main_text` alone - just the street or
				// just the city, matching what this field is actually supposed to hold.
				form.setFieldValue(fieldName, item.label)
			}
			addressCombobox.closeDropdown()
		},
		[results, handleAutocompleteSelection, form, fieldName, addressCombobox]
	)

	const handleChange = useCallback(
		(event: React.ChangeEvent<HTMLInputElement>) => {
			const val = event.currentTarget.value
			onChange(val)
			setSearchTerm(val)
			addressCombobox.openDropdown()
		},
		[onChange, setSearchTerm, addressCombobox]
	)

	const handleFocus = useCallback(() => addressCombobox.openDropdown(), [addressCombobox])
	const handleBlur = useCallback(() => addressCombobox.closeDropdown(), [addressCombobox])

	return (
		<Combobox store={addressCombobox} onOptionSubmit={handleOptionSubmit}>
			<Combobox.Target>
				<TextInput
					label={fieldLabel}
					required={fieldRequired}
					disabled={countryNotSelected}
					value={value ?? ''}
					{...fieldProps}
					onChange={handleChange}
					onFocus={handleFocus}
					onBlur={handleBlur}
				/>
			</Combobox.Target>
			<Combobox.Dropdown>
				<Combobox.Options>
					{(results ?? []).map((item) => (
						<Combobox.Option value={item.value} key={item.value}>
							<Text className={classes.unmatchedText} truncate>
								{matchText(item.value, value)}
							</Text>
							<Text className={cx(classes.unmatchedText, classes.secondLine)} truncate>
								{item.subheading}
							</Text>
						</Combobox.Option>
					))}
				</Combobox.Options>
			</Combobox.Dropdown>
		</Combobox>
	)
}

const _AddressDrawer = forwardRef<HTMLButtonElement, AddressDrawerProps>(({ locationId, ...props }, ref) => {
	const [opened, handler] = useDisclosure(false)
	const [coordModalOpen, coordModalHandler] = useDisclosure(false)
	// Every other contact-info drawer (Phone/Email/Website/SocialMedia) confirms before discarding an
	// in-progress edit - this one didn't: its close button went straight to `handler.close()` with no
	// dirty-check at all, silently discarding whatever was being edited.
	const [unsavedModalOpen, unsavedModalHandler] = useDisclosure(false)
	const [searchTerm, setSearchTerm] = useState<string>('')
	const [search] = useDebouncedValue(searchTerm, 200)
	const [results, setResults] = useState<ApiOutput['geo']['autocomplete']['results']>()
	const [googlePlaceId, setGooglePlaceId] = useState<string>('')
	const [isSaved, setIsSaved] = useState(false)
	const form = useForm<FormSchema>({
		validate: schemaResolver(FormSchema, { sync: true }),
		initialValues: {
			id: '',
			data: { accessible: {}, addressVisibility: AddressVisibility.FULL },
		},
		transformValues: FormSchema.transform(schemaTransform).parse,
	})
	const { id: organizationId } = useOrgInfo()
	const { t, i18n } = useTranslation(['attribute', 'gov-dist'])
	const countryTranslation = new Intl.DisplayNames(i18n.language, { type: 'region' })
	const variants = useCustomVariant()
	const apiUtils = api.useUtils()

	const notifySave = useNewNotification({ displayText: 'Saved', icon: 'success' })

	// #region Get country/gov dist selection items
	const { data: countryOptions, isSuccess: countryOptionsLoaded } =
		api.fieldOpt.govDistsByCountryNoSub.useQuery(undefined, {
			refetchOnWindowFocus: false,
			select: (result) =>
				result.map(({ id, flag, cca2, govDist }) => ({
					flag,
					cca2,
					value: id,
					label: countryTranslation.of(cca2) ?? cca2,
					govDist: govDist.map(({ id: govDistId, tsKey, tsNs, abbrev }) => ({
						label: t(tsKey, { ns: tsNs }),
						value: govDistId,
						abbrev,
						// Raw (untranslated) key kept alongside the display `label` - needed to patch
						// `forVisitCardEdits`'s cache below, which stores `govDist` as `{abbrev, tsKey,
						// tsNs}` and translates it at render time via `useFormattedAddress`, not as
						// pre-translated text.
						tsKey,
						tsNs,
					})),
				})),
		})
	const govDistOptions = useMemo(() => {
		const selectedCountryId = form.values.data.countryId
		if (!selectedCountryId) {
			return []
		}
		const govDistItems =
			countryOptions?.find(({ value: countryId }) => countryId === selectedCountryId)?.govDist ?? []
		return govDistItems
	}, [countryOptions, form.values.data.countryId])

	// #endregion

	// #region Get initial address
	const { data, isLoading } = api.location.getAddress.useQuery(locationId ?? '', {
		enabled: Boolean(locationId) && countryOptionsLoaded,
		refetchOnWindowFocus: false,
		// @mantine/form's getInputProps forwards `value` straight to the DOM input - the API can
		// legitimately return `null` for any of these (no second address line, no coordinates yet,
		// etc.), which React warns about and can flip an input from controlled to uncontrolled
		// mid-edit. Coerce to the same "empty" representation used elsewhere for these fields.
		select: ({
			id,
			data: { addressVisibility, name, street1, street2, city, postCode, longitude, latitude, ...rest },
		}) => ({
			id,
			data: {
				...rest,
				name: name ?? '',
				street1: street1 ?? '',
				street2: street2 ?? '',
				city: city ?? '',
				postCode: postCode ?? '',
				longitude: longitude ?? undefined,
				latitude: latitude ?? undefined,
				addressVisibility: AddressVisibilitySchema.parse(addressVisibility),
			},
		}),
	})
	// Pulled out of the load effect below so "Discard" (added alongside the rest of this drawer's
	// unsaved-changes handling) can revert to the same last-loaded server data instead of wiping to
	// blank - unlike the other four contact-info drawers, this one previously had no Discard path at
	// all, so there was nothing to match here until now.
	const applyLoadedDataToForm = useCallback(() => {
		if (!data) {
			return
		}
		const { accessible, ...restData } = data.data
		const accessibleBoolean =
			accessible?.boolean === undefined ? 'null' : accessible.boolean ? 'true' : 'false'
		// FormSchema's inferred type reflects boolOrNull's post-transform output (boolean | null),
		// but Radio.Group requires the pre-transform string values ('true' | 'false' | 'null'),
		// which boolOrNull also accepts as input and converts back to boolean | null on submit.
		const formValues = {
			...data,
			data: { ...restData, accessible: { ...accessible, boolean: accessibleBoolean } },
		} as unknown as typeof data
		form.setValues(formValues)
		form.resetDirty(formValues)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [data])

	useEffect(() => {
		if (data && !isLoading) {
			applyLoadedDataToForm()
			setIsSaved(false)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [data, isLoading])
	// #endregion

	// #region Get org's services
	const { data: orgServices } = api.service.getNames.useQuery(
		{ organizationId: organizationId ?? '' },
		{
			select: (returnedData) =>
				returnedData.map(({ id, defaultText }) => ({ value: id, label: defaultText })),
			enabled: Boolean(organizationId),
			refetchOnWindowFocus: false,
		}
	)
	// #endregion

	// #region Mutation handling
	// `location.update`'s handler only ever returns `{ id }` (a `select: { id: true }` on the Prisma
	// call) - there's no full row to seed a cache from the way PhoneDrawer seeds its detail cache from
	// `upsert`'s response. Every field needed to patch the two caches this drawer's own trigger sits
	// next to on the page - `getAddress` (this drawer's own detail query) and `forVisitCardEdits` (the
	// address text VisitCard renders right beside it) - is already available in what was actually
	// submitted (`variables`, the second `onSuccess` argument) plus this component's own already-loaded
	// `countryOptions` lookup, so there's no need to wait on a fresh server read for either.
	const patchAddressCaches = useCallback(
		// Typed off the server schema's own pre-transform (client-facing) input, `z.input<typeof
		// ZUpdateSchema>` - NOT `TUpdateSchema` (that name is deceptive here: `ZUpdateSchema`'s
		// `.transform()` turns it into a Prisma `OrgLocationUpdateArgs` shape via `z.infer`, not the
		// `{id, data}` shape actually sent over the wire and handed to `onSuccess` below).
		(submitted: z.input<typeof ZUpdateSchema>) => {
			const { id, data } = submitted
			// Real fields this mutation accepts that don't appear in either `getAddress`'s or
			// `forVisitCardEdits`'s own output shape at all: `primary`, `geoJSON`, `geoWKT`, `deleted`,
			// `checkMigration`. Destructuring only the ones both caches actually have keeps the merges
			// below from ever handing react-query's `setData` an object carrying keys its declared
			// type doesn't have - a fresh object literal with extra keys fails typechecking outright,
			// not just a lint nit.
			const {
				name,
				street1,
				street2,
				city,
				postCode,
				countryId,
				govDistId,
				latitude,
				longitude,
				mailOnly,
				published,
				addressVisibility,
				accessible,
				services,
			} = data

			apiUtils.location.getAddress.setData(id, (old) => {
				if (!old) {
					return old
				}
				const nextData: typeof old.data = {
					...old.data,
					...(name !== undefined && { name }),
					...(street1 !== undefined && { street1 }),
					...(street2 !== undefined && { street2 }),
					...(city !== undefined && { city }),
					...(postCode !== undefined && { postCode }),
					// `countryId` is a required (non-nullable) column - unlike every other field here,
					// the schema still technically allows sending `null` to disconnect it. That's not
					// a real, supported case for this form (a location always has a country), so a
					// `null` is just left unpatched here rather than forced into a field whose real
					// type can't hold it; the background invalidate below still corrects this cache
					// for the rare case it actually happens.
					...(countryId !== undefined && countryId !== null && { countryId }),
					...(govDistId !== undefined && { govDistId }),
					...(latitude !== undefined && { latitude }),
					...(longitude !== undefined && { longitude }),
					...(mailOnly !== undefined && { mailOnly }),
					...(published !== undefined && { published }),
					// Cast: `addressVisibility` here is typed via this file's own `AddressVisibility`
					// import (`@weareinreach/db/enums`), while `old.data.addressVisibility` is typed via
					// Prisma's own generated `$Enums.AddressVisibility` - structurally identical (same
					// member names/values), but TS enums are nominal, so the two aren't assignable
					// without this.
					...(addressVisibility !== undefined && {
						addressVisibility: addressVisibility as typeof old.data.addressVisibility,
					}),
					...(services !== undefined && { services }),
					// `accessible` is its own partial sub-object on both sides - a plain top-level
					// spread would replace it outright instead of merging, dropping whichever half
					// (`supplementId`/`boolean`) wasn't part of this particular save.
					accessible:
						accessible !== undefined ? { ...old.data.accessible, ...accessible } : old.data.accessible,
				}
				return { ...old, data: nextData }
			})

			// Read back *after* the `getAddress` patch above, not before - `getAddress` is never
			// visibility-filtered (confirmed against its handler), so it's the only place the real
			// street1/street2/postCode/latitude/longitude still exist once `forVisitCardEdits`'s own
			// cache has ever nulled them out for a less-than-FULL visibility. Falling back to
			// `forVisitCardEdits`'s own previous value here (as an earlier version of this function
			// did) is exactly what caused a real reported bug: switching visibility from HIDDEN to
			// FULL without also re-touching street1 patched the new visibility in correctly, but left
			// street1 permanently `null` - there was no unfiltered value left anywhere to restore it
			// from, since the only cache that had ever seen it was itself the one doing the nulling.
			const rawAddress = apiUtils.location.getAddress.getData(id)?.data

			apiUtils.location.forVisitCardEdits.setData(id, (old) => {
				if (!old) {
					return old
				}
				// Only re-resolved when the corresponding id actually changed - resolving a
				// still-selected country/gov-dist to the very same value it already has costs nothing
				// per se, but doing it unconditionally would also (harmlessly) fire for every save
				// that touches neither field, at which point it's just noise.
				const nextCountry =
					countryId !== undefined ? countryOptions?.find((c) => c.value === countryId) : undefined
				const nextGovDist =
					govDistId !== undefined
						? govDistId === null
							? null
							: (countryOptions ?? []).flatMap((c) => c.govDist).find((g) => g.value === govDistId)
						: undefined

				const merged = {
					...old,
					...(name !== undefined && { name }),
					...(nextCountry && { country: { cca2: nextCountry.cca2 } }),
					...(nextGovDist !== undefined && {
						govDist: nextGovDist
							? { abbrev: nextGovDist.abbrev, tsKey: nextGovDist.tsKey, tsNs: nextGovDist.tsNs }
							: null,
					}),
					...(addressVisibility !== undefined && {
						addressVisibility: addressVisibility as typeof old.addressVisibility,
					}),
					street1: rawAddress?.street1 ?? old.street1,
					street2: rawAddress?.street2 ?? old.street2,
					city: rawAddress?.city ?? old.city,
					postCode: rawAddress?.postCode ?? old.postCode,
					latitude: rawAddress?.latitude ?? old.latitude,
					longitude: rawAddress?.longitude ?? old.longitude,
				}

				return applyAddressVisibilityEditMode(addressVisibility ?? old.addressVisibility, merged)
			})
		},
		[apiUtils, countryOptions]
	)

	const updateLocation = api.location.update.useMutation({
		onSuccess: (_data, variables) => {
			patchAddressCaches(variables)
			// Deliberately NOT invalidating `getAddress`/`forVisitCardEdits` - live-confirmed real bug
			// this used to cause elsewhere (Phone/Email/Website/SocialMedia drawers): marking a query
			// stale doesn't refetch it immediately, but the *next* time react-query naturally
			// re-checks it (a re-enable, a remount, a window-focus refetch) it refetches
			// automatically because the data is stale - and that refetch reads from the same database
			// confirmed to lag behind its own writes, silently overwriting the just-patched, correct
			// cache with a still-lagging response. The patch above is already the authoritative,
			// correct value; leaving these two unmarked keeps them "fresh" for the normal staleTime
			// window (~10 minutes, ~ui/lib/trpcClient.ts) instead of inviting that race. The three
			// below are different - none of them are patched at all, so they still need an eventual
			// (soft) refetch to pick up this change at all.
			apiUtils.location.forVisitCard.invalidate(undefined, { refetchType: 'none' })
			apiUtils.location.forLocationCard.invalidate(undefined, { refetchType: 'none' })
			apiUtils.location.forLocationPageEdits.invalidate(undefined, { refetchType: 'none' })
			setIsSaved(true)
			notifySave()
			setTimeout(() => handler.close(), 500)
		},
	})
	const handleUpdate = useCallback(() => {
		const changesOnly = filterObject(form.values.data, (key) => form.isDirty(`data.${key}`))

		updateLocation.mutate(
			FormSchema.transform(schemaTransform).parse({ id: form.values.id, data: changesOnly })
		)
	}, [form, updateLocation])

	// Matches the other four contact-info drawers' close-button behavior: only prompt when there's
	// actually something to lose.
	const handleClose = useCallback(() => {
		if (form.isDirty()) {
			unsavedModalHandler.open()
		} else {
			handler.close()
		}
	}, [form, unsavedModalHandler, handler])

	const handleModalSave = useCallback(() => {
		handleUpdate()
		unsavedModalHandler.close()
	}, [handleUpdate, unsavedModalHandler])

	const handleDiscard = useCallback(() => {
		applyLoadedDataToForm()
		unsavedModalHandler.close()
		handler.close()
	}, [applyLoadedDataToForm, unsavedModalHandler, handler])

	useEffect(() => {
		if (isSaved && isSaved === form.isDirty()) {
			setIsSaved(false)
		}
	}, [form, isSaved])

	// #endregion

	// #region Google autocomplete/geocoding

	const { data: autoCompleteSearch } = api.geo.autocomplete.useQuery(
		{ search, fullAddress: form.values.data.addressVisibility === AddressVisibility.FULL },
		{
			enabled: search !== '',
			refetchOnWindowFocus: false,
		}
	)

	useEffect(() => {
		if (autoCompleteSearch?.results.length) {
			setResults(autoCompleteSearch.results)
		}
	}, [autoCompleteSearch])

	const { data: geoCodedAddress } = api.geo.geoByPlaceId.useQuery(googlePlaceId, {
		enabled: googlePlaceId !== '',
		refetchOnWindowFocus: false,
	})
	useEffect(() => {
		if (geoCodedAddress?.result) {
			const addressVisibility = form.values.data.addressVisibility
			const isFullAddress = addressVisibility === AddressVisibility.FULL
			const { result } = geoCodedAddress

			const country = countryOptions?.find(({ cca2 }) => cca2 === result.country)
			const govDist = country?.govDist.find(({ abbrev }) => abbrev === result.govDist)

			const formattedStreet1 =
				compact([result.streetNumber, result.streetName]).length === 2
					? compact([result.streetNumber, result.streetName]).join(' ')
					: undefined
			const valuesToSet = {
				...(isFullAddress && {
					street1: formattedStreet1,
					street2: result.street2,
				}),
				city: result.city,
				postCode: isFullAddress ? result.postCode : null,
				...(country && { countryId: country.value }),
				...(govDist && { govDistId: govDist.value }),
				latitude: result.geometry.location.lat,
				longitude: result.geometry.location.lng,
				geoWKT: createWktFromLatLng({
					latitude: result.geometry.location.lat,
					longitude: result.geometry.location.lng,
				}),
			}

			form.setValues({
				id: form.values.id,
				data: {
					...form.values.data,
					...valuesToSet,
				},
			})
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [geoCodedAddress])

	const getGoogleMapCheckDistanceURL = useCallback(
		(formValues: typeof form.values) => {
			const origin = compact([
				formValues.data.street1,
				formValues.data.street2,
				formValues.data.city,
				govDistOptions.find(({ value }) => value === formValues.data.govDistId)?.label,
				formValues.data.postCode,
				countryOptions?.find(({ value }) => value === formValues.data.countryId)?.label,
			]).join(', ')

			const destination = [formValues.data.latitude, formValues.data.longitude].join(',')

			const url = `https://www.google.com/maps/dir/?api=1&origin=${encodeURI(origin)}&destination=${encodeURI(
				destination
			)}&travelmode=walking`
			return url
		},
		[countryOptions, form, govDistOptions]
	)
	const gMapCheckDistance = getGoogleMapCheckDistanceURL(form.values)
	// #endregion

	// #region Dropdown item components/handling

	const handleAutocompleteSelection = useCallback(
		(item: AutocompleteResult) => {
			if (!item.placeId) {
				return
			}
			setGooglePlaceId(item.placeId)
		},
		[setGooglePlaceId]
	)

	const countryNotSelected = !form.values.data.countryId || form.values.data.countryId === ''

	// Only one of Street1Input/CityInput ever renders an autocomplete field at a time (they're
	// mutually exclusive on `addressVisibility`), so a single Combobox store covers both.
	const addressCombobox = useCombobox({
		onDropdownClose: () => addressCombobox.resetSelectedOption(),
	})

	// #endregion
	const addressFieldRequired = form.values.data.addressVisibility === AddressVisibility.FULL

	const renderCountryOption = useCallback(
		({ option }: ComboboxLikeRenderOptionInput<ComboboxItem>) => {
			const country = countryOptions?.find(({ value }) => value === option.value)
			return <Text>{`${country?.flag ?? ''} ${option.label}`}</Text>
		},
		[countryOptions]
	)

	const Street1Input =
		form.values.data.addressVisibility === AddressVisibility.FULL ? (
			<AddressAutocompleteField
				fieldName='data.street1'
				fieldLabel='Address'
				fieldRequired={addressFieldRequired}
				form={form}
				results={results}
				handleAutocompleteSelection={handleAutocompleteSelection}
				addressCombobox={addressCombobox}
				setSearchTerm={setSearchTerm}
				countryNotSelected={countryNotSelected}
			/>
		) : (
			<TextInput label='Address' disabled={countryNotSelected} {...form.getInputProps('data.street1')} />
		)

	const CityInput =
		form.values.data.addressVisibility === AddressVisibility.FULL ? (
			<TextInput label='City' required disabled={countryNotSelected} {...form.getInputProps('data.city')} />
		) : (
			<AddressAutocompleteField
				fieldName='data.city'
				fieldLabel='City'
				fieldRequired={true}
				form={form}
				results={results}
				handleAutocompleteSelection={handleAutocompleteSelection}
				addressCombobox={addressCombobox}
				setSearchTerm={setSearchTerm}
				countryNotSelected={countryNotSelected}
			/>
		)

	return (
		<>
			<Drawer.Root onClose={handleClose} opened={opened} position='right'>
				<Drawer.Overlay />
				<Drawer.Content className={classes.drawerContent}>
					<Drawer.Header>
						<Group wrap='nowrap' justify='space-between' w='100%'>
							<Breadcrumb option='close' onClick={handleClose} />
							<Button
								variant='primary-icon'
								leftIcon={<Icon icon={isSaved ? 'carbon:checkmark' : 'carbon:save'} />}
								onClick={handleUpdate}
								loading={updateLocation.isPending}
								disabled={!form.isDirty()}
							>
								Save
							</Button>
						</Group>
					</Drawer.Header>
					<Drawer.Body className={classes.drawerBody}>
						<Stack gap={24} align='center'>
							<Title order={2}>Edit Location</Title>
							<TextInput label='Name' required {...form.getInputProps('data.name')} />
							<Stack w='100%'>
								<Stack gap={0} w='100%'>
									<Select
										label='Address visibility'
										data={addressVisibilityOptions}
										{...form.getInputProps('data.addressVisibility')}
									/>
								</Stack>
								<Stack gap={0}>
									<Select
										label='Country'
										data={countryOptions ?? []}
										renderOption={renderCountryOption}
										required
										searchable
										styles={{ dropdown: { width: 'fit-content !important' } }}
										{...form.getInputProps('data.countryId')}
									/>
									{Street1Input}
									<TextInput disabled={countryNotSelected} {...form.getInputProps('data.street2')} />
								</Stack>
								<Group wrap='nowrap'>{CityInput}</Group>
								<Group wrap='nowrap'>
									<Select
										label='State'
										data={govDistOptions}
										required={Boolean(govDistOptions.length)}
										disabled={!govDistOptions.length || countryNotSelected}
										searchable
										styles={{ dropdown: { width: 'fit-content !important' } }}
										{...form.getInputProps('data.govDistId')}
									/>
									<TextInput
										label='Postal code'
										required={addressFieldRequired}
										disabled={countryNotSelected}
										{...form.getInputProps('data.postCode')}
									/>
								</Group>
								<Stack gap={0}>
									<Group wrap='nowrap'>
										<TextInput
											required
											label='Latitude'
											disabled={countryNotSelected}
											{...form.getInputProps('data.latitude')}
										/>
										<TextInput
											required
											label='Longitude'
											disabled={countryNotSelected}
											{...form.getInputProps('data.longitude')}
										/>
									</Group>
									{isExternal(gMapCheckDistance) && (
										<Link external href={gMapCheckDistance}>
											<Group wrap='nowrap' gap={8}>
												<Icon icon='carbon:launch' />
												<Text variant={variants.Text.utility3}>Check distance to address on Google Map</Text>
											</Group>
										</Link>
									)}
								</Stack>
								<Divider />
								<Radio.Group
									label='Is this location wheelchair accessible?'
									size='xs'
									{...form.getInputProps('data.accessible.boolean')}
								>
									<Group wrap='nowrap'>
										<Radio value='true' label='Accessible' classNames={{ label: classes.radioLabel }} />
										<Radio value='false' label='Not accessible' classNames={{ label: classes.radioLabel }} />
										<Radio value='null' label='No info' classNames={{ label: classes.radioLabel }} />
									</Group>
								</Radio.Group>
							</Stack>
							<Divider w='100%' />
							<MultiSelectPopover
								label='Services available'
								data={orgServices}
								fullWidth
								{...form.getInputProps('data.services')}
							/>
						</Stack>
					</Drawer.Body>
				</Drawer.Content>
			</Drawer.Root>
			<Modal opened={coordModalOpen} onClose={coordModalHandler.close}>
				<Stack>
					<Text>Please ensure that the full address is correct to get the correct coordinates</Text>
					<Button onClick={coordModalHandler.close}>Close</Button>
				</Stack>
			</Modal>
			<Modal opened={unsavedModalOpen} onClose={unsavedModalHandler.close} title='Unsaved Changes'>
				<Stack align='center'>
					<Text>You have unsaved changes</Text>
					<Group wrap='nowrap'>
						<Button
							variant='primary-icon'
							leftIcon={<Icon icon='carbon:save' />}
							loading={updateLocation.isPending}
							onClick={handleModalSave}
						>
							Save
						</Button>
						<Button variant='secondaryLg' onClick={handleDiscard}>
							Discard
						</Button>
					</Group>
				</Stack>
			</Modal>

			<Stack>
				<Box component='button' onClick={handler.open} ref={ref} {...props} />
			</Stack>
		</>
	)
})
_AddressDrawer.displayName = 'AddressDrawer'
export const AddressDrawer = createPolymorphicComponent<'button', AddressDrawerProps>(_AddressDrawer)

interface AddressDrawerProps extends ButtonProps {
	locationId?: string
}
