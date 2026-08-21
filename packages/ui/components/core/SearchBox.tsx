import {
	Center,
	Combobox,
	Group,
	Loader,
	ScrollArea,
	Text,
	TextInput,
	type TextInputProps,
	useCombobox,
	useMantineTheme,
} from '@mantine/core'
import { useForm, type UseFormReturnType } from '@mantine/form'
import { useDebouncedValue } from '@mantine/hooks'
import regexEscape from 'escape-string-regexp'
import { useRouter } from 'next/router'
import { Trans, useTranslation } from 'next-i18next/pages'
import {
	type Dispatch,
	type KeyboardEventHandler,
	type ReactNode,
	type SetStateAction,
	useCallback,
	useEffect,
	useMemo,
	useState,
} from 'react'
import reactStringReplace from 'react-string-replace'

import { searchBoxEvent } from '@weareinreach/analytics/events'
import { type ApiOutput } from '@weareinreach/api'
import { SearchParamsSchema } from '@weareinreach/api/schemas/routes/search'
import { useCustomVariant } from '~ui/hooks/useCustomVariant'
import { useSearchState } from '~ui/hooks/useSearchState'
import { Icon } from '~ui/icon'
import { cx } from '~ui/lib/cx'
import { trpc as api } from '~ui/lib/trpcClient'

import { trackSearchPerformance } from './search'
import classes from './SearchBox.module.css'

const DEFAULT_RADIUS = 200
const DEFAULT_UNIT = 'mi'
/** Sentinel option value for the "suggest a resource" row appended to org search results. */
const SUGGEST_VALUE = '__suggest-resource__'

/** Most of Google's autocomplete language options are only the two letter variants */
const simpleLocale = (locale: string) => (locale.length === 2 ? locale : locale.substring(0, 1))

const notBlank = (value?: string) => !!value && value.length > 0

const matchText = (result: string, textToMatch: string) => {
	const matcher = new RegExp(`(${regexEscape(textToMatch)})`, 'ig')
	return reactStringReplace(result, matcher, (match, i) => (
		<span key={i} className={classes.matchedText}>
			{match}
		</span>
	))
}

