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
import { type DefaultTFuncReturn } from 'i18next'
import { useRouter } from 'next/router'
import { Trans, useTranslation } from 'next-i18next'
import { type Dispatch, forwardRef, type SetStateAction, useEffect, useState } from 'react'
import reactStringReplace from 'react-string-replace'

import { type ApiOutput } from '@weareinreach/api'
import { useCustomVariant } from '~ui/hooks'
import { Icon } from '~ui/icon'
import { trpc as api } from '~ui/lib/trpcClient'
import { useSearchState } from '~ui/providers/SearchState'

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
}))

/** Most of Google's autocomplete language options are only the two letter variants */
const simpleLocale = (locale: string) => (locale.length === 2 ? locale : locale.substring(0, 1))

export const SearchBox = ({ type, label, loadingManager, initialValue }: SearchBoxProps) => {
	const { classes, cx } = useStyles()
	const variants = useCustomVariant()
	const { t } = useTranslation()
	const router = useRouter()
	const form = useForm<FormValues>({ initialValues: { search: '' } })
	const [search] = useDebouncedValue(form.values.search, 400)
	const [locationSearch, setLocationSearch] = useState('')
	const { isLoading, setLoading } = loadingManager
	const isOrgSearch = type === 'organization'
	const { routeActions } = useSearchState()

	// tRPC functions
	const { data: orgSearchData, isFetching: orgSearchLoading } = api.organization.searchName.useQuery(
		{ search },
		{
			enabled: search !== '' && isOrgSearch,
			refetchOnWindowFocus: false,
		}
	)
	const { data: autocompleteData, isFetching: autocompleteLoading } = api.geo.autocomplete.useQuery(
		{ search, locale: simpleLocale(router.locale) },
		{
			enabled: search !== '' && !isOrgSearch,
			refetchOnWindowFocus: false,
		}
	)
	const [results, setResults] = useState<AutocompleteItem[]>([])
	const [noResults, setNoResults] = useState(false)
	const [searchLoading, setSearchLoading] = useState(false)

	useEffect(() => {
		if (
			(!orgSearchData && orgSearchLoading && search !== '') ||
			(!autocompleteData?.results?.length && autocompleteLoading && search !== '')
		) {
			setSearchLoading(true)
			setResults([{ value: search, label: search, fetching: true }])
		}
	}, [autocompleteData, autocompleteLoading, search, orgSearchData, orgSearchLoading])

	useEffect(() => {
		if (isOrgSearch) {
			if (orgSearchData && !orgSearchLoading && search !== '') {
				if (orgSearchData.length === 0) setNoResults(true)
				setResults(orgSearchData)
				setSearchLoading(false)
			}
		} else {
			if (autocompleteData && !autocompleteLoading && search !== '') {
				if (autocompleteData.status === 'ZERO_RESULTS') setNoResults(true)
				setResults(autocompleteData.results)
				setSearchLoading(false)
			}
		}
		if (search === '') {
			setResults([])
			setNoResults(false)
		}
	}, [autocompleteData, autocompleteLoading, search, isOrgSearch, orgSearchData, orgSearchLoading])

	useEffect(() => {
		if (initialValue && !form.values.search) {
			form.setFieldValue('search', initialValue)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	api.geo.geoByPlaceId.useQuery(locationSearch, {
		enabled: locationSearch !== '' && !isOrgSearch,
		onSuccess: (data) => {
			const DEFAULT_RADIUS = 50
			const DEFAULT_UNIT = 'mi'
			if (!data.result) return
			// apiUtils.
			router.push({
				pathname: '/search/[...params]',
				query: {
					params: [
						'dist',
						data.result.geometry.location.lng.toString(),
						data.result.geometry.location.lat.toString(),
						DEFAULT_RADIUS.toString(),
						DEFAULT_UNIT,
					],
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
		) : form.values.search.length > 0 ? (
			<Group spacing={4} noWrap className={classes.rightIcon} onClick={() => form.reset()}>
				<Text>{t('clear')}</Text>
				<Icon icon='carbon:close' />
			</Group>
		) : undefined

	const fieldRole = (
		isOrgSearch
			? {
					placeholder: `${t('search.organization-placeholder')}`,
					rightSection: rightIcon,
					icon: <Icon icon='carbon:search' className={classes.leftIcon} />,
					variant: 'default',
			  }
			: {
					placeholder: `${t('search.location-placeholder')}`,
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
			routeActions.setSearchTerm(item.value)
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
			routeActions.setSearchTerm(item.value)
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
				dropdown: classes.resultContainer,
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
			{...fieldRole}
			{...form.getInputProps('search')}
		/>
	)
}

type SearchBoxProps = {
	type: 'location' | 'organization'
	label?: string | DefaultTFuncReturn
	loadingManager: {
		setLoading: Dispatch<SetStateAction<boolean>>
		isLoading: boolean
	}
	initialValue?: string
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
