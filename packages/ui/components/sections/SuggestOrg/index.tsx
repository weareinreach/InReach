import {
	Alert,
	Autocomplete,
	type AutocompleteItem,
	Button,
	Checkbox,
	createStyles,
	Divider,
	Modal,
	Radio,
	rem,
	Stack,
	Text,
	TextInput,
	Title,
} from '@mantine/core'
import { zodResolver } from '@mantine/form'
import { useDebouncedValue, useDisclosure } from '@mantine/hooks'
import { useRouter } from 'next/router'
import { Trans, useTranslation } from 'next-i18next'
import {
	type ComponentPropsWithRef,
	type Dispatch,
	type FocusEventHandler,
	forwardRef,
	type SetStateAction,
	useCallback,
	useEffect,
	useMemo,
	useState,
} from 'react'
import invariant from 'tiny-invariant'

import { searchBoxEvent } from '@weareinreach/analytics/events'
import { type ApiOutput } from '@weareinreach/api'
import { SuggestionSchema } from '@weareinreach/api/schemas/create/browserSafe/suggestOrg'
import { useCustomVariant } from '~ui/hooks'
import { Icon } from '~ui/icon'
import { trpc as api } from '~ui/lib/trpcClient'
import { ModalTitle } from '~ui/modals/ModalTitle'

import { SuggestionFormProvider, useForm } from './context'
import { Communities, OrgQuickView, ServiceTypes } from './modals'

const useLocationStyles = createStyles((theme) => ({
	autocompleteWrapper: {
		padding: 0,
		borderBottom: `${rem(1)} solid ${theme.other.colors.tertiary.coolGray}`,
	},
	leftIcon: {
		color: theme.other.colors.secondary.black,
	},
}))
const useSelectItemStyles = createStyles((theme) => ({
	singleLine: {
		borderBottom: `${rem(1)} solid ${theme.other.colors.tertiary.coolGray}`,
		padding: `${theme.spacing.sm} ${theme.spacing.xl}`,
		alignItems: 'center',
		'&:hover': {
			backgroundColor: theme.other.colors.primary.lightGray,
			cursor: 'pointer',
		},
		'&:last-child': {
			borderBottom: 'none',
		},
	},
	twoLines: {
		padding: `${theme.spacing.sm} ${theme.spacing.xl}`,
		'&:hover': {
			backgroundColor: theme.other.colors.primary.lightGray,
			cursor: 'pointer',
		},
	},
}))

const SelectItemTwoLines = forwardRef<HTMLDivElement, ItemProps>(({ label, description, ...others }, ref) => {
	const variants = useCustomVariant()
	const { classes } = useSelectItemStyles()
	return (
		<Stack ref={ref} spacing={4} {...others} className={classes.twoLines}>
			<Text variant={variants.Text.utility1}>{label}</Text>
			{description && <Text variant={variants.Text.utility4darkGray}>{description}</Text>}
		</Stack>
	)
})
SelectItemTwoLines.displayName = 'Selection Item'

