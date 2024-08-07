import {
	Box,
	createStyles,
	Group,
	rem,
	Stack,
	Tabs,
	Text,
	Title,
	Transition,
	useMantineTheme,
} from '@mantine/core'
import { useReducedMotion } from '@mantine/hooks'
import { useRouter } from 'next/router'
import { Trans, useTranslation } from 'next-i18next'
import { useEffect, useState } from 'react'

import { Link } from '~ui/components/core/Link'
import { SearchBox } from '~ui/components/core/SearchBox'
import { useCustomVariant } from '~ui/hooks'
import { PrivacyStatementModal } from '~ui/modals/PrivacyStatement'

const useBoxStyles = createStyles((theme) => ({
	base: {
		width: '100%',
		height: '100%',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		borderRadius: rem(8),
	},
	wrapper: {
		height: rem(40),
		borderRadius: rem(8),
	},
	text: {
		...theme.other.utilityFonts.utility1,
		textAlign: 'center',
		verticalAlign: 'center',
	},
	service: {
		width: rem(200),
	},
	community: {
		width: rem(250),
	},
}))

const useHeroStyles = createStyles((theme) => ({
	stack: {
		margin: `${rem(48)} ${rem(0)}`,
		[theme.fn.largerThan('xs')]: {
			margin: `${rem(80)} ${rem(0)}`,
		},
		[theme.fn.largerThan('sm')]: {
			margin: `${rem(100)} ${rem(0)}`,
		},
	},
	subheading: {
		fontSize: rem(16),
		lineHeight: 1.5,
		[theme.fn.largerThan('sm')]: {
			fontSize: rem(24),
			lineHeight: 1.25,
		},
	},
	findText: {
		...theme.other.utilityFonts.utility3,
		[theme.fn.largerThan('sm')]: {
			...theme.other.utilityFonts.utility2,
		},
	},
}))

type RevolvingBoxProps = {
	role: 'services' | 'community'
}
type RandomArr = <T extends Array<unknown>>(arr: T) => T[number]

const randomArrMember: RandomArr = (arr) => arr[Math.floor(Math.random() * arr.length)]
const getRandomNumber = (min: number, max: number) => {
	// Get the random number between min and max.
	return Math.floor(Math.random() * (max - min + 1)) + min
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
	const { classes, cx } = useBoxStyles()
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
						>
							{(styles) => (
								<Text style={{ ...styles, color: item.fg }} className={classes.text}>
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
	const { classes } = useHeroStyles()
	const [isLoading, setLoading] = useState(false)
	const variants = useCustomVariant()

	return (
		<Stack spacing={32} align='center' className={classes.stack}>
			<Stack spacing={0} align='center'>
				<Title order={1}>🌈</Title>
				<Title order={1} align='center'>
					{t('hero.heading')}
				</Title>
			</Stack>
			<Text align='center' className={classes.subheading}>
				{t('hero.subheading')}
			</Text>
			<Group spacing={12} position='center'>
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
			<Stack spacing={0} align='center'>
				<Group maw={636} w='100%'>
					<Tabs defaultValue='location' w='100%'>
						<Tabs.List grow position='apart'>
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
									variant={variants.Link.inheritStyle}
								></PrivacyStatementModal>
							),
						}}
					/>
				</Text>
			</Stack>
		</Stack>
	)
}
