import { createStyles, Divider, Group, Skeleton, Space, Stack, Text, Title } from '@mantine/core'
import { useHover } from '@mantine/hooks'
import { TFunction as TFunctionType, useTranslation } from 'next-i18next'
import { useCallback, useMemo } from 'react'

import { type ApiOutput } from '@weareinreach/api'
import { useCustomVariant } from '~ui/hooks'

import { ActionButtons } from './ActionButtons'
import { Badge } from './Badge'
import { Link } from './Link'

export interface TsKey {
	key: string
	ns: string
	defaultText: string
}

abstract class SavedItem {
	id: string
	slug: string
	description: TsKey

	constructor(id: string, slug: string, description: TsKey) {
		this.id = id
		this.slug = slug
		this.description = description
	}

	abstract getDisplayName(t: (key: string, options?: { ns: string; defaultValue: string }) => string): string
}

export class Organization extends SavedItem {
	name: string

	constructor(id: string, slug: string, name: string, description: TsKey) {
		super(id, slug, description)
		this.name = name
	}

	getDisplayName(t: (key: string, options?: { ns: string; defaultValue: string }) => string): string {
		return this.name
	}
}

export class Service extends SavedItem {
	name: TsKey

	constructor(id: string, slug: string, name: TsKey, description: TsKey) {
		super(id, slug, description)
		this.name = name
	}

	getDisplayName(t: (key: string, options?: { ns: string; defaultValue: string }) => string): string {
		return t(this.name.key, { ns: this.name.ns, defaultValue: this.name.defaultText })
	}
}

export interface SavedResult {
	id: string
	name: string
	_count: {
		organizations: number
		services: number
	}
	organizations: { organization: Organization }[]
	services: { service: Service }[]
}

export interface SavedResultLoading {
	loading: true
	result?: never
}

export interface SavedResultHasData {
	loading?: false
	result: SavedItem
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

	// const leaderBadgeGroup = useMemo(
	// 	() =>
	// 		orgLeader?.length || nationa?l.length ? (
	// 			<Badge.Group>
	// 				{/* {orgLeader.map(({ icon, iconBg, id, tsKey }) => (
	// 					<Badge.Leader key={id} minify hideBg {...{ icon: icon ?? '', iconBg: iconBg ?? '#FFFFFF' }}>
	// 						{t(tsKey, { ns: 'attribute' })}
	// 					</Badge.Leader>
	// 				))} */}
	// 				{national?.length ? <Badge.National countries={national} /> : null}
	// 			</Badge.Group>
	// 		) : null,
	// 	[national, orgLeader, t]
	// )

	// const communityFocusBadgeGroup = useMemo(
	// 	() =>
	// 		orgFocus.length ? (
	// 			<Badge.Group>
	// 				{orgFocus.map(({ icon, id, tsKey }) => (
	// 					<Badge.Community key={id} icon={icon ?? ''}>
	// 						{t(tsKey, { ns: 'attribute' })}
	// 					</Badge.Community>
	// 				))}
	// 			</Badge.Group>
	// 		) : null,
	// 	[orgFocus, t]
	// )
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
								{savedItem.getDisplayName(t)}
								<Space w={4} display='inline-block' />
							</Link>
							{/* {leaderBadgeGroup} */}
						</Title>
						<ActionButtons.Save itemId={savedItem.id} itemName={savedItem.getDisplayName(t)} />
					</Group>
					<Link
						href={{ pathname: '/org/[slug]', query: { slug } }}
						variant={variants.Link.inheritStyle}
						td='none'
					>
						<Stack spacing={12}>
							{/* <Text variant={variants.Text.utility2darkGray}>{cityList(locations)}</Text> */}
							{description && (
								<Text className={classes.description}>
									{t(description.key, { ns: description.ns, defaultValue: description.defaultText })}
								</Text>
							)}
						</Stack>
					</Link>
				</Stack>
				{/* {communityFocusBadgeGroup}
				{serviceBadgeGroup} */}
			</Stack>
			<Divider my={40} />
		</>
	)
}

export const SavedResultCard = (props: SavedResultCardProps) =>
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
