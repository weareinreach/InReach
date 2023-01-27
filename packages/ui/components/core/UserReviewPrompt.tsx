import {
	Stack,
	Text,
	Group,
	createStyles,
	Avatar,
	Button,
	Rating,
	Textarea,
	useMantineTheme,
	Container,
} from '@mantine/core'
import Image from 'next/image'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Icon } from '../../icon'

const useStyles = createStyles((theme) => ({
	textContainer: {
		paddingLeft: '0px',
		paddingRight: '0px',
		height: '120px',
		width: '816px',
		[theme.fn.smallerThan('md')]: {
			width: '700px',
		},
		[theme.fn.smallerThan('sm')]: {
			width: '300px',
			marginBottom: theme.spacing.sm,
		},
	},
	button: {
		width: '178px',
		height: '40px',
	},
	avatar: {
		height: '48px',
		width: '48px',
	},
}))

export const UserReviewPrompt = ({ avatarUrl, avatarName }: UserProps) => {
	const { classes } = useStyles()
	const { t, i18n } = useTranslation()
	const theme = useMantineTheme()

	return (
		<Stack>
			<Group>
				<Avatar radius='xl' className={classes.avatar}>
					{avatarUrl ? (
						<Image src={avatarUrl} fill alt={avatarName || t('user-avatar')} />
					) : (
						<Icon icon='carbon:user' className={classes.avatar} />
					)}
				</Avatar>
				<Stack align='flex-start' justify='center' spacing={4}>
					<Text weight={theme.other.fontWeight.semibold}>{avatarName ? avatarName : t('in-reach-user')}</Text>
				</Stack>
			</Group>
			<Rating size='md' />
			<Container className={classes.textContainer}>
				<Textarea label={t('review-resource')} placeholder={t('enter-review')!} radius='md' />
				<Text color={theme.other.colors.secondary.darkGray}>{t('review-note')}</Text>
			</Container>
			<Button variant='sm-primary' className={classes.button}>
				{t('submit')}
			</Button>
		</Stack>
	)
}

type UserProps = {
	avatarUrl: string | null
	avatarName: string | null
}
