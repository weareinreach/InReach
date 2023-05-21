import {
	Autocomplete,
	Box,
	type ButtonProps,
	Checkbox,
	createPolymorphicComponent,
	createStyles,
	Divider,
	Drawer,
	Group,
	Radio,
	rem,
	Select,
	Stack,
	Text,
	TextInput,
	Title,
} from '@mantine/core'
import { useForm, zodResolver } from '@mantine/form'
import { useDebouncedValue, useDisclosure } from '@mantine/hooks'
import compact from 'just-compact'
import filterObject from 'just-filter-object'
import { useTranslation } from 'next-i18next'
import { forwardRef, useEffect, useState } from 'react'
import reactStringReplace from 'react-string-replace'
import { z } from 'zod'

import { type ApiOutput } from '@weareinreach/api'
import { boolOrNull, transformNullString } from '@weareinreach/api/schemas/common'
import { Breadcrumb } from '~ui/components/core/Breadcrumb'
import { Button } from '~ui/components/core/Button'
import { isExternal, Link } from '~ui/components/core/Link'
import { useCustomVariant } from '~ui/hooks/useCustomVariant'
import { useOrgInfo } from '~ui/hooks/useOrgInfo'
import { Icon } from '~ui/icon'
import { createWktFromLatLng } from '~ui/lib/geotools'
import { trpc as api } from '~ui/lib/trpcClient'

import { MultiSelectPopover } from './MultiSelectPopover'

const useStyles = createStyles((theme) => ({
	drawerContent: {
		borderRadius: `${rem(32)} 0 0 0`,
		minWidth: '40vw',
	},
	drawerBody: {
		padding: `${rem(40)} ${rem(32)}`,
		'&:not(:only-child)': {
			paddingTop: rem(40),
		},
	},
	unmatchedText: {
		...theme.other.utilityFonts.utility2,
		color: theme.other.colors.secondary.darkGray,
		display: 'block',
	},
	secondLine: { ...theme.other.utilityFonts.utility4, color: theme.other.colors.secondary.darkGray },
	matchedText: {
		color: theme.other.colors.secondary.black,
	},
	radioLabel: {
		...theme.other.utilityFonts.utility4,
	},
	radioButton: {
		height: rem(16),
		width: rem(16),
	},
}))

const FormSchema = z.object({
	id: z.string(),
	data: z
		.object({
			name: z.string().nullable(),
			street1: z.string(),
			street2: z.string().nullable().transform(transformNullString),
			city: z.string(),
			postCode: z.string().nullable().transform(transformNullString),
			primary: z.coerce.boolean(),
			mailOnly: z.boolean().nullable(),
			longitude: z.coerce.number().nullable(),
			latitude: z.coerce.number().nullable(),
			geoWKT: z.string().nullable().transform(transformNullString),
			published: z.coerce.boolean(),
			deleted: z.coerce.boolean(),
			countryId: z.string().nullable(),
			govDistId: z.string().nullable(),
			accessible: z
				.object({
					supplementId: z.string(),
					boolean: boolOrNull,
				})
				.partial(),
			services: z.string().array(),
		})
		.partial(),
})

const schemaTransform = ({ id, data }: FormSchema) => ({
	id,
	data: {
		...data,
		name: data.name === null ? undefined : data.name,
	},
})

