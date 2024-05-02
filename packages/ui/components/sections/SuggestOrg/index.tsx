import {
	Autocomplete,
	type AutocompleteItem,
	Button,
	createStyles,
	Divider,
	Modal,
	Radio,
	rem,
	Space,
	Stack,
	Text,
	TextInput,
	Title,
} from '@mantine/core'
import { type UseFormReturnType, zodResolver } from '@mantine/form'
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

import { type ApiOutput } from '@weareinreach/api'
import { SuggestionSchema } from '@weareinreach/api/schemas/create/browserSafe/suggestOrg'
import { Link } from '~ui/components/core/Link'
import { useCustomVariant } from '~ui/hooks/useCustomVariant'
import { Icon } from '~ui/icon'
import { trpc as api } from '~ui/lib/trpcClient'
import { ModalTitle } from '~ui/modals/ModalTitle'

import { type SuggestionForm, SuggestionFormProvider, useForm } from './context'
import { Communities, ServiceTypes } from './modals'

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
			<Text variant={variants.Text.utility4darkGray}>{description}</Text>
		</Stack>
	)
})
SelectItemTwoLines.displayName = 'Selection Item'

interface OrgExistsErrorProps {
	queryResult: ApiOutput['organization']['checkForExisting']
	form: UseFormReturnType<SuggestionForm, (values: SuggestionForm) => SuggestionForm>
	setGenerateSlug: Dispatch<SetStateAction<boolean>>
}
interface SuggestOrgProps {
	authPromptState: {
		overlay: boolean
		setOverlay: Dispatch<SetStateAction<boolean>>
		hasAuth: boolean
	}
}

const OrgExistsError = ({ queryResult, form, setGenerateSlug }: OrgExistsErrorProps) => {
	const variants = useCustomVariant()
	const handleDismiss = useCallback(() => {
		form.clearFieldError('orgName')
		setGenerateSlug(true)
	}, [form, setGenerateSlug])

	if (!queryResult) {
		return null
	}
	const { name, published, slug } = queryResult
	const key = published ? 'form.error-exists-active' : 'form.error-exists-inactive'

	return (
		<>
			<Trans
				i18nKey={key}
				ns='suggestOrg'
				values={{ org: name }}
				components={{
					Link: (
						<Link href={{ pathname: '/org/[slug]', query: { slug } }} variant={variants.Link.inheritStyle}>
							.
						</Link>
					),
				}}
				shouldUnescape={true}
			/>
			<Space h={8} />
			<Trans
				i18nKey='form.error-exists-dismiss'
				ns='suggestOrg'
				components={{
					Dismiss: (
						<Link variant={variants.Link.inheritStyle} onClick={handleDismiss}>
							.
						</Link>
					),
				}}
			/>
		</>
	)
}

