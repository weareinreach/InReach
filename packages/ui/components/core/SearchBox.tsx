import {
	Autocomplete,
	Text,
	createStyles,
	Group,
	InputVariant,
	SelectItemProps,
	ScrollArea,
	ScrollAreaProps,
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { useDebouncedValue } from '@mantine/hooks'
import { type ApiOutput } from '@weareinreach/api'
import { useRouter } from 'next/router'
import { useTranslation, Trans } from 'next-i18next'
import { forwardRef, useEffect, useState } from 'react'
import reactStringReplace from 'react-string-replace'

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
		minWidth: '600px',
	},
	autocompleteWrapper: {
		padding: 0,
		borderBottom: `1px solid ${theme.other.colors.tertiary.coolGray}`,
	},

	rightIcon: {
		minWidth: '150px',
	},
	leftIcon: {
		color: theme.other.colors.secondary.black,
	},
	itemComponent: {
		borderBottom: `1px solid ${theme.other.colors.tertiary.coolGray}`,
		padding: `${theme.spacing.sm}px ${theme.spacing.xl}px`,
		alignItems: 'center',
		'&:hover': {
			backgroundColor: theme.other.colors.tertiary.coolGray,
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
}))

type FormValues = {
	search: string
	results: (NonNullable<ApiOutput['organization']['searchName']>[number] & { value: string })[]
}

export const SearchBox = ({ type }: Props) => {
	const { classes } = useStyles()
	const { t } = useTranslation()
	const router = useRouter()
	const form = useForm<FormValues>({ initialValues: { search: '', results: [] } })
	const [search] = useDebouncedValue(form.values.search, 400)

	const { data, status, isFetching, isSuccess } = api.organization.searchName.useQuery(
		{ search },
		{
			enabled: search !== '',
			select: (data) => (data ? data.map(({ name, ...rest }) => ({ value: name, name, ...rest })) : []),
			onSuccess: (data) => form.setValues({ results: data }),
			refetchOnWindowFocus: false,
		}
	)

	const rightIcon = (
		<Group spacing={4} className={classes.rightIcon} onClick={() => form.reset()}>
			<Text>Clear</Text>
			<Icon icon='carbon:close' />
		</Group>
	)

	function selectType(type: string) {
		switch (type) {
			case 'location':
				return {
					placeholder: t('search-box-location-placeholder'),
					rightIcon: rightIcon,
					leftIcon: <Icon icon='carbon:location-filled' className={classes.leftIcon} />,
					variant: 'filled' as InputVariant,
				}
			case 'organization':
				return {
					placeholder: t('search-box-organization-placeholder'),
					rightIcon: rightIcon,
					leftIcon: <Icon icon='carbon:search' className={classes.leftIcon} />,
					variant: 'default' as InputVariant,
				}
		}
	}

	const selectedType = selectType(type)

	interface ItemProps extends SelectItemProps {
		value: string
		name: string
	}

	const matchText = (result: string, textToMatch: string) => {
		const matcher = new RegExp(`(${textToMatch})`, 'ig')
		const replaced = reactStringReplace(result, matcher, (match, i) => (
			<span key={i} className={classes.matchedText}>
				{match}
			</span>
		))
		console.log(replaced)
		return replaced
	}

	const AutoCompleteItem = forwardRef<HTMLDivElement, ItemProps>(({ name, ...others }: ItemProps, ref) => {
		return (
			<div ref={ref} {...others} className={classes.itemComponent}>
				<Text className={classes.unmatchedText} truncate>
					{matchText(name, form.values.search)}
				</Text>
			</div>
		)
	})
	AutoCompleteItem.displayName = 'AutoCompleteItem'
	const SuggestItem = () => {
		return (
			<div className={classes.itemComponent} onClick={() => router.push('/suggest')}>
				<Text className={classes.unmatchedText}>
					<Trans i18nKey='search-box-suggest-resource' t={t}>
						Can’t find it? <u>Suggest an organization</u> you think should be included.
					</Trans>
				</Text>
			</div>
		)
	}
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
	return (
		<Autocomplete
			classNames={{ input: classes.autocompleteContainer, itemsWrapper: classes.autocompleteWrapper }}
			itemComponent={AutoCompleteItem}
			dropdownComponent={ResultContainer}
			variant={selectedType?.variant}
			placeholder={selectedType?.placeholder}
			data={form.values.results}
			icon={selectedType?.leftIcon}
			dropdownPosition='bottom'
			radius='xl'
			onItemSubmit={(e) =>
				router.push({
					pathname: '/org/[slug]',
					query: {
						slug: e.slug,
					},
				})
			}
			rightSection={form.values.search.length > 0 ? selectedType?.rightIcon : null}
			{...form.getInputProps('search')}
		/>
	)
}

type Props = {
	type: 'location' | 'organization'
}