const _AddressDrawer = forwardRef<HTMLButtonElement, AddressDrawerProps>(({ locationId, ...props }, ref) => {
	const [opened, handler] = useDisclosure(true)
	const [_search, setSearch] = useState<string>('')
	const [search] = useDebouncedValue(_search, 200)
	const [results, setResults] = useState<ApiOutput['geo']['autocomplete']['results']>()
	const [govDistOpts, setGovDistOpts] = useState<{ value: string; label: string }[]>([])
	const [countryOpts, setCountryOpts] = useState<CountryItem[]>([])
	const [googlePlaceId, setGooglePlaceId] = useState<string>('')
	const [isSaved, setIsSaved] = useState(false)
	const form = useForm<FormSchema>({
		validate: zodResolver(FormSchema),
		initialValues: { id: '', data: { accessible: {} } },
		transformValues: FormSchema.transform(schemaTransform).parse,
	})
	const { id: organizationId, slug: orgSlug } = useOrgInfo()
	const { t } = useTranslation(['attribute', 'country', 'gov-dist'])
	const { classes, cx } = useStyles()
	const variants = useCustomVariant()
	const apiUtils = api.useContext()

	// #region Get initial address
	const { data, isLoading } = api.location.getAddress.useQuery(locationId ?? '', {
		enabled: Boolean(locationId),
		refetchOnWindowFocus: false,
	})
	useEffect(() => {
		if (data && !isLoading) {
			form.setValues(data)
			form.resetDirty()
			setIsSaved(false)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [data, isLoading])
	// #endregion

	// #region Get org's services
	const { data: orgServices } = api.service.getNames.useQuery(
		{ organizationId },
		{
			enabled: Boolean(organizationId),
			select: (data) => data.map(({ id, defaultText }) => ({ value: id, label: defaultText })),
			refetchOnWindowFocus: false,
		}
	)
	// #endregion

	// #region Get country/gov dist selection items
	const { data: govDistsByCountry } = api.fieldOpt.govDistsByCountryNoSub.useQuery(undefined, {
		refetchOnWindowFocus: false,
	})
	useEffect(() => {
		if (govDistsByCountry) {
			setCountryOpts(
				govDistsByCountry.map(({ id, flag, tsNs, tsKey }) => ({
					value: id,
					flag,
					label: t(tsKey, { ns: tsNs }),
				}))
			)
			if (!form.values?.data?.countryId) {
				form.setFieldValue('data.country', govDistsByCountry.find(({ cca2 }) => cca2 === 'US')?.id)
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [govDistsByCountry])
	useEffect(() => {
		if (govDistsByCountry && form.values?.data?.countryId) {
			const dists = govDistsByCountry.find(({ id }) => id === form.values.data.countryId)?.govDist
			setGovDistOpts(
				dists?.map(({ id, tsKey, tsNs }) => ({ label: t(tsKey, { ns: tsNs }), value: id })) ?? []
			)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [form.values?.data?.countryId])
	// #endregion

	// #region Mutation handling
	const updateLocation = api.location.update.useMutation({
		onSuccess: () => {
			apiUtils.location.getAddress.invalidate(locationId ?? '')
			setIsSaved(true)
		},
	})
	const handleUpdate = () => {
		const changesOnly = filterObject(form.values.data, (key) => form.isDirty(`data.${key}`))

		updateLocation.mutate(
			FormSchema.transform(schemaTransform).parse({ id: form.values.id, data: changesOnly })
		)
	}

	useEffect(() => {
		if (isSaved && isSaved === form.isDirty()) {
			setIsSaved(false)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [form.values.data])

	// #endregion

	// #region Google autocomplete/geocoding
	const { data: autoCompleteSearch } = api.geo.autocomplete.useQuery(
		{ search, fullAddress: true },
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
			const { result } = geoCodedAddress
			const country = govDistsByCountry?.find(({ cca2 }) => cca2 === result.country)
			const govDist = country?.govDist.find(({ abbrev }) => abbrev === result.govDist)

			form.setValues({
				id: form.values.id,
				data: {
					...form.values.data,
					street1: `${result.streetNumber} ${result.streetName}`,
					street2: result.street2,
					city: result.city,
					postCode: result.postCode,
					...(country ? { countryId: country.id } : {}),
					...(govDist ? { govDistId: govDist.id } : {}),
					latitude: result.geometry.location.lat,
					longitude: result.geometry.location.lng,
					geoWKT: createWktFromLatLng({
						latitude: result.geometry.location.lat,
						longitude: result.geometry.location.lng,
					}),
				},
			})
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [geoCodedAddress])

	const gMapCheckDistance = `https://www.google.com/maps/dir/?api=1&origin=${encodeURI(
		compact([
			form.values?.data?.street1,
			form.values?.data?.street2,
			form.values?.data?.city,
			govDistOpts.find(({ value }) => value === form.values?.data?.govDistId)?.label,
			form.values?.data?.postCode,
			countryOpts.find(({ value }) => value === form.values?.data?.countryId)?.label,
		]).join(', ')
	)}&destination=${encodeURI(
		[form.values?.data?.latitude, form.values?.data?.longitude].join(',')
	)}&travelmode=walking`
	// #endregion

	// #region Dropdown item components/handling
	const matchText = (result: string, textToMatch?: string) => {
		if (!textToMatch) return result
		const matcher = new RegExp(`(${textToMatch})`, 'ig')
		const replaced = reactStringReplace(result, matcher, (match, i) => (
			<span key={i} className={classes.matchedText}>
				{match}
			</span>
		))
		return replaced
	}
	const AutoCompleteItem = forwardRef<HTMLDivElement, AutocompleteItem>(
		({ value, subheading, placeId, ...others }: AutocompleteItem, ref) => {
			return (
				<div ref={ref} {...others}>
					<Text className={classes.unmatchedText} truncate>
						{matchText(value, form.values.data?.street1)}
					</Text>
					<Text className={cx(classes.unmatchedText, classes.secondLine)} truncate>
						{subheading}
					</Text>
				</div>
			)
		}
	)
	AutoCompleteItem.displayName = 'AutoCompleteItem'
	const handleAutocompleteSelection = (item: AutocompleteItem) => {
		if (!item.placeId) return
		setGooglePlaceId(item.placeId)
	}

	const CountryItem = forwardRef<HTMLDivElement, CountryItem>(({ label, flag, ...props }, ref) => {
		return (
			<div ref={ref} {...props}>
				<Text>{`${flag} ${label}`}</Text>
			</div>
		)
	})
	CountryItem.displayName = 'CountryItem'
	// #endregion

	return (
		<>
			<Drawer.Root onClose={handler.close} opened={opened} position='right'>
				<Drawer.Overlay />
				<Drawer.Content className={classes.drawerContent}>
					<Drawer.Header>
						<Group noWrap position='apart' w='100%'>
							<Breadcrumb option='close' onClick={handler.close} />
							<Button
								variant='primary-icon'
								leftIcon={<Icon icon={isSaved ? 'carbon:checkmark' : 'carbon:save'} />}
								onClick={handleUpdate}
								loading={updateLocation.isLoading}
								disabled={!form.isDirty()}
							>
								Save
							</Button>
						</Group>
					</Drawer.Header>
					<Drawer.Body className={classes.drawerBody}>
						<Stack spacing={24} align='center'>
							<Title order={2}>Edit Location</Title>
							<TextInput label='Name' required {...form.getInputProps('data.name')} />
							<Stack w='100%'>
								<Stack spacing={0}>
									<Autocomplete
										itemComponent={AutoCompleteItem}
										data={results ?? []}
										label='Address'
										withinPortal
										onItemSubmit={handleAutocompleteSelection}
										{...form.getInputProps('data.street1')}
										onChange={(val) => {
											setSearch(val)
											form.getInputProps('data.street1').onChange(val)
										}}
									/>
									<TextInput {...form.getInputProps('data.street2')} />
								</Stack>
								<Group noWrap>
									<TextInput label='City' required {...form.getInputProps('data.city')} />
									<Select
										label='State'
										data={govDistOpts}
										required={Boolean(govDistOpts.length)}
										disabled={!govDistOpts.length}
										searchable
										withinPortal
										styles={{ dropdown: { width: 'fit-content !important' } }}
										{...form.getInputProps('data.govDistId')}
									/>
								</Group>
								<Group noWrap>
									<Select
										label='Country'
										data={countryOpts}
										itemComponent={CountryItem}
										required
										withinPortal
										searchable
										styles={{ dropdown: { width: 'fit-content !important' } }}
										{...form.getInputProps('data.countryId')}
									/>
									<TextInput
										label='Postal code'
										required
										{...form.getInputProps('data.postCode')}
										disabled={!form.values?.data?.countryId}
									/>
								</Group>
								<Stack spacing={0}>
									<Group noWrap>
										<TextInput label='Latitude' {...form.getInputProps('data.latitude')} />
										<TextInput label='Longitude' {...form.getInputProps('data.longitude')} />
									</Group>
									{isExternal(gMapCheckDistance) && (
										<Link external href={gMapCheckDistance}>
											<Group noWrap spacing={8}>
												<Icon icon='carbon:launch' />
												<Text variant={variants.Text.utility3}>Check distance to address on Google Map</Text>
											</Group>
										</Link>
									)}
								</Stack>
								<Divider />
								<Radio.Group
									label='Is this location wheelchair accessible?'
									{...form.getInputProps('data.accessible.boolean')}
								>
									<Group noWrap>
										<Radio
											value='true'
											label='Accessible'
											classNames={{ label: classes.radioLabel, radio: classes.radioButton }}
										/>
										<Radio
											value='false'
											label='Not accessible'
											classNames={{ label: classes.radioLabel, radio: classes.radioButton }}
										/>
										<Radio
											value='null'
											label='No info'
											classNames={{ label: classes.radioLabel, radio: classes.radioButton }}
										/>
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
							<Stack spacing={0} w='100%'>
								<Text variant={variants.Text.utility1}>Show on org?</Text>
								<Checkbox
									label={`Show this location's address on the organiation page`}
									classNames={{ label: classes.radioLabel }}
									{...form.getInputProps('data.published', { type: 'checkbox' })}
								/>
							</Stack>
							<Stack spacing={0} w='100%'>
								<Text variant={variants.Text.utility1}>Mailing address only?</Text>
								<Checkbox
									label={`This is NOT a physical location`}
									classNames={{ label: classes.radioLabel }}
									{...form.getInputProps('data.mailOnly', { type: 'checkbox' })}
								/>
							</Stack>
						</Stack>
					</Drawer.Body>
				</Drawer.Content>
			</Drawer.Root>

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
type FormSchema = z.infer<typeof FormSchema>

interface AutocompleteItem {
	value: string
	name?: string
	subheading?: string
	placeId?: string
}
interface CountryItem {
	value: string
	label: string
	flag: string
}
