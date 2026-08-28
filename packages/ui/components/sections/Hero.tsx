import { Box, Group, Stack, Tabs, Text, Title, Transition, useMantineTheme } from '@mantine/core'
import { useReducedMotion } from '@mantine/hooks'
import { useRouter } from 'next/router'
import { Trans, useTranslation } from 'next-i18next/pages'
import { useEffect, useState } from 'react'

import { Link } from '~ui/components/core/Link'
import { SearchBox } from '~ui/components/core/SearchBox'
import { useCustomVariant } from '~ui/hooks'
import { cx } from '~ui/lib/cx'
import { PrivacyStatementModal } from '~ui/modals/PrivacyStatement'

import classes from './Hero.module.css'

type RevolvingBoxProps = {
	role: 'services' | 'community'
}
type RandomArr = <T extends Array<unknown>>(arr: T) => T[number]

// Purely decorative (picking which hero copy/pattern to show) - uses the Web Crypto API rather
// than `Math.random()` regardless, since that's a cheap, universally-available upgrade. Uses
// rejection sampling rather than `randomUint32 / 2**32` - dividing to get a float introduces bias
// (some outputs become more likely than others), which the plain division approach does not avoid.
const secureRandomInt = (maxExclusive: number): number => {
	const arr = new Uint32Array(1)
	const limit = 0x100000000 - (0x100000000 % maxExclusive)
	let value: number
	do {
		crypto.getRandomValues(arr)
		value = arr[0] as number
	} while (value >= limit)
	return value % maxExclusive
}

const randomArrMember: RandomArr = (arr) => arr[secureRandomInt(arr.length)]
const getRandomNumber = (min: number, max: number) => {
	// Get the random number between min and max.
	return min + secureRandomInt(max - min + 1)
}

const RevolvingBox = ({ role }: RevolvingBoxProps) => {
	const router = useRouter()
	const { t } = useTranslation('landingPage', { lng: router.locale })
	const theme = useMantineTheme()
	const reduceMotion = useReducedMotion()
	const services = [
		{
			bg: theme.other.colors.tertiary.pink,
			fg: theme.other.colors.secondary.black,
			text: t('hero.services.0'),
		},
		{
			bg: theme.other.colors.tertiary.lightBlue,
			fg: theme.other.colors.secondary.black,
			text: t('hero.services.1'),
		},
		{
			bg: theme.other.colors.tertiary.purple,
			fg: theme.other.colors.secondary.white,
			text: t('hero.services.2'),
		},
		{
			bg: theme.other.colors.tertiary.darkBlue,
			fg: theme.other.colors.secondary.white,
			text: t('hero.services.3'),
		},
		{
			bg: theme.other.colors.tertiary.green,
			fg: theme.other.colors.secondary.black,
			text: t('hero.services.4'),
		},
		{
			bg: theme.other.colors.tertiary.yellow,
			fg: theme.other.colors.secondary.black,
			text: t('hero.services.5'),
		},
		{
			bg: theme.other.colors.tertiary.orange,
			fg: theme.other.colors.secondary.black,
			text: t('hero.services.6'),
		},
		{
			bg: theme.other.colors.tertiary.red,
			fg: theme.other.colors.secondary.white,
			text: t('hero.services.7'),
		},
		{
			bg: theme.other.colors.tertiary.brown,
			fg: theme.other.colors.secondary.white,
			text: t('hero.services.8'),
		},
		{
			bg: theme.other.colors.tertiary.darkBrown,
			fg: theme.other.colors.secondary.white,
			text: t('hero.services.9'),
		},
	]
	const communities = [
		{
			bg: theme.other.colors.tertiary.yellow,
			fg: theme.other.colors.secondary.black,
			text: t('hero.community.0'),
		},
		{
			bg: theme.other.colors.tertiary.orange,
			fg: theme.other.colors.secondary.black,
			text: t('hero.community.1'),
		},
		{
			bg: theme.other.colors.tertiary.green,
			fg: theme.other.colors.secondary.black,
			text: t('hero.community.2'),
		},
		{
			bg: theme.other.colors.tertiary.pink,
			fg: theme.other.colors.secondary.black,
			text: t('hero.community.3'),
		},
		{
			bg: theme.other.colors.tertiary.darkBlue,
			fg: theme.other.colors.secondary.white,
			text: t('hero.community.4'),
		},
		{
			bg: theme.other.colors.tertiary.purple,
			fg: theme.other.colors.secondary.white,
			text: t('hero.community.5'),
		},
		{
			bg: theme.other.colors.tertiary.lightBlue,
			fg: theme.other.colors.secondary.black,
			text: t('hero.community.6'),
		},
	]
	const itemSet = role === 'community' ? communities : services

	const initialItem = itemSet.at(role === 'community' ? 0 : -1)

	const [item, setItem] = useState(initialItem)

	const [previousItem, setPreviousItem] = useState(initialItem)
	const style = cx(classes.wrapper, role === 'community' ? classes.community : classes.service)

	const [transition, setTransition] = useState(true)

	const inTime = 750
	const outTime = 500
	const changeTime = getRandomNumber(5000, 6000)
	useEffect(() => {
		setInterval(() => {
			setTransition(false)
			setTimeout(() => {
				setItem(randomArrMember(itemSet))
				setTransition(true)
			}, inTime)
		}, changeTime)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])
	if (!item) return null
	return (
		<Box className={style} style={{ backgroundColor: previousItem?.bg }} suppressHydrationWarning>
			<Transition
				mounted={transition}
				transition='fade'
				duration={reduceMotion ? 0 : inTime}
				exitDuration={reduceMotion ? 0 : outTime}
				timingFunction='ease-in'
				keepMounted={true}
				// `keepMountedMode='display-none'` is required here: the default `'activity'` mode
				// wraps the exited subtree (including the nested Transition below) in React's
				// `Activity` component, which suspends that subtree's effects while hidden. Since the
				// nested Transition's own enter/exit state machine lives in a `useEffect`, it can miss
				// the `mounted` flip while its ancestor Activity boundary is hidden, leaving the text
				// stuck in its exited (invisible) state even after the background has faded back in.
				// Plain `display: none` toggling has no such effect-suspension semantics.
				keepMountedMode='display-none'
				onEntered={() => setPreviousItem(item)}
			>
				{(outerStyle) => (
					<Box className={classes.base} style={{ ...outerStyle, backgroundColor: item.bg }}>
						<Transition
							mounted={transition}
							transition={role === 'community' ? 'slide-down' : 'slide-up'}
							duration={reduceMotion ? 0 : inTime}
							timingFunction='ease-in-out'
							exitDuration={reduceMotion ? 0 : outTime}
							keepMounted={true}
							keepMountedMode='display-none'
						>
							{(styles) => (
								// `c` (not `style.color`) is required here: the theme sets a default `c` on
								// every Text, and Mantine resolves that after merging `style`, so a plain
								// `style.color` override was always losing to the theme's black default.
								<Text c={item.fg} style={styles} className={classes.text}>
									{item.text}
								</Text>
							)}
						</Transition>
					</Box>
				)}
			</Transition>
		</Box>
	)
}

