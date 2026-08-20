import { Divider, Group, Skeleton, Space, Stack, Text, Title } from '@mantine/core'
import { useHover } from '@mantine/hooks'
import { useTranslation } from 'next-i18next/pages'
import { useCallback, useMemo } from 'react'

import { productEvent } from '@weareinreach/analytics/events'
import { type ApiOutput } from '@weareinreach/api'
import { useCustomVariant, useSearchState } from '~ui/hooks'

import { ActionButtons } from './ActionButtons'
import { Badge } from './Badge'
import { Link } from './Link'
import classes from './SearchResultCard.module.css'

export const SearchResultLoading = () => {
	const variants = useCustomVariant()
	return (
		<>
			<Stack gap={16}>
				<Stack gap={12}>
					<Group justify='space-between'>
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
				<Group gap={16}>
					<Skeleton h={32} w={75} />
					<Skeleton h={32} w={75} />
					<Skeleton h={32} w={75} />
				</Group>
			</Stack>
			<Divider my={40} />
		</>
	)
}

interface SearchResultV2Metadata {
	relevanceScore?: number
	tier?: string
	isLocal?: boolean
}

const TIER_KEY_MAP: Record<string, string> = {
	NEIGHBORHOOD: 'neighborhood',
	LOCAL: 'local',
	REGION: 'region',
	EXTENDED_REGION: 'region-extended',
	NATIONAL: 'remote-national',
}

const SearchResultData = ({ result, index, isAdvanced }: SearchResultHasData) => {
	const { description, slug, name, locations, orgLeader, orgFocus, serviceCategories, national } = result
	const visibility = result.addressVisibility as 'FULL' | 'PARTIAL' | 'HIDDEN' | undefined
	const { t, ready: i18nReady } = useTranslation(['common', result.id])
	const variants = useCustomVariant()
	const { hovered, ref: hoverRef } = useHover()
	const { searchState } = useSearchState()

	const handleTrackClick = useCallback(() => {
		productEvent.profileView(result.id, name, {
			searchTermContext: JSON.stringify(searchState.params),
			position: index,
			searchVersion: isAdvanced ? 'v2' : 'v1',
			distanceMeters: result.distance
				? Math.round(result.unit === 'mi' ? result.distance * 1609.34 : result.distance * 1000)
				: undefined,
			relevanceScore: (result as SearchResultV2Metadata).relevanceScore,
			proximityTier: (result as SearchResultV2Metadata).tier,
		})
	}, [result.id, name, searchState.params, index, result, isAdvanced])

	const leaderBadgeGroup = useMemo(
		() =>
			orgLeader.length || national.length ? (
				<Badge.Group>
					{orgLeader.map(({ icon, iconBg, id, tsKey }) => (
						<Badge.Leader key={id} minify hideBg {...{ icon: icon ?? '', iconBg: iconBg ?? '#FFFFFF' }}>
							{t(tsKey, { ns: 'attribute' })}
						</Badge.Leader>
					))}
					{national.length ? <Badge.National countries={national} /> : null}
				</Badge.Group>
			) : null,
		[national, orgLeader, t]
	)

	const communityFocusBadgeGroup = useMemo(
		() =>
			orgFocus.length ? (
				<Badge.Group>
					{orgFocus.map(({ icon, id, tsKey }) => (
						<Badge.Community key={id} icon={icon ?? ''}>
							{t(tsKey, { ns: 'attribute' })}
						</Badge.Community>
					))}
				</Badge.Group>
			) : null,
		[orgFocus, t]
	)
	const serviceBadgeGroup = useMemo(
		() =>
			serviceCategories.length ? (
				<Badge.Group>
					{serviceCategories.map(({ id, tsKey }) => (
						<Badge.Service key={id}>{t(tsKey, { ns: 'services' })}</Badge.Service>
					))}
				</Badge.Group>
			) : null,
		[serviceCategories, t]
	)

	const cityList = useCallback(
		(cities: string[]) => {
			if (national.length > 0) return null
			if (visibility === 'HIDDEN') return null

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
		[t, visibility, national]
	)
	if (!i18nReady) {
		return <SearchResultLoading />
	}

	return (
		<>
			<Stack gap={16} ref={hoverRef}>
				<Stack gap={0}>
					<Group align='center' justify='space-between' wrap='nowrap'>
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
								onClick={handleTrackClick}
							>
								{name}
								<Space w={4} display='inline-block' />
							</Link>
							{leaderBadgeGroup}
						</Title>
						<ActionButtons.Save itemId={result.id} itemName={result.name} />
					</Group>
					<Link
						href={{ pathname: '/org/[slug]', query: { slug } }}
						variant={variants.Link.inheritStyle}
						td='none'
						onClick={handleTrackClick}
					>
						<Stack gap={12}>
							<Text variant={variants.Text.utility2darkGray}>{cityList(locations)}</Text>
							{description && (
								<Text className={classes.description}>
									{t(description.key, { ns: result.id, defaultValue: description.text })}
								</Text>
							)}
						</Stack>
					</Link>
				</Stack>
				{communityFocusBadgeGroup}
				{serviceBadgeGroup}
			</Stack>
			<Divider my={40} />
		</>
	)
}

export const SearchResultCard = (props: SearchResultCardProps) =>
	props.loading ? <SearchResultLoading /> : <SearchResultData {...props} />

export type SearchResultCardProps = SearchResultHasData | SearchResultLoading

type SearchResultHasData = {
	result: NonNullable<ApiOutput['organization']['searchDistance']>['orgs'][number]
	loading?: boolean
	index: number
	isAdvanced?: boolean
}
type SearchResultLoading = {
	loading: true
	result?: never
	isAdvanced?: boolean
}
