import { Title, Text, Group, Stack, Divider, useMantineTheme, createStyles } from '@mantine/core'
import { useHover } from '@mantine/hooks'
import { type ApiOutput } from '@weareinreach/api'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'

import { useCustomVariant } from '~ui/hooks'

import { ActionButtons } from './ActionButtons'
import { BadgeGroup, type CustomBadgeProps } from './Badge'
import { Link } from './Link'

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
}))

export const SearchResultCard = ({ result }: SearchResultCardProps) => {
	const { attributes, description, slug, name, services, locations } = result
	const { t } = useTranslation(['common', slug])
	const variants = useCustomVariant()
	const theme = useMantineTheme()
	const router = useRouter()
	const { classes } = useStyles()
	const { hovered, ref: hoverRef } = useHover()
	const leaderBadges: CustomBadgeProps[] = attributes.orgLeader.map(({ icon, iconBg, tsKey }) => ({
		variant: 'leader',
		icon: icon ?? '',
		iconBg: iconBg ?? '#FFFFFF',
		tsKey,
		minify: true,
		hideBg: true,
	}))
	const focusBadges: CustomBadgeProps[] = attributes.orgFocus.map(({ icon, tsKey }) => ({
		variant: 'community',
		icon: icon ?? '',
		tsKey,
	}))
	const serviceTags: CustomBadgeProps[] = services.map(({ tsKey }) => ({
		variant: 'service',
		tsKey,
	}))

	const cityList = (cities: string[]) => {
		const amount = cities.length
		switch (true) {
			case amount === 0: {
				return null
			}
			case amount <= 2: {
				return cities.join(` ${t('words.and')} `)
			}
			case amount === 3: {
				const commas = cities.slice(0, 2)
				return [commas.join(', '), cities[2]].join(` ${t('words.and')} `)
			}
			case amount > 3: {
				const visibleItems = cities.slice(0, 3)
				const moreText = `${t('words.and-x-more', { count: cities.length - visibleItems.length })}`
				return `${visibleItems.join(', ')} ${moreText}`
			}
		}
	}

	return (
		<>
			<Link href={{ pathname: '/org/[slug]', query: { slug } }} variant={variants.Link.card}>
				<Stack spacing={16} ref={hoverRef}>
					<Stack spacing={12}>
						<Group position='apart' mb={-12}>
							<Group>
								<Title order={2} className={classes.hoverText} data-hovered={hovered ? hovered : undefined}>
									{name}
								</Title>
								<BadgeGroup badges={leaderBadges} />
							</Group>
							<ActionButtons iconKey='save' />
						</Group>
						<Text variant={variants.Text.utility2darkGray}>{cityList(locations)}</Text>
						{description && <Text>{t(description.key, { ns: slug, defaultValue: description.text })}</Text>}
					</Stack>
					<BadgeGroup badges={focusBadges} />
					<BadgeGroup badges={serviceTags} />
				</Stack>
			</Link>
			<Divider my={40} />
		</>
	)
}

export type SearchResultCardProps = {
	result: NonNullable<ApiOutput['organization']['searchDistance']>['orgs'][number]
}
