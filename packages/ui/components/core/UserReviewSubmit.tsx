import {
	Stack,
	Text,
	Group,
	createStyles,
	Avatar,
	Rating,
	Textarea,
	useMantineTheme,
	Container,
} from '@mantine/core'
import { useTranslation } from 'react-i18next'

import { Button } from '.'
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

export const UserReviewSubmit = ({ avatarUrl, avatarName }: UserProps) => {
	const { classes } = useStyles()
	const { t } = useTranslation()
	const theme = useMantineTheme()

	return (
		<Stack>
			<Group>
				<Avatar
					radius='xl'
					className={classes.avatar}
					src={avatarUrl}
					alt={avatarName || (t('user-avatar') as string)}
				>
					<Icon icon='carbon:user' height={24} />
				</Avatar>
				<Stack align='flex-start' justify='center' spacing={4}>
					<Text weight={theme.other.fontWeight.semibold}>{avatarName ? avatarName : t('in-reach-user')}</Text>
				</Stack>
			</Group>
			<Rating
				size='md'
				emptySymbol={<Icon icon='carbon:star-filled' color={theme.other.colors.tertiary.coolGray} />}
				fullSymbol={<Icon icon='carbon:star-filled' color={theme.other.colors.secondary.black} />}
			/>
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
