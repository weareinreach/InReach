import Image from 'next/image'

import { Carousel } from '@mantine/carousel'
import { Overlay, Stack, createStyles, useMantineTheme } from '@mantine/core'

import { CtaButton } from './'

interface HeroCarouselProps {
	items: Array<string>
}

const useStyles = createStyles((theme) => ({
	backgroundImg: {
		zIndex: -10,
		objectFit: 'cover',
	},
	text: {
		'*': {
			color: theme.colors.white,
			margin: 0,
		},
	},
}))

export const HeroCarousel = (props: HeroCarouselProps) => {
	const { items } = props
	const { classes } = useStyles()
	const theme = useMantineTheme()

	const components = {
		CtaButton: CtaButton,
	}
	console.log('hc', items)

	const slides = items.map((slide) => {
		const { image, alt, content } = slide

		return (
			<Carousel.Slide>
				<Image src={image as string} alt={alt as string} className={classes.backgroundImg} fill priority />
				<Overlay opacity={0.6} zIndex={-9} color={theme.colors.gray[0]} />
				<Stack spacing='xs' className={classes.text}></Stack>
			</Carousel.Slide>
		)
	})

	return (
		<Carousel align='center' withControls={false}>
			{slides}
		</Carousel>
	)
}
