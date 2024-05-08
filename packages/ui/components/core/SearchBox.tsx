import {
	Autocomplete,
	type AutocompleteProps,
	Box,
	Center,
	createStyles,
	Group,
	Loader,
	rem,
	ScrollArea,
	type ScrollAreaProps,
	Text,
} from '@mantine/core'
import { useForm, type UseFormReturnType } from '@mantine/form'
import { useDebouncedValue } from '@mantine/hooks'
import regexEscape from 'escape-string-regexp'
import { localeIncludes } from 'locale-includes'
import { useRouter } from 'next/router'
import { Trans, useTranslation } from 'next-i18next'
import {
	createContext,
	type Dispatch,
	forwardRef,
	type KeyboardEventHandler,
	type ReactNode,
	type SetStateAction,
	useCallback,
	useContext,
	useDebugValue,
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
import { trpc as api } from '~ui/lib/trpcClient'

const DEFAULT_RADIUS = 200
const DEFAULT_UNIT = 'mi'

const SearchBoxContext = createContext<SearchBoxContextValues | null>(null)

const useSearchBoxContext = () => {
	const context = useContext(SearchBoxContext)
	if (!context) {
		throw new Error('useSearchBoxContext must be used within a SearchBoxProvider')
	}
	return context
}
interface SearchBoxContextValues {
	isOrgSearch: boolean
	orgSearchLoading: boolean
	form: UseFormReturnType<FormValues>
}

const useStyles = createStyles((theme) => ({
	autocompleteContainer: {
		width: '100%',
		paddingLeft: theme.spacing.md,
		paddingRight: theme.spacing.md,
		'&:focus': {
			borderColor: theme.other.colors.secondary.black,
			backgroundColor: theme.other.colors.secondary.white,
		},
		maxWidth: rem(636),
	},
	autocompleteWrapper: {
		padding: 0,
		borderBottom: `${rem(1)} solid ${theme.other.colors.tertiary.coolGray}`,
	},
	emptyLocation: {
		backgroundColor: theme.other.colors.primary.lightGray,
	},
	rightIcon: {
		minWidth: rem(102),
		'&:hover': {
			cursor: 'pointer',
		},
		marginRight: rem(18),
	},
	leftIcon: {
		color: theme.other.colors.secondary.black,
	},
	itemComponent: {
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
	unmatchedText: {
		...theme.other.utilityFonts.utility2,
		color: theme.other.colors.secondary.darkGray,
	},
	matchedText: {
		color: theme.other.colors.secondary.black,
	},
	locationResult: {
		...theme.other.utilityFonts.utility2,
		display: 'block',
	},
	resultContainer: {
		minWidth: 'fit-content',
	},
	pinToLeft: {
		left: '0 !important',
	},
}))

/** Most of Google's autocomplete language options are only the two letter variants */
const simpleLocale = (locale: string) => (locale.length === 2 ? locale : locale.substring(0, 1))

const notBlank = (value?: string) => !!value && value.length > 0

const useResults = () => {
	const [results, setResults] = useState<AutocompleteItem[]>([])
	useDebugValue(results)
	return [results, setResults] as [typeof results, typeof setResults]
}
const useNoResults = () => {
	const [noResults, setNoResults] = useState(false)
	useDebugValue(noResults)
	return [noResults, setNoResults] as [typeof noResults, typeof setNoResults]
}
const useSearchLoading = () => {
	const [searchLoading, setSearchLoading] = useState(false)
	useDebugValue(searchLoading)
	return [searchLoading, setSearchLoading] as [typeof searchLoading, typeof setSearchLoading]
}
const useLocationSearch = () => {
	const [locationSearch, setLocationSearch] = useState('')
	useDebugValue(locationSearch)
	return [locationSearch, setLocationSearch] as [typeof locationSearch, typeof setLocationSearch]
}

const SuggestItem = () => {
	const { classes } = useStyles()
	const router = useRouter()
	const suggestClickHandler = useCallback(() => {
		router.push('/suggest')
	}, [router])

	return (
		<Box className={classes.itemComponent} onClick={suggestClickHandler}>
			<Text className={classes.unmatchedText}>
				<Trans i18nKey='search.suggest-resource' />
			</Text>
		</Box>
	)
}

const AutoCompleteItem = forwardRef<HTMLDivElement, AutocompleteItem>(
	({ label, fetching, placeId: _placeId, ...others }: AutocompleteItem, ref) => {
		const { classes } = useStyles()
		const { isOrgSearch, form } = useSearchBoxContext()
		const matchText = useCallback(
			(result: string, textToMatch: string) => {
				const matcher = new RegExp(`(${regexEscape(textToMatch)})`, 'ig')
				const replaced = reactStringReplace(result, matcher, (match, i) => (
					<span key={i} className={classes.matchedText}>
						{match}
					</span>
				))
				return replaced
			},
			[classes]
		)

		if (fetching) {
			return (
				<div ref={ref} {...others} className={classes.itemComponent}>
					<Center>
						<Loader />
					</Center>
				</div>
			)
		}
		return isOrgSearch ? (
			<div ref={ref} {...others} className={classes.itemComponent}>
				<Text className={classes.unmatchedText} truncate>
					{matchText(label, form.values.search)}
				</Text>
			</div>
		) : (
			<div ref={ref} {...others} className={classes.itemComponent}>
				<Text className={classes.locationResult} truncate>
					{label}
				</Text>
				<Text className={classes.unmatchedText} truncate>
					{others.subheading}
				</Text>
			</div>
		)
	}
)
AutoCompleteItem.displayName = 'AutoCompleteItem'

// only used for Organization results - always displays suggestion item last.
const ResultContainer = forwardRef<HTMLDivElement, ScrollAreaProps>(({ children, style, ...props }, ref) => {
	const { orgSearchLoading } = useSearchBoxContext()
	return (
		<ScrollArea viewportRef={ref} style={{ width: '100%', ...style }} {...props}>
			{children}
			{!orgSearchLoading && <SuggestItem />}
		</ScrollArea>
	)
})
ResultContainer.displayName = 'ResultContainer'

export const SearchBox = ({
	type,
	label,
	loadingManager,
	initialValue = '',
	pinToLeft,
	placeholderTextKey,
	setSearchValue: setSearchValue,
}: SearchBoxProps) => {
	const { classes, cx } = useStyles()
	const variants = useCustomVariant()
	const { t } = useTranslation()
	const router = useRouter()
	const [locationSearch, setLocationSearch] = useLocationSearch()
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
	const [results, setResults] = useResults()
	const [noResults, setNoResults] = useNoResults()
	const [searchLoading, setSearchLoading] = useSearchLoading()

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
				}
				setResults(orgSearchData)
				setSearchLoading(false)
			}
		} else if (autocompleteData && !autocompleteLoading && notBlank(search)) {
			if (autocompleteData.status === 'ZERO_RESULTS') {
				setNoResults(true)
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
				<Group>
					<Loader size={32} mr={40} />
				</Group>
			)
		}
		if (form.values.search?.length > 0) {
			return (
				<Group spacing={4} noWrap className={classes.rightIcon} onClick={resetHandler}>
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
					icon: <Icon icon='carbon:search' className={classes.leftIcon} />,
					variant: 'default',
				}
			: {
					placeholder: `${t(placeholderTextKey ?? 'search.location-placeholder')}`,
					rightSection: rightIcon,
					icon: <Icon icon='carbon:location-filled' className={classes.leftIcon} />,
					variant: 'filled',
				}
	) satisfies Partial<AutocompleteProps>

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
				searchStateActions.setSearchTerm(item.value)
				setLocationSearch(item.placeId)
			}
		},
		[isOrgSearch, router, search, searchStateActions, setLoading, setLocationSearch]
	)

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
	const searchBoxContentValues = useMemo(
		() => ({ isOrgSearch, form, orgSearchLoading }),
		[isOrgSearch, form, orgSearchLoading]
	)

	const filterFn = useCallback(
		(value: string, item: AutocompleteItem) =>
			localeIncludes(item.value, value, {
				usage: 'search',
				sensitivity: 'base',
			}),
		[]
	)

	return (
		<SearchBoxContext.Provider value={searchBoxContentValues}>
			<Autocomplete
				classNames={{
					input: isOrgSearch
						? classes.autocompleteContainer
						: cx(classes.autocompleteContainer, classes.emptyLocation),
					itemsWrapper: classes.autocompleteWrapper,
					dropdown: pinToLeft ? cx(classes.resultContainer, classes.pinToLeft) : classes.resultContainer,
				}}
				itemComponent={AutoCompleteItem}
				dropdownComponent={isOrgSearch ? ResultContainer : undefined}
				data={results}
				dropdownPosition='bottom'
				radius='xl'
				onItemSubmit={selectionHandler}
				onKeyDown={handleKeyDown}
				disabled={isLoading}
				label={label}
				withinPortal
				nothingFound={
					noResults ? <Text variant={variants.Text.utility1}>{t('search.no-results')}</Text> : null
				}
				defaultValue={initialValue}
				filter={filterFn}
				{...fieldRole}
				{...form.getInputProps('search')}
			/>
		</SearchBoxContext.Provider>
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
