import { Title, Text, Stack, Box, createStyles, rem, Group, Transition } from '@mantine/core'
import { useInterval } from '@mantine/hooks'
import { useTranslation, Trans } from 'next-i18next'
import { useState, useEffect } from 'react'

import { SearchBox } from '~ui/components/core/SearchBox'

const useBoxStyles = createStyles((theme, { color }: { color: string }) => ({
	base: {
		backgroundColor: color,
		height: rem(40),
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
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
}))

type RevolvingBoxProps = {
	text: string | undefined
	role: 'services' | 'community'
}
type RandomArr = <T extends Array<any>>(arr: T) => T[number]

const randomArrMember: RandomArr = (arr) => arr[Math.floor(Math.random() * arr.length)]

export const Hero = () => {
	const { t } = useTranslation('landingPage')
	const services = Object.values(t('hero.services', { returnObjects: true }))
	const communities = Object.values(t('hero.community', { returnObjects: true }))
	const [service, setService] = useState<string>(services[Math.floor(Math.random() * services.length)])
	const [community, setCommunity] = useState<string>(
		communities[Math.floor(Math.random() * communities.length)]
	)
	const RevolvingBox = ({ text, role }: RevolvingBoxProps) => {
		const backgroundColors = [
			'#F0E68C',
			'#90EE90',
			'#ADD8E6',
			'#FFB6C1',
			'#F08080',
			'#FFE4E1',
			'#B0C4DE',
			'#AFEEEE',
			'#FAFAD2',
			'#E0FFFF',
			'#D3D3D3',
			'#FFFFE0',
			'#E6E6FA',
			'#F5DEB3',
			'#FFEFD5',
		]
		const color = randomArrMember(backgroundColors)
		const { classes, cx } = useBoxStyles({ color })
		const style = cx(classes.base, role === 'community' ? classes.community : classes.service)
		const [transition, setTransition] = useState(false)
		useEffect(() => {
			setTransition(true)
			// return setTransition(false)
		}, [])
		return (
			<Box className={style}>
				<Transition
					mounted={transition}
					transition='fade'
					duration={750}
					timingFunction='ease'
					// exitDuration={750}
				>
					{(styles) => (
						<Text style={styles} className={classes.text}>
							{text}
						</Text>
					)}
				</Transition>
			</Box>
		)
	}

	const interval = useInterval(() => {
		setService(services[Math.floor(Math.random() * services.length)])
		setCommunity(communities[Math.floor(Math.random() * communities.length)])
	}, 5000)
	useEffect(() => {
		interval.start()
		return interval.stop
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	return (
		<Stack spacing={32} align='center'>
			<Stack spacing={0} align='center'>
				<Title order={1}>🌈</Title>
				<Title order={1}>{t('hero.heading')}</Title>
			</Stack>
			<Text fz={24} align='center'>
				{t('hero.subheading')}
			</Text>
			<Group spacing={12}>
				<Trans
					i18nKey='hero.find-resources'
					ns='landingPage'
					t={t}
					components={{
						Service: <RevolvingBox text={service} role='services' />,
						Community: <RevolvingBox text={community} role='community' />,
					}}
				/>
			</Group>
			<Group maw={636}>
				<SearchBox type='location' />
			</Group>
		</Stack>
	)
}