export const SearchBox = ({
	type,
	label,
	loadingManager,
	initialValue = '',
	pinToLeft,
	placeholderTextKey,
	setSearchValue,
}: SearchBoxProps) => {
	const variants = useCustomVariant()
	const theme = useMantineTheme()
	const { t } = useTranslation()
	const router = useRouter()
	const [locationSearch, setLocationSearch] = useState('')
	const { isLoading, setLoading } = loadingManager
	const isOrgSearch = type === 'organization'
	const { searchStateActions, searchState } = useSearchState()
	const form = useForm<FormValues>({ initialValues: { search: searchState.searchTerm ?? initialValue } })
	const [search] = useDebouncedValue(form.values.search, 400)

	// tRPC functions
	const { data: orgSearchData, isFetching: orgSearchLoading } = api.organization.searchName.useQuery(
		{ search },
		{
			enabled: notBlank(search) && isOrgSearch,
			refetchOnWindowFocus: false,
		}
	)
	const { data: autocompleteData, isFetching: autocompleteLoading } = api.geo.autocomplete.useQuery(
		{ search, locale: simpleLocale(router.locale) },
		{
			enabled: notBlank(search) && !isOrgSearch,
			refetchOnWindowFocus: false,
		}
	)
	const [results, setResults] = useState<AutocompleteItem[]>([])
	const [noResults, setNoResults] = useState(false)
	const [searchLoading, setSearchLoading] = useState(false)

	const isOrgSearchLoading = useCallback(
		(searchVal: string) => !orgSearchData && orgSearchLoading && notBlank(searchVal),
		[orgSearchData, orgSearchLoading]
	)
	const isLocSearchLoading = useCallback(
		(searchVal: string) => !autocompleteData?.results?.length && autocompleteLoading && notBlank(searchVal),
		[autocompleteData?.results?.length, autocompleteLoading]
	)

	useEffect(() => {
		if (isOrgSearchLoading(search) || isLocSearchLoading(search)) {
			setSearchLoading(true)
			setSearchValue?.(search)
			setResults([{ value: search, label: search, fetching: true }])
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [autocompleteData, autocompleteLoading, search, orgSearchData, orgSearchLoading])

	useEffect(() => {
		if (isOrgSearch) {
			if (orgSearchData && !orgSearchLoading && notBlank(search)) {
				if (orgSearchData.length === 0) {
					setNoResults(true)
					searchBoxEvent.zeroResults(search, 'organization', searchState.services[0] || 'all')
				}
				setResults(orgSearchData)
				setSearchLoading(false)
			}
		} else if (autocompleteData && !autocompleteLoading && notBlank(search)) {
			if (autocompleteData.status === 'ZERO_RESULTS') {
				setNoResults(true)
				searchBoxEvent.zeroResults(search, 'location', searchState.services[0] || 'all')
			}
			setResults(autocompleteData.results)
			setSearchLoading(false)
		}
		if (search === '') {
			setResults([])
			setNoResults(false)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [autocompleteData, autocompleteLoading, search, isOrgSearch, orgSearchData, orgSearchLoading])

	const { data: locationResult } = api.geo.geoByPlaceId.useQuery(locationSearch, {
		enabled: notBlank(locationSearch) && !isOrgSearch,
	})

	useEffect(() => {
		if (!locationResult?.result) {
			return void 0
		}
		const params = SearchParamsSchema.safeParse([
			locationResult.result.country,
			locationResult.result.geometry.location.lng,
			locationResult.result.geometry.location.lat,
			DEFAULT_RADIUS,
			DEFAULT_UNIT,
		])
		if (!params.success) {
			return void 0
		}
		router.push({
			pathname: '/search/[...params]',
			query: {
				params: params.data.map((val) => val.toString()),
			},
		})
		setLoading(false)
		return void 0
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [locationResult])

	const resetHandler = useCallback(() => {
		form.reset()
		form.values.search = ''
	}, [form])
	const rightIcon = useMemo(() => {
		if (isLoading || searchLoading) {
			return (
				<Group className={classes.rightIcon}>
					<Loader size={32} />
				</Group>
			)
		}
		if (form.values.search?.length > 0) {
			return (
				<Group gap={4} wrap='nowrap' className={classes.rightIcon} onClick={resetHandler}>
					<Text>{t('clear')}</Text>
					<Icon icon='carbon:close' />
				</Group>
			)
		}
		return undefined
	}, [isLoading, searchLoading, form.values.search?.length, classes.rightIcon, resetHandler, t])

	const fieldRole = (
		isOrgSearch
			? {
					placeholder: `${t(placeholderTextKey ?? 'search.organization-placeholder')}`,
					rightSection: rightIcon,
					leftSection: <Icon icon='carbon:search' className={classes.leftIcon} />,
					variant: 'default',
				}
			: {
					placeholder: `${t(placeholderTextKey ?? 'search.location-placeholder')}`,
					rightSection: rightIcon,
					leftSection: <Icon icon='carbon:location-filled' className={classes.leftIcon} />,
					variant: 'filled',
				}
	) satisfies Partial<TextInputProps>

	// org search: route to org page.
	// location search: pass placeId to tRPC (geo.geoByPlaceId), which will redirect to search after coordinates are fetched
	const selectionHandler = useCallback(
		(item: AutocompleteItem) => {
			setLoading(true)
			if (isOrgSearch) {
				if (!item.slug) {
					setLoading(false)
					return
				}
				searchStateActions.setSearchTerm(item.value)
				searchBoxEvent.searchOrg(search, item.value)
				router.push({
					pathname: '/org/[slug]',
					query: {
						slug: item.slug,
					},
				})
				setLoading(false)
			} else {
				if (!item.placeId) {
					setLoading(false)
					return
				}
				searchBoxEvent.searchLocation(item.value, item.placeId)
				// Capture the location demand in GA4 for demand analysis
				trackSearchPerformance({
					location: item.value,
					query: search,
					categoryId: searchState.services[0],
				})
				searchStateActions.setSearchTerm(item.value)
				setLocationSearch(item.placeId)
			}
		},
		[isOrgSearch, router, search, searchState.services, searchStateActions, setLoading, setLocationSearch]
	)

	const combobox = useCombobox({
		onDropdownClose: () => combobox.resetSelectedOption(),
	})

	// `Combobox.Dropdown` renders (and shows its bordered options container) purely based on the
	// combobox's own open/closed state, unlike the old `Autocomplete` this replaced, which hid itself
	// automatically whenever there was nothing to show. With nothing typed yet, `Combobox.Options`
	// renders none of its three conditional children, leaving an empty bordered box whose
	// `border-bottom` alone was visible as a stray line under the input. Only open on focus/change
	// once there's actually something to display.
	// `isOrgSearch && !orgSearchLoading` is also true before anything's been typed at all - the
	// query is simply `enabled: false` (not "loading"), not merely finished loading - so without
	// `notBlank(search)` this opened the dropdown (showing the "suggest an organization" prompt)
	// on bare focus, before the user had entered any search term.
	const hasDropdownContent =
		results.length > 0 || noResults || (isOrgSearch && !orgSearchLoading && notBlank(search))

	// Enter submits the top result without visually highlighting it while typing - matching the
	// previous Autocomplete's behavior. `combobox.selectFirstOption()` would do this via Mantine's
	// own keyboard-selection machinery, but it also paints the first option with the active/selected
	// background on every keystroke, which this component never did before.
	const handleKeyDown: KeyboardEventHandler<HTMLInputElement> = useCallback(
		(event) => {
			if (event.key === 'Enter') {
				const topItem = results[0]
				if (topItem) {
					selectionHandler(topItem)
				}
			}
		},
		[results, selectionHandler]
	)

	const handleOptionSubmit = useCallback(
		(value: string) => {
			if (value === SUGGEST_VALUE) {
				searchBoxEvent.suggestResource(form.values.search)
				router.push('/suggest')
				return
			}
			const item = results.find((result) => result.value === value)
			if (item) {
				selectionHandler(item)
			}
		},
		[results, selectionHandler, form.values.search, router]
	)

	const { onChange: searchOnChange, ...searchFieldProps } = form.getInputProps('search')

	return (
		<Combobox
			store={combobox}
			withinPortal
			position='bottom'
			middlewares={{ flip: false, shift: true }}
			onOptionSubmit={handleOptionSubmit}
			classNames={{
				options: classes.autocompleteWrapper,
				dropdown: pinToLeft ? cx(classes.resultContainer, classes.pinToLeft) : classes.resultContainer,
			}}
		>
			<Combobox.Target>
				<TextInput
					classNames={{
						input: cx(
							isOrgSearch
								? classes.autocompleteContainer
								: cx(classes.autocompleteContainer, classes.emptyLocation),
							rightIcon && classes.hasRightSection
						),
					}}
					radius='xl'
					disabled={isLoading}
					label={label}
					{...fieldRole}
					{...searchFieldProps}
					onChange={(event) => {
						searchOnChange(event)
						combobox.openDropdown()
					}}
					onFocus={() => {
						if (hasDropdownContent) {
							combobox.openDropdown()
						}
					}}
					onBlur={() => combobox.closeDropdown()}
					onKeyDown={handleKeyDown}
				/>
			</Combobox.Target>
			<Combobox.Dropdown>
				<ScrollArea.Autosize mah={280} type='scroll'>
					<Combobox.Options>
						{results.map((item) => {
							const { label: itemLabel, fetching, subheading } = item
							return (
								<Combobox.Option value={item.value} key={item.value} className={classes.itemComponent}>
									{fetching ? (
										<Center>
											<Loader />
										</Center>
									) : isOrgSearch ? (
										<Text
											c={theme.other.colors.secondary.darkGray}
											className={classes.unmatchedText}
											truncate
										>
											{matchText(itemLabel, form.values.search)}
										</Text>
									) : (
										<>
											<Text className={classes.locationResult} truncate>
												{itemLabel}
											</Text>
											<Text
												c={theme.other.colors.secondary.darkGray}
												className={classes.unmatchedText}
												truncate
											>
												{subheading}
											</Text>
										</>
									)}
								</Combobox.Option>
							)
						})}
						{results.length === 0 && noResults && (
							<Combobox.Empty>
								<Text variant={variants.Text.utility1}>{t('search.no-results')}</Text>
							</Combobox.Empty>
						)}
						{isOrgSearch && !orgSearchLoading && notBlank(search) && (
							<Combobox.Option value={SUGGEST_VALUE} className={classes.itemComponent}>
								<Text c={theme.other.colors.secondary.darkGray} className={classes.unmatchedText}>
									<Trans i18nKey='search.suggest-resource' />
								</Text>
							</Combobox.Option>
						)}
					</Combobox.Options>
				</ScrollArea.Autosize>
			</Combobox.Dropdown>
		</Combobox>
	)
}

type SearchBoxProps = {
	type: 'location' | 'organization'
	label?: string | ReactNode
	loadingManager: {
		setLoading: Dispatch<SetStateAction<boolean>>
		isLoading: boolean
	}
	initialValue?: string
	pinToLeft?: boolean
	placeholderTextKey?: string
	setSearchValue?: (newValue: string) => void
}
type FormValues = {
	search: string
	names?: ApiOutput['organization']['searchName']
	locations?: ApiOutput['geo']['autocomplete']['results']
}
interface AutocompleteItem {
	value: string
	name?: string
	slug?: string
	label: string
	subheading?: string
	placeId?: string
	fetching?: boolean
}