export const SuggestOrg = ({ authPromptState }: SuggestOrgProps) => {
	const [modalOpen, modalHandler] = useDisclosure(false)
	const { overlay, setOverlay, hasAuth } = authPromptState
	const suggestOrgApi = api.organization.createNewSuggestion.useMutation({
		onSuccess: () => modalHandler.open(),
	})
	const form = useForm({
		validate: zodResolver(SuggestionSchema),
		validateInputOnBlur: true,
	})
	const { classes: locationClasses } = useLocationStyles()
	const { t } = useTranslation(['suggestOrg', 'services', 'attribute'])
	const simpleLocale = (locale: string) => (locale.length === 2 ? locale : locale.substring(0, 1))
	const variants = useCustomVariant()
	const [placeId, setPlaceId] = useState('')
	const [loading, setLoading] = useState(true)
	const [searchLocation, setSearchLocation] = useState('')
	const [locSearchInput] = useDebouncedValue(searchLocation, 400)
	const [orgName, setOrgName] = useState<string>()
	const [generateSlug, setGenerateSlug] = useState(false)
	const router = useRouter()

	const countrySelected = Boolean(form.values.countryId)

	const { data: formOptions, isLoading, isSuccess } = api.organization.suggestionOptions.useQuery()

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
				label: `${result.value}, ${result.subheading}`,
				placeId: result.placeId,
			})) ?? [],
		[addressCandidates]
	)

	const { data: addressResult } = api.geo.geoByPlaceId.useQuery(placeId, {
		enabled: Boolean(placeId) && placeId !== '',
	})
	useEffect(() => {
		if (addressResult?.result) {
			const { result } = addressResult
			form.setFieldValue('orgAddress', {
				street1: `${result.streetNumber} ${result.streetName}`,
				city: result.city,
				govDist: result.govDist,
				postCode: result.postCode,
			})
		}
	}, [addressResult, form])

	const { data: existingOrg } = api.organization.checkForExisting.useQuery(orgName ?? '', {
		enabled: Boolean(orgName && orgName !== ''),
	})
	useEffect(() => {
		if (!existingOrg && !generateSlug) {
			form.clearFieldError('orgName')
			setGenerateSlug(true)
		} else if (existingOrg) {
			form.setFieldError(
				'orgName',
				<OrgExistsError {...{ queryResult: existingOrg, form, setGenerateSlug }} />
			)
		}
	}, [existingOrg, generateSlug, form])

	const { data: generatedSlug } = api.organization.generateSlug.useQuery(orgName ?? '', {
		enabled: Boolean(orgName && orgName !== '' && generateSlug),
	})
	useEffect(() => {
		if (generatedSlug) {
			form.setFieldValue('orgSlug', generatedSlug)
			setGenerateSlug(false)
		}
	}, [form, generatedSlug])

	useEffect(() => {
		if (loading && formOptions && isSuccess && !isLoading) {
			setLoading(false)
		}
	}, [loading, formOptions, isSuccess, isLoading])

	useEffect(() => {
		if (!hasAuth && !overlay && form.values.countryId) {
			setOverlay(true)
			form.setFieldValue('countryId', '')
		}
	}, [hasAuth, overlay, form.values.countryId, form, setOverlay])

	const countryTranslation = useMemo(
		() =>
			new Intl.DisplayNames([router.locale.toLowerCase()], {
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

	const handleOrgNameBlur = useCallback<FocusEventHandler<HTMLInputElement>>(
		(e) => {
			setOrgName(e.target.value)
		},
		[setOrgName]
	)

	const handleAddressSelection = useCallback(
		(e: AutocompleteItem) => {
			setPlaceId(e.placeId)
		},
		[setPlaceId]
	)

	const handleDismiss = useCallback(() => {
		form.setValues({
			communityFocus: [],
			// communityParent: [],
			countryId: '',
			orgName: '',
			orgSlug: '',
			orgWebsite: '',
			orgAddress: {},
		})
		modalHandler.close()
	}, [form, modalHandler])

	if (loading) {
		return null
	}
	return (
		<SuggestionFormProvider form={form}>
			<form onSubmit={form.onSubmit(() => suggestOrgApi.mutate(form.values))}>
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
						<TextInput
							label={t('form.org-name')}
							placeholder={t('form.placeholder-name')}
							required
							disabled={!countrySelected}
							{...form.getInputProps('orgName')}
							onBlur={handleOrgNameBlur}
						/>
						<TextInput
							label={t('form.org-website')}
							placeholder={t('form.placeholder-website')}
							disabled={!countrySelected}
							{...form.getInputProps('orgWebsite')}
						/>
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
							onItemSubmit={handleAddressSelection}
							value={searchLocation}
							onChange={setSearchLocation}
						/>
						<ServiceTypes disabled={!countrySelected} serviceTypes={formOptions?.serviceTypes ?? []} />
						<Communities disabled={!countrySelected} communities={formOptions?.communities ?? []} />
						<Divider />
						<Stack spacing={16} align='center'>
							<Button
								w='fit-content'
								variant={variants.Button.primaryLg}
								disabled={!form.isValid() || Object.keys(form.errors).length !== 0}
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
						<Title order={2}>{t('modal.thank-you', { org: form.values.orgName })}</Title>
						<Text variant={variants.Text.darkGray} align='center'>
							{t('modal.thank-you-sub')}
						</Text>
						<Button variant={variants.Button.secondarySm} onClick={handleDismiss}>
							{t('modal.dismiss')}
						</Button>
					</Stack>
				</Modal>
			</form>
		</SuggestionFormProvider>
	)
}
interface ItemProps extends ComponentPropsWithRef<'div'> {
	label: string
	description: string
}
