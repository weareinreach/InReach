import { createStyles, Divider, Group, Skeleton, Space, Stack, Text, Title } from '@mantine/core'
import { useHover } from '@mantine/hooks'
import { TFunction as TFunctionType, useTranslation } from 'next-i18next'
import { useCallback, useMemo } from 'react'

import { type ApiOutput } from '@weareinreach/api'
import { useCustomVariant } from '~ui/hooks'

import { ActionButtons } from '../ActionButtons'
import { Badge } from '../Badge'
import { Link } from '../Link'

type Service = NonNullable<ApiOutput['savedList']['getById']>['services'][number]

export interface SavedResultLoading {
	loading: true
	result?: never
}

export interface SavedResultHasData {
	loading?: false
	result: Service
}

export type SavedResultCardProps = SavedResultHasData | SavedResultLoading

const useStyles = createStyles((theme) => ({
	cardBody: {
		'&:hover': {
			backgroundColor: theme.other.colors.primary.lightGray,
		},
	},
	hoverText: {
		'&[data-hovered]': {
			textDecoration: 'underline',
		},
	},
	description: {
		[theme.fn.smallerThan('xs')]: {
			display: 'none',
		},
	},
}))

export const SavedResultLoading = () => {
	const variants = useCustomVariant()
	return (
		<>
			<Stack spacing={16}>
				<Stack spacing={12}>
					<Group position='apart'>
						<Skeleton variant={variants.Skeleton.h2} w='80%' />
						<ActionButtons.Loading />
					</Group>
					<Skeleton variant={variants.Skeleton.utility} w='25%' />
					<Stack>
						<Skeleton variant={variants.Skeleton.text} w='100%' />
						<Skeleton variant={variants.Skeleton.text} w='100%' />
						<Skeleton variant={variants.Skeleton.text} w='100%' />
						<Skeleton variant={variants.Skeleton.text} w='60%' />
					</Stack>
				</Stack>
				<Group spacing={16}>
					<Skeleton h={32} w={75} />
					<Skeleton h={32} w={75} />
					<Skeleton h={32} w={75} />
				</Group>
			</Stack>
			<Divider my={40} />
		</>
	)
}

const SavedResultData = ({ result: savedItem }: SavedResultHasData) => {
	const { description, slug } = savedItem
	const { t, ready: i18nReady } = useTranslation(['common', savedItem.id])
	const variants = useCustomVariant()
	const { classes } = useStyles()
	const { hovered, ref: hoverRef } = useHover()

	// const serviceBadgeGroup = useMemo(
	// 	() =>
	// 		serviceCategories.length ? (
	// 			<Badge.Group>
	// 				{serviceCategories.map(({ id, tsKey }) => (
	// 					<Badge.Service key={id}>{t(tsKey, { ns: 'services' })}</Badge.Service>
	// 				))}
	// 			</Badge.Group>
	// 		) : null,
	// 	[serviceCategories, t]
	// )

	const cityList = useCallback(
		(cities: string[]) => {
			//check for duplicates and be case insensitive, before switching
			const dedupedCityList: string[] = []
			const lowercaseSet: { [key: string]: boolean } = {}

			cities.forEach((value) => {
				const lowercaseValue = value.toLowerCase()
				if (!lowercaseSet[lowercaseValue]) {
					lowercaseSet[lowercaseValue] = true
					dedupedCityList.push(value)
				}
			})

			const amount = dedupedCityList.length

			switch (true) {
				case amount === 0: {
					return null
				}
				case amount <= 2: {
					return dedupedCityList.join(` ${t('words.and')} `)
				}
				case amount === 3: {
					const commas = dedupedCityList.slice(0, 2)
					return [commas.join(', '), dedupedCityList[2]].join(` ${t('words.and')} `)
				}
				case amount > 3: {
					const visibleItems = dedupedCityList.slice(0, 3)
					const moreText = `${t('words.and-x-more', { count: dedupedCityList.length - visibleItems.length })}`
					return `${visibleItems.join(', ')} ${moreText}`
				}
				default: {
					return null
				}
			}
		},
		[t]
	)
	if (!i18nReady) {
		return <SavedResultLoading />
	}

	return (
		<>
			<Stack spacing={16} ref={hoverRef}>
				<Stack spacing={0}>
					<Group align='center' position='apart' noWrap>
						<Title
							order={2}
							className={classes.hoverText}
							{...(hovered && { 'data-hovered': hovered })}
							mb={12}
							{...(hovered && { 'data-hovered': hovered })}
						>
							<Link
								href={{ pathname: '/org/[slug]', query: { slug } }}
								variant={variants.Link.inheritStyle}
								td='none'
							>
								{savedItem.name
									? t(savedItem.name.key, { ns: savedItem.name.ns, defaultValue: savedItem.name.defaultText })
									: ''}
								<Space w={4} display='inline-block' />
							</Link>
						</Title>
						<ActionButtons.Save
							itemId={savedItem.id}
							itemName={
								savedItem.name
									? t(savedItem.name.key, { ns: savedItem.name.ns, defaultValue: savedItem.name.defaultText })
									: ''
							}
						/>
					</Group>
					<Link
						href={{ pathname: '/org/[slug]', query: { slug } }}
						variant={variants.Link.inheritStyle}
						td='none'
					>
						<Stack spacing={12}>
							{description && (
								<Text className={classes.description}>
									{t(description.key, { ns: description.ns, defaultValue: description.defaultText })}
								</Text>
							)}
						</Stack>
					</Link>
				</Stack>
				{/* {communityFocusBadgeGroup} */}
			</Stack>
			<Divider my={40} />
		</>
	)
}

export const SavedServiceResultCard = (props: SavedResultCardProps) =>
	props.loading ? <SavedResultLoading /> : <SavedResultData {...props} />

export type SearchResultCardProps = SearchResultHasData | SearchResultLoading

type SearchResultHasData = {
	result: NonNullable<ApiOutput['organization']['searchDistance']>['orgs'][number]
	loading?: boolean
}
type SearchResultLoading = {
	loading: true
	result?: never
}