export const SuggestOrg = ({ authPromptState }: SuggestOrgProps) => {
	const [mounted, setMounted] = useState(false)
	useEffect(() => {
		setMounted(true)
	}, [])

	const [modalOpen, modalHandler] = useDisclosure(false)
	const { overlay, setOverlay, hasAuth } = authPromptState

	const [submitError, setSubmitError] = useState<string | null>(null)
	const [submittedOrgName, setSubmittedOrgName] = useState('')
	const suggestOrgApi = api.organization.createNewSuggestion.useMutation({
		onSuccess: () => {
			searchBoxEvent.suggestResourceSubmit(form.values.orgName)
			setSubmitError(null)
			setSubmittedOrgName(form.values.orgName)
			resetFormState()
			modalHandler.open()
		},
		onError: (error) => {
			setSubmitError(error.message)
		},
	})

	const validate = useMemo(() => zodResolver(SuggestionSchema), [])
	const form = useForm({
		validate,
		validateInputOnBlur: true,
	})
	const { classes: locationClasses } = useLocationStyles()
	const { t } = useTranslation(['suggestOrg', 'services', 'attribute', 'common'])
	const simpleLocale = useCallback(
		(locale?: string) => (!locale || locale.length === 2 ? (locale ?? 'en') : locale.substring(0, 2)),
		[]
	)
	const normalize = useCallback((str: string) => {
		return str
			.toLowerCase()
			.trim()
			.replace(/[^a-z0-9]/g, '')
	}, [])

	const variants = useCustomVariant()
	const [placeId, setPlaceId] = useState('')
	const [loading, setLoading] = useState(true)
	const [searchLocation, setSearchLocation] = useState('')
	const [locSearchInput] = useDebouncedValue(searchLocation, 400)
	const [orgNameInput, setOrgNameInput] = useState('')
	const [debouncedOrgName] = useDebouncedValue(orgNameInput, 400)
	const [orgWebsite, setOrgWebsite] = useState<string>()
	const [inspectMatch, setInspectMatch] = useState<
		ApiOutput['organization']['getPotentialMatches'][number] | null
	>(null)
	const [dismissMatches, setDismissMatches] = useState(false)
	const [generateSlug, setGenerateSlug] = useState(false)
	const [bypassNearMissWebsite, setBypassNearMissWebsite] = useState(false)
	const router = useRouter()

	const countrySelected = Boolean(form.values.countryId)

	const { data: formOptions, isLoading, isSuccess, isError } = api.organization.suggestionOptions.useQuery()

	useEffect(() => {
		if (isSuccess || isError) {
			setLoading(false)
		}
	}, [isSuccess, isError])

	const { data: addressCandidates } = api.geo.autocomplete.useQuery(
		{ search: locSearchInput, locale: simpleLocale(router.locale), fullAddress: true },
		{
			enabled: Boolean(locSearchInput) && locSearchInput !== '',
			refetchOnWindowFocus: false,
		}
	)
	const addressAutocompleteOptions = useMemo(
		() =>
			addressCandidates?.results.map((result) => ({
				value: `${result.value}, ${result.subheading}`,
				label: result.value,
				description: result.subheading,
				placeId: result.placeId,
			})) ?? [],
		[addressCandidates]
	)

	const { data: addressResult } = api.geo.geoByPlaceId.useQuery(placeId, {
		enabled: !!placeId,
		retry: false,
	})

	const currentPostCode = form.values.orgAddress?.postCode
	useEffect(() => {
		if (addressResult?.result) {
			const { result } = addressResult
			if (currentPostCode !== result.postCode) {
				form.setFieldValue('orgAddress', {
					street1: `${result.streetNumber} ${result.streetName}`,
					city: result.city,
					govDist: result.govDist,
					postCode: result.postCode,
				})
			}
		}
	}, [addressResult, currentPostCode, form.setFieldValue])

	const potentialMatchesInput = useMemo(
		() => ({ name: debouncedOrgName, website: orgWebsite ?? '' }),
		[debouncedOrgName, orgWebsite]
	)
	const { data: potentialMatches, isFetching: isSearchingMatches } =
		api.organization.getPotentialMatches.useQuery(potentialMatchesInput, {
			enabled: Boolean(debouncedOrgName || orgWebsite),
		})

	const hasMatches = Boolean(potentialMatches && potentialMatches.length > 0)
	const isMatchingPending = isSearchingMatches || orgNameInput !== debouncedOrgName
	const currentOrgSlug = form.values.orgSlug

	const orgAutocompleteOptions = useMemo(
		() =>
			potentialMatches?.map((match) => ({
				value: match.name,
				label: match.name,
				match,
			})) ?? [],
		[potentialMatches]
	)

	const isWebsiteMatch = useMemo(
		() => Boolean(potentialMatches?.some((match) => match.websiteMatch)),
		[potentialMatches]
	)

	// Suggested domain when the typed website is a near-miss (e.g. a typo) of an org whose name already
	// matched - a softer signal than an exact match, so it's dismissable rather than a hard block.
	const websiteNearMatch = useMemo(
		() => potentialMatches?.find((match) => match.websiteNearMatch)?.websiteNearMatch ?? null,
		[potentialMatches]
	)

	useEffect(() => {
		setBypassNearMissWebsite(false)
	}, [orgWebsite])

	// Name similarity is informational only - it never blocks slug generation or submission.
	// Only a website/domain match (below) is treated as an actual duplicate.
	useEffect(() => {
		if (mounted && !generateSlug && debouncedOrgName.trim() !== '') {
			setGenerateSlug(true)
		}
	}, [mounted, generateSlug, debouncedOrgName])

	const handleInspectMatch = (match: ApiOutput['organization']['getPotentialMatches'][number]) =>
		setInspectMatch(match)

	const handleWebsiteBlur = useCallback<FocusEventHandler<HTMLInputElement>>((e) => {
		setOrgWebsite(e.target.value)
	}, [])

	const { data: generatedSlug } = api.organization.generateSlug.useQuery(debouncedOrgName, {
		enabled: Boolean(debouncedOrgName && debouncedOrgName !== '' && generateSlug),
	})
	useEffect(() => {
		if (generatedSlug && currentOrgSlug !== generatedSlug) {
			form.setFieldValue('orgSlug', generatedSlug)
			if (generateSlug) setGenerateSlug(false)
		}
	}, [generatedSlug, currentOrgSlug, generateSlug, form.setFieldValue])

	const countryIdValue = form.values.countryId
	useEffect(() => {
		if (mounted && !hasAuth && !overlay && countryIdValue) {
			setOverlay(true)
			form.setFieldValue('countryId', '')
		}
	}, [mounted, hasAuth, overlay, countryIdValue, setOverlay, form.setFieldValue])

	const countryTranslation = useMemo(
		() =>
			new Intl.DisplayNames([simpleLocale(router.locale).toLowerCase()], {
				type: 'region',
			}),
		[router.locale]
	)

	const countrySelections = useMemo(
		() =>
			Array.isArray(formOptions?.countries)
				? formOptions.countries.map(({ id, cca2 }) => {
						return <Radio key={id} label={countryTranslation.of(cca2)} value={id} />
					})
				: null,
		[formOptions?.countries, countryTranslation]
	)

	const handleAddressSelection = useCallback(
		(e: AutocompleteItem) => {
			setPlaceId(e.placeId)
		},
		[setPlaceId]
	)

	// Clears every piece of state that drives the duplicate-detection warnings, so a successful
	// submission doesn't leave a stale "this is a duplicate" message on screen for the next entry.
	const resetFormState = useCallback(() => {
		form.setValues({
			communityFocus: [],
			countryId: '',
			orgName: '',
			orgSlug: '',
			orgWebsite: '',
			orgAddress: {},
			serviceCategories: [],
		})
		setSearchLocation('')
		setOrgNameInput('')
		setOrgWebsite(undefined)
		setBypassNearMissWebsite(false)
	}, [form, setBypassNearMissWebsite, setOrgNameInput, setOrgWebsite, setSearchLocation])

	const handleDismiss = useCallback(() => {
		modalHandler.close()
	}, [modalHandler])

	if (!mounted || loading) {
		return null
	}
	return (
		<SuggestionFormProvider form={form}>
			<form
				onSubmit={form.onSubmit(() => {
					// form.onSubmit only invokes this callback once SuggestionSchema validation passes, which
					// requires orgWebsite to be a non-empty, valid URL - so it's always defined here even
					// though SuggestionForm types it as optional to allow an empty initial value.
					invariant(form.values.orgWebsite)
					setSubmitError(null)
					suggestOrgApi.mutate({ ...form.values, orgWebsite: form.values.orgWebsite })
				})}
			>
				<Stack spacing={40} pb={40}>
					<Stack spacing={24}>
						<Title order={1}>{t('body.suggest-org')}</Title>
						<Text>{t('body.intro-text')}</Text>
					</Stack>
					<Divider />
					<Stack spacing={40}>
						<Stack spacing={16}>
							<Title order={2}>{t('body.required-info')}</Title>
							<Text>{t('body.accept-country')}</Text>
						</Stack>
						<Radio.Group
							name='country'
							label={t('form.org-country')}
							required
							withAsterisk
							{...form.getInputProps('countryId')}
						>
							<Stack spacing={0}>{countrySelections}</Stack>
						</Radio.Group>
						<Autocomplete
							itemComponent={SelectItemTwoLines}
							label={t('form.org-name')}
							placeholder={t('form.placeholder-name')}
							required
							disabled={!countrySelected}
							{...form.getInputProps('orgName')}
							value={orgNameInput}
							onChange={(val) => {
								setOrgNameInput(val)
								form.setFieldValue('orgName', val)
							}}
							data={orgAutocompleteOptions as OrgAutocompleteItem[]}
							onItemSubmit={(item: OrgAutocompleteItem) => handleInspectMatch(item.match)}
							filter={() => true}
						/>

						<TextInput
							label={t('form.org-website')}
							placeholder={t('form.placeholder-website')}
							required
							withAsterisk
							disabled={!countrySelected}
							{...form.getInputProps('orgWebsite')}
							onBlur={(e) => {
								// form.getInputProps' own onBlur runs the field's validation (shows the error
								// text below) - it must not be replaced by our own onBlur, only supplemented.
								form.getInputProps('orgWebsite').onBlur(e)
								handleWebsiteBlur(e)
							}}
						/>

						{isWebsiteMatch && (
							<Text size='sm' color='red'>
								This website is already associated with an existing organization in our system. If you believe
								this is an error, please double check the URL you entered.
							</Text>
						)}

						{!isWebsiteMatch && websiteNearMatch && (
							<Checkbox
								mt='sm'
								label={`Did you mean ${websiteNearMatch}? Check this box if the website you entered is correct and this is a different organization.`}
								checked={bypassNearMissWebsite}
								onChange={(event) => setBypassNearMissWebsite(event.currentTarget.checked)}
								styles={(theme) => ({
									label: { color: theme.colors.red?.[7] ?? 'red', fontWeight: 500 },
								})}
							/>
						)}
					</Stack>

					<Divider />
					<Stack spacing={40}>
						<Title order={2}>{t('body.additional-info')}</Title>
						<Autocomplete
							itemComponent={SelectItemTwoLines}
							classNames={{ itemsWrapper: locationClasses.autocompleteWrapper }}
							data={addressAutocompleteOptions}
							label={t('form.org-address')}
							icon={<Icon icon='carbon:search' className={locationClasses.leftIcon} />}
							placeholder={t('form.placeholder-address')}
							disabled={!countrySelected}
							autoComplete='off'
							onItemSubmit={handleAddressSelection}
							value={searchLocation}
							onChange={setSearchLocation}
						/>
						<ServiceTypes disabled={!countrySelected} serviceTypes={formOptions?.serviceTypes ?? []} />
						<Communities disabled={!countrySelected} communities={formOptions?.communities ?? []} />
						<Divider />
						{submitError && (
							<Alert icon={<Icon icon='carbon:warning' />} title='Unable to submit' color='red'>
								{submitError}
							</Alert>
						)}
						<Stack spacing={16} align='center'>
							<Button
								w='fit-content'
								variant={variants.Button.primaryLg}
								disabled={
									!form.isValid() ||
									Object.keys(form.errors).length !== 0 ||
									isMatchingPending ||
									isWebsiteMatch ||
									(Boolean(websiteNearMatch) && !bypassNearMissWebsite)
								}
								type='submit'
							>
								{t('form.btn-submit')}
							</Button>
							<Text variant={variants.Text.utility4}>{t('body.subject-review')}</Text>
						</Stack>
					</Stack>
				</Stack>
				<Modal
					opened={modalOpen}
					onClose={modalHandler.close}
					title={<ModalTitle breadcrumb={{ option: 'close', onClick: modalHandler.close }} />}
				>
					<Stack align='center' spacing={16}>
						<Title order={1}>🎉</Title>
						<Title order={2}>{t('modal.thank-you', { org: submittedOrgName })}</Title>
						<Text variant={variants.Text.darkGray} align='center'>
							{t('modal.thank-you-sub')}
						</Text>
						<Button variant={variants.Button.secondarySm} onClick={handleDismiss}>
							{t('modal.dismiss')}
						</Button>
					</Stack>
				</Modal>

				<OrgQuickView opened={!!inspectMatch} onClose={() => setInspectMatch(null)} match={inspectMatch} />
			</form>
		</SuggestionFormProvider>
	)
}
interface ItemProps extends ComponentPropsWithRef<'div'> {
	label: string
	description?: string
}

interface OrgAutocompleteItem extends AutocompleteItem {
	match: ApiOutput['organization']['getPotentialMatches'][number]
}

interface SuggestOrgProps {
	authPromptState: {
		overlay: boolean
		setOverlay: Dispatch<SetStateAction<boolean>>
		hasAuth: boolean
	}
}
