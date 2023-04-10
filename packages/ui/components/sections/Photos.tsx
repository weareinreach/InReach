import { Carousel, Embla, useAnimationOffsetEffect } from '@mantine/carousel'
import { AspectRatio, Text, Title, Group, Stack, Modal, createStyles, useMantineTheme } from '@mantine/core'
import { useDisclosure, useMediaQuery } from '@mantine/hooks'
import { type ApiOutput } from '@weareinreach/api'
import Image from 'next/image'
import { useTranslation } from 'next-i18next'
import { useState } from 'react'

import { useCustomVariant } from '~ui/hooks'

const useStyles = createStyles((theme) => ({
	text: {
		color: theme.other.colors.secondary.black,
		textDecoration: 'underline',
		fontWeight: 600,
		cursor: 'pointer',
	},
	modalSize: {
		[theme.fn.largerThan('sm')]: {
			minWidth: '45rem !important',
		},
	},
	indicator: {
		[theme.fn.smallerThan('sm')]: {
			width: '0.5rem',
		},
	},
}))

/**
 * Returns the photo sections component.
 *
 * @remarks
 * To edit the display size of the images in the carousel remember to change:
 *
 * - `Carousel` component maw prop.
 * - `carouselImages` const's children:
 *
 *         + AspectRatio props: ratio, miw (only affects mobile version), maw.
 *
 *         + Image props: width and height.
 * - `modalSize` style, it only affects the desktop's carousel. This style is passed to the Modal's classNames
 *   prop.
 *
 * @param photos - An object, or array of objects containing the following keys: src: string, width: number |
 *   null, and height: number | null
 * @returns JSX.Element
 */
export const PhotosSection = ({ photos }: PhotosSectionProps) => {
	const { t } = useTranslation('common')
	const { classes, cx } = useStyles()
	const variants = useCustomVariant()
	const theme = useMantineTheme()
	const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`)
	const [opened, { open, close }] = useDisclosure()
	const [initialSlide, setInitialSlide] = useState<number | undefined>(undefined)

	const TRANSITION_DURATION = 100
	const [embla, setEmbla] = useState<Embla | null>(null)

	useAnimationOffsetEffect(embla, TRANSITION_DURATION)

	const photosArray = Array.isArray(photos) ? photos : [photos]
	const mainImages = isMobile ? 2 : 4
	const mainDisplay = photosArray.slice(0, mainImages)

	const carouselImages = photosArray.map(({ src, height, width }) => (
		<Carousel.Slide key={src}>
			<AspectRatio ratio={720 / 480} miw={300} maw={720}>
				<Image src={src} alt={t('org-image')} width={width || 720} height={height || 480} />
			</AspectRatio>
		</Carousel.Slide>
	))

	const displayPhotos = (
		<Group noWrap>
			{mainDisplay.map(({ src }, i) => (
				<AspectRatio key={src} miw={160} ratio={1}>
					<Image
						style={{ cursor: 'pointer' }}
						onClick={() => {
							setInitialSlide(i)
							open()
						}}
						src={src}
						width={160}
						height={160}
						alt={t('org-image')}
					/>
				</AspectRatio>
			))}
		</Group>
	)

	return (
		<>
			<Modal
				classNames={{ content: classes.modalSize }}
				padding={'0px !important'}
				transitionProps={{ duration: TRANSITION_DURATION }}
				opened={opened}
				onClose={() => {
					setInitialSlide(undefined)
					close()
				}}
			>
				<Carousel
					initialSlide={initialSlide}
					classNames={{ indicator: classes.indicator }}
					withIndicators
					loop
					getEmblaApi={setEmbla}
					maw={isMobile ? 300 : 720}
				>
					{carouselImages}
				</Carousel>
			</Modal>
			<Stack spacing={isMobile ? 32 : 40} align='flex-start'>
				<Group h={48}>
					<Title order={2}>{t('photo_other')}</Title>
				</Group>
				{photosArray.length > 0 && displayPhotos}
				<Text
					variant={variants.Text.darkGray}
					className={cx({ [classes.text]: photosArray.length > 0 })}
					onClick={() => {
						photosArray.length > 0 && open()
					}}
				>
					{(photosArray.length === 0 || photosArray.length > mainImages) &&
						t('photo_interval', { count: photosArray.length, postProcess: 'interval' })}
				</Text>
			</Stack>
		</>
	)
}

type PageQueryResult = NonNullable<ApiOutput['organization']['getBySlug']>

export type PhotosSectionProps = {
	photos: PageQueryResult['locations'][number]['photos'] | PageQueryResult['photos'][number]
}
