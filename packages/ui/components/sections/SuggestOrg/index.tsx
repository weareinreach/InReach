import {
	Alert,
	Anchor,
	Checkbox,
	Combobox,
	Divider,
	Group,
	Loader,
	Modal,
	Radio,
	Stack,
	Text,
	Textarea,
	TextInput,
	Title,
	Tooltip,
	useCombobox,
} from '@mantine/core'
import { schemaResolver } from '@mantine/form'
import { useDebouncedValue, useDisclosure } from '@mantine/hooks'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next/pages'
import { route } from 'nextjs-routes'
import {
	type ChangeEventHandler,
	type Dispatch,
	type FocusEventHandler,
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
import { Button } from '~ui/components/core/Button'
import { useCustomVariant } from '~ui/hooks'
import { Icon } from '~ui/icon'
import { trpc as api } from '~ui/lib/trpcClient'
import { ModalTitle } from '~ui/modals/ModalTitle'

import { SuggestionFormProvider, useForm } from './context'
import classes from './index.module.css'
import { Communities, OrgQuickView, ServiceTypes } from './modals'

export const SuggestOrg = ({ authPromptState, variant = 'public', onDataPortalSave }: SuggestOrgProps) => {
	const [mounted, setMounted] = useState(false)
	useEffect(() => {
		setMounted(true)
	}, [])

	const [modalOpen, modalHandler] = useDisclosure(false)
	const { overlay, setOverlay, hasAuth } = authPromptState ?? {}

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
	const dataPortalApi = api.organization.createOrgFromDataPortal.useMutation({
		onError: (error) => {
			setSubmitError(error.message)
		},
	})

	const validate = useMemo(() => schemaResolver(SuggestionSchema, { sync: true }), [])
	const form = useForm({
		validate,
		validateInputOnBlur: true,
	})
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
	const renderTwoLineOption = useCallback(
		(label: string, description?: string) => (
			<Stack gap={4} className={classes.twoLines}>
				<Text variant={variants.Text.utility1}>{label}</Text>
				{description && <Text variant={variants.Text.utility4darkGray}>{description}</Text>}
			</Stack>
		),
		[variants]
	)
	const orgNameCombobox = useCombobox({
		onDropdownClose: () => orgNameCombobox.resetSelectedOption(),
	})
	const addressCombobox = useCombobox({
		onDropdownClose: () => addressCombobox.resetSelectedOption(),
	})
	const [placeId, setPlaceId] = useState('')
	const [loading, setLoading] = useState(true)
	const [searchLocation, setSearchLocation] = useState('')
	const [locSearchInput] = useDebouncedValue(searchLocation, 400)
	const [orgNameInput, setOrgNameInput] = useState('')
	const [debouncedOrgName] = useDebouncedValue(orgNameInput, 400)
	// Debounced off the form's own live value (updates every keystroke) rather than a blur-triggered
	// snapshot, so the duplicate-check starts as soon as typing pauses instead of waiting for the field
	// to lose focus - closes most of the gap between "pasted a duplicate URL" and "Save gets disabled."
	const [debouncedOrgWebsite] = useDebouncedValue(form.values.orgWebsite, 400)
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
		() => ({ name: debouncedOrgName, website: debouncedOrgWebsite ?? '' }),
		[debouncedOrgName, debouncedOrgWebsite]
	)
	const { data: potentialMatches, isFetching: isSearchingMatches } =
		api.organization.getPotentialMatches.useQuery(potentialMatchesInput, {
			enabled: Boolean(debouncedOrgName || debouncedOrgWebsite),
		})

	const hasMatches = Boolean(potentialMatches && potentialMatches.length > 0)
	// True while either field's 400ms debounce hasn't caught up yet (just stopped typing) OR the query
	// itself is still fetching - both count as "don't know yet," so Save must stay disabled through the
	// whole window, not just while the network request is literally in flight.
	const isMatchingPending =
		isSearchingMatches ||
		orgNameInput !== debouncedOrgName ||
		(form.values.orgWebsite ?? '') !== (debouncedOrgWebsite ?? '')
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

	// The org behind an exact website match, if any - Data Portal mode links straight to its edit page
	// instead of just blocking, since staff (unlike a public submitter) can actually go fix/update it.
	const websiteMatchedOrg = useMemo(
		() => potentialMatches?.find((match) => match.websiteMatch) ?? null,
		[potentialMatches]
	)

	// Suggested domain when the typed website is a near-miss (e.g. a typo) of an org whose name already
	// matched - a softer signal than an exact match, so it's dismissable rather than a hard block.
	const websiteNearMatch = useMemo(
		() => potentialMatches?.find((match) => match.websiteNearMatch)?.websiteNearMatch ?? null,
		[potentialMatches]
	)

	// Shared by the public submit button and all three Data Portal save buttons - the duplicate-check
	// gating is identical regardless of who's creating the org.
	const submitDisabled =
		!form.isValid() ||
		Object.keys(form.errors).length !== 0 ||
		isMatchingPending ||
		isWebsiteMatch ||
		(Boolean(websiteNearMatch) && !bypassNearMissWebsite)

	useEffect(() => {
		setBypassNearMissWebsite(false)
	}, [debouncedOrgWebsite])

	// Name similarity is informational only - it never blocks slug generation or submission.
	// Only a website/domain match (below) is treated as an actual duplicate.
	useEffect(() => {
		if (mounted && !generateSlug && debouncedOrgName.trim() !== '') {
			setGenerateSlug(true)
		}
	}, [mounted, generateSlug, debouncedOrgName])

	const handleInspectMatch = (match: ApiOutput['organization']['getPotentialMatches'][number]) =>
		setInspectMatch(match)

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
		// Data Portal users are always already authenticated and permissioned - this login nudge only
		// applies to the public form.
		if (variant !== 'public' || !setOverlay) return
		if (mounted && !hasAuth && !overlay && countryIdValue) {
			setOverlay(true)
			form.setFieldValue('countryId', '')
		}
	}, [variant, mounted, hasAuth, overlay, countryIdValue, setOverlay, form.setFieldValue])

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
		setBypassNearMissWebsite(false)
	}, [form, setBypassNearMissWebsite, setOrgNameInput, setSearchLocation])

	const handleDismiss = useCallback(() => {
		modalHandler.close()
	}, [modalHandler])

	// Data Portal mode has three save behaviors instead of one submit. What each one actually does
	// (close the modal, navigate to the edit page, show a toast) is the caller's concern - this just
	// creates the org and reports back which button was pressed plus enough info (slug/name) to act on it.
	const handleDataPortalSubmit = useCallback(
		(mode: 'save' | 'saveAndEdit' | 'saveAndNew') => {
			invariant(form.values.orgWebsite)
			setSubmitError(null)
			const orgName = form.values.orgName
			dataPortalApi.mutate(
				{ ...form.values, orgWebsite: form.values.orgWebsite },
				{
					// Use the server's actual persisted slug, not form.values.orgSlug - the server can
					// correct a stale client-cached slug at creation time (see createOrgSuggestion), and
					// navigating Save & Edit to the wrong slug would land on the wrong org entirely.
					onSuccess: (result) => {
						if (mode === 'saveAndNew') {
							resetFormState()
						}
						onDataPortalSave?.(mode, { slug: result.slug, name: orgName })
					},
				}
			)
		},
		[form.values, dataPortalApi, onDataPortalSave, resetFormState]
	)

	const handleOrgNameOptionSubmit = useCallback(
		(value: string) => {
			const item = orgAutocompleteOptions.find((option) => option.value === value)
			if (item) {
				setOrgNameInput(item.label)
				form.setFieldValue('orgName', item.label)
				if (variant === 'dataPortal') {
					// Staff can act on a match directly - jump straight to editing the real record in a new
					// tab, rather than the public form's read-only inspect view.
					window.open(
						route({ pathname: '/org/[slug]/edit', query: { slug: item.match.slug } }),
						'_blank',
						'noopener,noreferrer'
					)
				} else {
					handleInspectMatch(item.match)
				}
			}
			orgNameCombobox.closeDropdown()
		},
		[orgAutocompleteOptions, form, orgNameCombobox, setOrgNameInput, variant]
	)

	const handleOrgNameInputChange: ChangeEventHandler<HTMLInputElement> = useCallback(
		(event) => {
			const val = event.currentTarget.value
			setOrgNameInput(val)
			form.setFieldValue('orgName', val)
			orgNameCombobox.openDropdown()
		},
		[form, orgNameCombobox, setOrgNameInput]
	)

	const handleOrgNameInputFocus = useCallback(() => orgNameCombobox.openDropdown(), [orgNameCombobox])

	const handleOrgNameInputBlur: FocusEventHandler<HTMLInputElement> = useCallback(
		(event) => {
			form.getInputProps('orgName').onBlur(event)
			orgNameCombobox.closeDropdown()
		},
		[form, orgNameCombobox]
	)

	const handleAddressOptionSubmit = useCallback(
		(value: string) => {
			const item = addressAutocompleteOptions.find((option) => option.value === value)
			if (item) {
				setSearchLocation(item.value)
				setPlaceId(item.placeId)
			}
			addressCombobox.closeDropdown()
		},
		[addressAutocompleteOptions, addressCombobox, setSearchLocation, setPlaceId]
	)

	const handleAddressInputChange: ChangeEventHandler<HTMLInputElement> = useCallback(
		(event) => {
			setSearchLocation(event.currentTarget.value)
			addressCombobox.openDropdown()
		},
		[addressCombobox, setSearchLocation]
	)

	const handleAddressInputFocus = useCallback(() => addressCombobox.openDropdown(), [addressCombobox])

	const handleAddressInputBlur = useCallback(() => addressCombobox.closeDropdown(), [addressCombobox])

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
					if (variant === 'public') {
						setSubmitError(null)
						suggestOrgApi.mutate({ ...form.values, orgWebsite: form.values.orgWebsite })
						return
					}
					// Enter-to-submit in Data Portal mode defaults to the primary "Save" behavior; Save & Edit
					// and Save & New are only reachable via their explicit buttons.
					handleDataPortalSubmit('save')
				})}
			>
				<Stack gap={40} pb={40}>
					<Stack gap={24}>
						{variant === 'public' ? (
							<>
								<Title order={1}>{t('body.suggest-org')}</Title>
								<Text>{t('body.intro-text')}</Text>
							</>
						) : (
							// No <Title> here - the modal's own header already says "Add an organization"; a second
							// one right below it would be redundant.
							<Text>
								Fill in the initial information to create the organization in the InReach Data Portal. Then
								choose whether you&apos;d like to continue editing the organization or assign the task to
								others.
							</Text>
						)}
					</Stack>
					<Divider />
					<Stack gap={40}>
						{variant === 'public' && (
							<Stack gap={16}>
								<Title order={2}>{t('body.required-info')}</Title>
								<Text>{t('body.accept-country')}</Text>
							</Stack>
						)}
						<Radio.Group
							name='country'
							label={t('form.org-country')}
							required
							withAsterisk
							{...form.getInputProps('countryId')}
						>
							<Stack gap={0}>{countrySelections}</Stack>
						</Radio.Group>
						<Combobox store={orgNameCombobox} onOptionSubmit={handleOrgNameOptionSubmit}>
							<Combobox.Target>
								<TextInput
									label={t('form.org-name')}
									placeholder={t('form.placeholder-name')}
									required
									disabled={!countrySelected}
									error={form.getInputProps('orgName').error}
									value={orgNameInput}
									onChange={handleOrgNameInputChange}
									onFocus={handleOrgNameInputFocus}
									onBlur={handleOrgNameInputBlur}
								/>
							</Combobox.Target>
							<Combobox.Dropdown>
								<Combobox.Options>
									{orgAutocompleteOptions.map((option) => (
										<Combobox.Option value={option.value} key={option.value}>
											{renderTwoLineOption(option.label)}
										</Combobox.Option>
									))}
								</Combobox.Options>
							</Combobox.Dropdown>
						</Combobox>

						<TextInput
							label={t('form.org-website')}
							placeholder={t('form.placeholder-website')}
							required
							withAsterisk
							disabled={!countrySelected}
							{...form.getInputProps('orgWebsite')}
						/>

						{isMatchingPending && Boolean(form.values.orgWebsite) && (
							<Group gap={8} wrap='nowrap'>
								<Loader size={14} />
								<Text size='sm' c='dimmed'>
									Checking for duplicates...
								</Text>
							</Group>
						)}

						{/* Suppressed while isMatchingPending - otherwise a stale match from the previous
						    website value can flash on screen for the ~400ms before the debounce catches up
						    and the query refetches (e.g. right after a "Save & New" reset). */}
						{!isMatchingPending && isWebsiteMatch && variant === 'dataPortal' && websiteMatchedOrg && (
							<Text size='sm' c='red'>
								This website is already associated with{' '}
								<Anchor
									href={route({ pathname: '/org/[slug]/edit', query: { slug: websiteMatchedOrg.slug } })}
									target='_blank'
									rel='noopener noreferrer'
									c='red'
									fw={600}
								>
									{websiteMatchedOrg.name}
								</Anchor>
								. Open it in a new tab to edit that organization instead.
							</Text>
						)}
						{!isMatchingPending && isWebsiteMatch && variant === 'public' && (
							<Text size='sm' c='red'>
								This website is already associated with an existing organization in our system. If you believe
								this is an error, please double check the URL you entered.
							</Text>
						)}

						{!isMatchingPending && !isWebsiteMatch && websiteNearMatch && (
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
					<Stack gap={40}>
						{variant === 'public' && <Title order={2}>{t('body.additional-info')}</Title>}
						<Combobox store={addressCombobox} onOptionSubmit={handleAddressOptionSubmit}>
							<Combobox.Target>
								<TextInput
									label={t('form.org-address')}
									leftSection={<Icon icon='carbon:search' height={16} className={classes.leftIcon} />}
									placeholder={t('form.placeholder-address')}
									disabled={!countrySelected}
									autoComplete='off'
									value={searchLocation}
									onChange={handleAddressInputChange}
									onFocus={handleAddressInputFocus}
									onBlur={handleAddressInputBlur}
								/>
							</Combobox.Target>
							<Combobox.Dropdown>
								<Combobox.Options className={classes.autocompleteWrapper}>
									{addressAutocompleteOptions.map((option) => (
										<Combobox.Option value={option.value} key={option.value}>
											{renderTwoLineOption(option.label, option.description)}
										</Combobox.Option>
									))}
								</Combobox.Options>
							</Combobox.Dropdown>
						</Combobox>
						{variant === 'dataPortal' && (
							<Textarea
								label='Description'
								placeholder="Enter a description of the organization's mission and services"
								disabled={!countrySelected}
								autosize
								minRows={3}
								{...form.getInputProps('description')}
							/>
						)}
						{variant === 'public' && (
							<>
								<ServiceTypes disabled={!countrySelected} serviceTypes={formOptions?.serviceTypes ?? []} />
								<Communities disabled={!countrySelected} communities={formOptions?.communities ?? []} />
							</>
						)}
						<Divider />
						{submitError && (
							<Alert icon={<Icon icon='carbon:warning' />} title='Unable to submit' color='red'>
								{submitError}
								{variant === 'dataPortal' && websiteMatchedOrg && (
									<>
										{' '}
										<Anchor
											href={route({ pathname: '/org/[slug]/edit', query: { slug: websiteMatchedOrg.slug } })}
											target='_blank'
											rel='noopener noreferrer'
											c='red'
											fw={600}
										>
											Open {websiteMatchedOrg.name} in a new tab to edit it instead.
										</Anchor>
									</>
								)}
							</Alert>
						)}
						{variant === 'public' ? (
							<Stack gap={16} align='center'>
								<Button
									w='fit-content'
									variant={variants.Button.primaryLg}
									disabled={submitDisabled}
									type='submit'
								>
									{t('form.btn-submit')}
								</Button>
								<Text variant={variants.Text.utility4}>{t('body.subject-review')}</Text>
							</Stack>
						) : (
							<Group justify='center' gap={12}>
								<Tooltip label='Create this organization and close' withinPortal>
									<Button
										type='button'
										variant={variants.Button.primarySm}
										leftSection={<Icon icon='carbon:save' height={16} />}
										// secondarySm/primarySm hide their icon section by default (Button.module.css
										// `.secondarySmSection`/`.primarySmSection { display: none }`) since they're
										// normally used text-only elsewhere in the app - an inline style here
										// overrides that CSS class rule for just these three buttons, without
										// touching the shared variant. primarySm (solid black when active) matches
										// this app's other forms' save-button convention, rather than secondarySm's
										// white/bordered look.
										styles={{ section: { display: 'inline-flex' } }}
										disabled={submitDisabled}
										onClick={() => handleDataPortalSubmit('save')}
									>
										Save
									</Button>
								</Tooltip>
								<Tooltip label='Create this organization and open it for editing' withinPortal>
									<Button
										type='button'
										variant={variants.Button.primarySm}
										leftSection={<Icon icon='carbon:edit' height={16} />}
										styles={{ section: { display: 'inline-flex' } }}
										disabled={submitDisabled}
										onClick={() => handleDataPortalSubmit('saveAndEdit')}
									>
										Save & Edit
									</Button>
								</Tooltip>
								<Tooltip label='Create this organization and start adding another' withinPortal>
									<Button
										type='button'
										variant={variants.Button.primarySm}
										leftSection={<Icon icon='carbon:add' height={16} />}
										styles={{ section: { display: 'inline-flex' } }}
										disabled={submitDisabled}
										onClick={() => handleDataPortalSubmit('saveAndNew')}
									>
										Save & New
									</Button>
								</Tooltip>
							</Group>
						)}
					</Stack>
				</Stack>
				{variant === 'public' && (
					<Modal
						opened={modalOpen}
						onClose={modalHandler.close}
						title={<ModalTitle breadcrumb={{ option: 'close', onClick: modalHandler.close }} />}
					>
						<Stack align='center' gap={16}>
							<Title order={1}>🎉</Title>
							<Title order={2}>{t('modal.thank-you', { org: submittedOrgName })}</Title>
							<Text variant={variants.Text.darkGray} ta='center'>
								{t('modal.thank-you-sub')}
							</Text>
							<Button variant={variants.Button.secondarySm} onClick={handleDismiss}>
								{t('modal.dismiss')}
							</Button>
						</Stack>
					</Modal>
				)}

				<OrgQuickView opened={!!inspectMatch} onClose={() => setInspectMatch(null)} match={inspectMatch} />
			</form>
		</SuggestionFormProvider>
	)
}
interface SuggestOrgProps {
	/** Required for `variant: 'public'` (default) - not used in `'dataPortal'` mode. */
	authPromptState?: {
		overlay: boolean
		setOverlay: Dispatch<SetStateAction<boolean>>
		hasAuth: boolean
	}
	/**
	 * `'public'` (default): the Suggest-an-Org page - single "Submit for review" button, login nudge, "thank
	 * you, subject to review" confirmation. `'dataPortal'`: the Data Portal's Add Org modal - same
	 * fields/validation/duplicate-check, but three save buttons and no public-facing copy.
	 */
	variant?: 'public' | 'dataPortal'
	/**
	 * `variant: 'dataPortal'` only - called after a successful create with which button was pressed and the
	 * created org's slug/name, so the caller can decide what to do (close, navigate, invalidate, notify).
	 */
	onDataPortalSave?: (
		mode: 'save' | 'saveAndEdit' | 'saveAndNew',
		created: { slug: string; name: string }
	) => void
}
