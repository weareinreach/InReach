import { Title, Text, Stack, Box, createStyles, rem, Group, Transition } from '@mantine/core'
import { usePrevious } from '@mantine/hooks'
import { useTranslation, Trans, TFunction } from 'next-i18next'
import { useState, useEffect } from 'react'

import { SearchBox } from '~ui/components/core/SearchBox'

const useBoxStyles = createStyles(
	(theme, { color, previousColor }: { color: string; previousColor?: string }) => ({
		base: {
			backgroundColor: color,
			width: '100%',
			height: '100%',
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
			borderRadius: rem(8),
		},
		wrapper: {
			backgroundColor: previousColor,
			height: rem(40),
			borderRadius: rem(8),
		},
		text: {
			...theme.other.utilityFonts.utility1,
			textAlign: 'center',
			verticalAlign: 'center',
			// margin: 'auto',
		},
		service: {
			width: rem(200),
		},
		community: {
			width: rem(250),
		},
	})
)

const useHeroStyles = createStyles((theme) => ({
	stack: {
		margin: `${rem(80)} ${rem(0)}`,
		[theme.fn.largerThan('sm')]: {
			margin: `${rem(100)} ${rem(0)}`,
		},
	},
}))

type RevolvingBoxProps = {
	role: 'services' | 'community'
	t: TFunction
}
type RandomArr = <T extends Array<any>>(arr: T) => T[number]

const randomArrMember: RandomArr = (arr) => arr[Math.floor(Math.random() * arr.length)]

const RevolvingBox = ({ role, t }: RevolvingBoxProps) => {
	const backgroundColors = ['#FFC2E2', '#FFDFD3', '#FFF6C9', '#E4F1AC', '#BCE4F9', '#E4D4F4', '#F7C4DD']
	const [color, setColor] = useState(
		(role === 'community' ? backgroundColors.at(0) : backgroundColors.at(-1)) as string
	)
	const previousColor = usePrevious(color)
	const { classes, cx } = useBoxStyles({ color, previousColor })
	const style = cx(classes.wrapper, role === 'community' ? classes.community : classes.service)
	const textItems =
		role === 'community'
			? Object.values(t('hero.community', { returnObjects: true }))
			: Object.values(t('hero.services', { returnObjects: true }))
	const [item, setItem] = useState(textItems.at(0))
	const [transition, setTransition] = useState(true)

	const inTime = 750
	const outTime = 500
	const changeTime = 5000
	useEffect(() => {
		const timer = setInterval(() => {
			setTransition(false)
			setTimeout(() => {
				setColor(randomArrMember(backgroundColors))
				setItem(randomArrMember(textItems))
				setTransition(true)
			}, inTime)
		}, changeTime)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	return (
		<Box className={style}>
			<Transition
				mounted={transition}
				transition='fade'
				duration={inTime}
				exitDuration={outTime}
				timingFunction='ease-in-out'
				keepMounted={true}
			>
				{(outerStyle) => (
					<Box className={classes.base} style={outerStyle}>
						<Transition
							mounted={transition}
							transition={role === 'community' ? 'slide-up' : 'slide-down'}
							duration={inTime}
							timingFunction='ease-in-out'
							exitDuration={outTime}
							keepMounted={true}
						>
							{(styles) => (
								<Text style={styles} className={classes.text}>
									{item}
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
	const { t } = useTranslation('landingPage')
	const { classes } = useHeroStyles()

	return (
		<Stack spacing={32} align='center' className={classes.stack}>
			<Stack spacing={0} align='center'>
				<Title order={1}>🌈</Title>
				<Title order={1}>{t('hero.heading')}</Title>
			</Stack>
			<Text fz={24} align='center'>
				{t('hero.subheading')}
			</Text>
			<Group spacing={12} noWrap>
				<Trans
					i18nKey='hero.find-resources'
					ns='landingPage'
					t={t}
					components={{
						Service: <RevolvingBox role='services' t={t} />,
						Community: <RevolvingBox role='community' t={t} />,
					}}
				/>
			</Group>
			<Group maw={636} w='100%'>
				<SearchBox type='location' />
			</Group>
		</Stack>
	)
}
