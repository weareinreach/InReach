import {
	Autocomplete,
	Text,
	createStyles,
	Group,
	ScrollArea,
	ScrollAreaProps,
	AutocompleteProps,
	rem,
	Loader,
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { useDebouncedValue } from '@mantine/hooks'
import { type DefaultTFuncReturn } from 'i18next'
import { useRouter } from 'next/router'
import { useTranslation, Trans } from 'next-i18next'
import { forwardRef, useState, useEffect, Dispatch, SetStateAction } from 'react'
import reactStringReplace from 'react-string-replace'
import { type ApiOutput } from '@weareinreach/api'

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
		minWidth: rem(150),
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
}))

/** Most of Google's autocomplete language options are only the two letter variants */
const simpleLocale = (locale: string) => (locale.length === 2 ? locale : locale.substring(0, 1))

export const SearchBox = ({ type, label, loadingManager }: SearchBoxProps) => {
	const { classes, cx } = useStyles()
	const { t } = useTranslation()
	const router = useRouter()
	const form = useForm<FormValues>({ initialValues: { search: '' } })
	const [search] = useDebouncedValue(form.values.search, 400)
	const [locationSearch, setLocationSearch] = useState('')
	const { isLoading, setLoading } = loadingManager
	const isOrgSearch = type === 'organization'

	// tRPC functions
	api.organization.searchName.useQuery(
		{ search },
		{
			enabled: search !== '' && isOrgSearch,
			onSuccess: (data) => form.setValues({ names: data }),
			refetchOnWindowFocus: false,
		}
	)
	api.geo.autocomplete.useQuery(
		{ search, locale: simpleLocale(router.locale) },
		{
			enabled: search !== '' && !isOrgSearch,
			onSuccess: ({ results }) => form.setValues({ locations: results }),
			refetchOnWindowFocus: false,
		}
	)
	api.geo.geoByPlaceId.useQuery(locationSearch, {
		enabled: locationSearch !== '' && !isOrgSearch,
		onSuccess: (data) => {
			const DEFAULT_RADIUS = 50
			const DEFAULT_UNIT = 'mi'
			if (!data.result) return
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
		},
	})

	const results = (function () {
		const data = isOrgSearch ? form.values.names : form.values.locations
		return data ?? []
	})()

	const rightIcon = isLoading ? (
		<Loader size={24} />
	) : form.values.search.length > 0 ? (
		<Group spacing={4} className={classes.rightIcon} onClick={() => form.reset()}>
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
		({ value, ...others }: AutocompleteItem, ref) => {
			return isOrgSearch ? (
				<div ref={ref} {...others} className={classes.itemComponent}>
					<Text className={classes.unmatchedText} truncate>
						{matchText(value, form.values.search)}
					</Text>
				</div>
			) : (
				<div ref={ref} {...others} className={classes.itemComponent}>
					<Text className={classes.locationResult} truncate>
						{value}
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
					<Trans i18nKey='search.suggest-resource' t={t}>
						Can’t find it? <u>Suggest an organization</u> you think should be included.
					</Trans>
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
					<SuggestItem />
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
			}}
			itemComponent={AutoCompleteItem}
			dropdownComponent={isOrgSearch ? ResultContainer : undefined}
			data={results}
			dropdownPosition='bottom'
			radius='xl'
			onItemSubmit={selectionHandler}
			disabled={isLoading}
			label={label}
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
	subheading?: string
	placeId?: string
}
