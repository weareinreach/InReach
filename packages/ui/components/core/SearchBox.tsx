import {
	Autocomplete,
	type AutocompleteProps,
	Center,
	createStyles,
	Group,
	Loader,
	rem,
	ScrollArea,
	type ScrollAreaProps,
	Text,
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { useDebouncedValue } from '@mantine/hooks'
import { useRouter } from 'next/router'
import { Trans, useTranslation } from 'next-i18next'
import {
	type Dispatch,
	forwardRef,
	type ReactNode,
	type SetStateAction,
	useDebugValue,
	useEffect,
	useState,
} from 'react'
import reactStringReplace from 'react-string-replace'

import { type ApiOutput } from '@weareinreach/api'
import { SearchParamsSchema } from '@weareinreach/api/schemas/routes/search'
import { useCustomVariant } from '~ui/hooks/useCustomVariant'
import { useSearchState } from '~ui/hooks/useSearchState'
import { Icon } from '~ui/icon'
import { trpc as api } from '~ui/lib/trpcClient'

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
		left: `0 !important`,
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

export const SearchBox = ({
	type,
	label,
	loadingManager,
	initialValue = '',
	pinToLeft,
	placeholderTextKey,
}: SearchBoxProps) => {
	const { classes, cx } = useStyles()
	const variants = useCustomVariant()
	const { t } = useTranslation()
	const router = useRouter()
	const form = useForm<FormValues>(initialValue ? { initialValues: { search: initialValue } } : undefined)
	const [search] = useDebouncedValue(form.values.search, 400)
	const [locationSearch, setLocationSearch] = useLocationSearch()
	const { isLoading, setLoading } = loadingManager
	const isOrgSearch = type === 'organization'
	const { searchStateActions } = useSearchState()

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

	useEffect(() => {
		if (
			(!orgSearchData && orgSearchLoading && notBlank(search)) ||
			(!autocompleteData?.results?.length && autocompleteLoading && notBlank(search))
		) {
			setSearchLoading(true)
			setResults([{ value: search, label: search, fetching: true }])
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [autocompleteData, autocompleteLoading, search, orgSearchData, orgSearchLoading])

	useEffect(() => {
		if (isOrgSearch) {
			if (orgSearchData && !orgSearchLoading && notBlank(search)) {
				if (orgSearchData.length === 0) setNoResults(true)
				setResults(orgSearchData)
				setSearchLoading(false)
			}
		} else {
			if (autocompleteData && !autocompleteLoading && notBlank(search)) {
				if (autocompleteData.status === 'ZERO_RESULTS') setNoResults(true)
				setResults(autocompleteData.results)
				setSearchLoading(false)
			}
		}
		if (search === '') {
			setResults([])
			setNoResults(false)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [autocompleteData, autocompleteLoading, search, isOrgSearch, orgSearchData, orgSearchLoading])

	api.geo.geoByPlaceId.useQuery(locationSearch, {
		enabled: notBlank(locationSearch) && !isOrgSearch,
		onSuccess: (data) => {
			const DEFAULT_RADIUS = 200
			const DEFAULT_UNIT = 'mi'
			if (!data.result) return
			const params = SearchParamsSchema.safeParse([
				data.result.country,
				data.result.geometry.location.lng,
				data.result.geometry.location.lat,
				DEFAULT_RADIUS,
				DEFAULT_UNIT,
			])
			if (!params.success) return
			router.push({
				pathname: '/search/[...params]',
				query: {
					params: params.data,
				},
			})
			setLoading(false)
		},
	})

	const rightIcon =
		isLoading || searchLoading ? (
			<Group>
				<Loader size={32} mr={16} />
			</Group>
		) : form.values.search?.length > 0 ? (
			<Group spacing={4} noWrap className={classes.rightIcon} onClick={() => form.reset()}>
				<Text>{t('clear')}</Text>
				<Icon icon='carbon:close' />
			</Group>
		) : undefined

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

	const matchText = (result: string, textToMatch: string) => {
		const matcher = new RegExp(`(${textToMatch})`, 'ig')
		const replaced = reactStringReplace(result, matcher, (match, i) => (
			<span key={i} className={classes.matchedText}>
				{match}
			</span>
		))
		return replaced
	}

	const AutoCompleteItem = forwardRef<HTMLDivElement, AutocompleteItem>(
		({ label, fetching, placeId, ...others }: AutocompleteItem, ref) => {
			if (fetching)
				return (
					<div ref={ref} {...others} className={classes.itemComponent}>
						<Center>
							<Loader />
						</Center>
					</div>
				)
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

	const SuggestItem = () => {
		return (
			<div className={classes.itemComponent} onClick={() => router.push('/suggest')}>
				<Text className={classes.unmatchedText}>
					<Trans i18nKey='search.suggest-resource' t={t} />
				</Text>
			</div>
		)
	}

	// only used for Organization results - always displays suggestion item last.
	const ResultContainer = forwardRef<HTMLDivElement, ScrollAreaProps>(
		({ children, style, ...props }, ref) => {
			return (
				<ScrollArea viewportRef={ref} style={{ width: '100%', ...style }} {...props}>
					{children}
					{!orgSearchLoading && <SuggestItem />}
				</ScrollArea>
			)
		}
	)
	ResultContainer.displayName = 'ResultContainer'

	// org search: route to org page.
	// location search: pass placeId to tRPC (geo.geoByPlaceId), which will redirect to search after coordinates are fetched
	const selectionHandler = (item: AutocompleteItem) => {
		setLoading(true)
		if (isOrgSearch) {
			if (!item.slug) {
				setLoading(false)
				return
			}
			searchStateActions.setSearchTerm(item.value)
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
			searchStateActions.setSearchTerm(item.value)
			setLocationSearch(item.placeId)
		}
	}

	return (
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
			disabled={isLoading}
			label={label}
			withinPortal
			nothingFound={noResults ? <Text variant={variants.Text.utility1}>{t('search.no-results')}</Text> : null}
			defaultValue={initialValue}
			{...fieldRole}
			{...form.getInputProps('search')}
		/>
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
