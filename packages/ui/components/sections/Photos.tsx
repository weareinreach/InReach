import { AspectRatio, Text, Title, Group, Stack, Modal, createStyles } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { type ApiOutput } from '@weareinreach/api'
import Image from 'next/image'
import { useTranslation } from 'next-i18next'

import { useScreenSize, useCustomVariant } from '~ui/hooks'

const useStyles = createStyles((theme) => ({
	text: {
		color: theme.other.colors.secondary.black,
		textDecoration: 'underline',
		fontWeight: 600,
		cursor: 'pointer',
	},
}))

export const PhotosSection = ({ photos }: PhotosSectionProps) => {
	const { t } = useTranslation('common')
	const { classes } = useStyles()
	const variants = useCustomVariant()
	const { isMobile } = useScreenSize()

	const Photo = ({ src, width, height }: PhotoProps) => {
		const [opened, { open, close }] = useDisclosure()

		return (
			<div>
				<Modal opened={opened} onClose={close}>
					<AspectRatio ratio={480 / 360} miw={300}>
						<Image src={src} alt={t('org-image')} width={width || 720} height={height || 480} />
					</AspectRatio>
				</Modal>
				<AspectRatio miw={160} ratio={1}>
					<Image
						style={{ cursor: 'pointer' }}
						onClick={open}
						src={src}
						width={160}
						height={160}
						alt={t('org-image')}
					/>
				</AspectRatio>
			</div>
		)
	}

	const photosArray = Array.isArray(photos) ? photos : [photos]
	const mainImages = isMobile ? 2 : 4
	const mainDisplay = photosArray.slice(0, mainImages)

	const displayPhotos = (
		<>
			<Group noWrap>
				{mainDisplay.map((photo) => (
					<Photo key={photo.src} {...photo} />
				))}
			</Group>
			<Text className={classes.text}>
				{t('photo_interval', { count: photosArray.length, postProcess: 'interval' })}
			</Text>
		</>
	)

	return (
		<Stack spacing={isMobile ? 32 : 40} align='flex-start'>
			<Group h={48}>
				<Title order={2}>{t('photo', { count: 2 })}</Title>
			</Group>
			{photosArray.length > 0 ? (
				displayPhotos
			) : (
				<Text variant={variants.Text.darkGray}>
					{t('photo_interval', { count: 0, postProcess: 'interval' })}
				</Text>
			)}
		</Stack>
	)
}

type PageQueryResult = NonNullable<ApiOutput['organization']['getBySlug']>

export type PhotosSectionProps = {
	photos: PageQueryResult['locations'][number]['photos'] | PageQueryResult['photos'][number]
}

type PhotoProps = {
	src: string
	width: number | null
	height: number | null
}