export const Hero = () => {
	const { t } = useTranslation(['landingPage', 'common'])
	const [isLoading, setLoading] = useState(false)
	const variants = useCustomVariant()

	return (
		<Stack gap={32} align='center' className={classes.stack}>
			<Stack gap={0} align='center'>
				<Title order={1}>🌈</Title>
				<Title order={1} ta='center'>
					{t('hero.heading')}
				</Title>
			</Stack>
			<Text ta='center' className={classes.subheading}>
				{t('hero.subheading')}
			</Text>
			<Group gap={12} justify='center'>
				<Trans
					i18nKey='hero.find-resources'
					ns='landingPage'
					t={t}
					className={classes.findText}
					components={{
						Text: <Text className={classes.findText} />,
						Service: <RevolvingBox role='services' />,
						Community: <RevolvingBox role='community' />,
					}}
				/>
			</Group>
			<Stack gap={0} align='center'>
				<Group maw={636} w='100%'>
					<Tabs defaultValue='location' w='100%'>
						<Tabs.List grow justify='space-between'>
							<Tabs.Tab value='location'>{t('common:words.location')}</Tabs.Tab>
							<Tabs.Tab value='name'>{t('common:words.organization')}</Tabs.Tab>
						</Tabs.List>
						<Tabs.Panel value='location' m={0}>
							<SearchBox
								type='location'
								loadingManager={{ isLoading, setLoading }}
								placeholderTextKey='search.location-placeholder-searchby'
							/>
						</Tabs.Panel>
						<Tabs.Panel value='name' m={0}>
							<SearchBox
								type='organization'
								loadingManager={{ isLoading, setLoading }}
								placeholderTextKey='search.organization-placeholder-searchby'
							/>
						</Tabs.Panel>
					</Tabs>
				</Group>
				<Text variant={variants.Text.utility4darkGray}>
					<Trans
						i18nKey='hero.privacy-disclaimer'
						ns='landingPage'
						components={{
							Link: (
								<PrivacyStatementModal
									component={Link}
									variant={variants.Link.inheritStyleUnderline}
								></PrivacyStatementModal>
							),
						}}
					/>
				</Text>
			</Stack>
		</Stack>
	)
}
