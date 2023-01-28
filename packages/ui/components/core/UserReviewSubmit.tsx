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
import { useForm, zodResolver } from '@mantine/form'
import { type ApiClient, type ApiInput } from '@weareinreach/api'
import { useTypedRouter } from '@weareinreach/api/hooks'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'

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

const RouterSchema = z.object({
	slug: z.string(),
	locationId: z.string().cuid().optional(),
	serviceId: z.string().cuid().optional(),
})
const ReviewSchema = z.object({
	organizationId: z.string().cuid(),
	orgLocationId: z.string().cuid().optional(),
	orgServiceId: z.string().cuid().optional(),
	rating: z.number(),
	reviewText: z.string().optional(),
})

export const UserReviewSubmit = ({ avatarUrl, avatarName, api }: UserProps) => {
	const { classes } = useStyles()
	const { t } = useTranslation()
	const theme = useMantineTheme()
	const { query } = useTypedRouter(RouterSchema)
	const { data: orgQuery, status } = api.organization.getIdFromSlug.useQuery(query)
	const { locationId, serviceId } = query

	const submitReview = api.review.create.useMutation()

	const form = useForm<FormFields>({
		initialValues: {
			organizationId: orgQuery?.id ?? '',
			orgLocationId: locationId,
			orgServiceId: serviceId,
			rating: 0,
		},
		validate: zodResolver(ReviewSchema),
	})

	useEffect(() => {
		if (status === 'success' && orgQuery?.id) form.setFieldValue('organizationId', orgQuery.id)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [status, orgQuery?.id])
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
			<form onSubmit={form.onSubmit((values) => submitReview.mutate(values))}>
				<Rating
					size='md'
					emptySymbol={<Icon icon='carbon:star-filled' color={theme.other.colors.tertiary.coolGray} />}
					fullSymbol={<Icon icon='carbon:star-filled' color={theme.other.colors.secondary.black} />}
					{...form.getInputProps('rating')}
				/>
				<Container className={classes.textContainer}>
					<Textarea
						label={t('review-resource')}
						placeholder={t('enter-review')!}
						radius='md'
						{...form.getInputProps('reviewText')}
					/>
					<Text color={theme.other.colors.secondary.darkGray}>{t('review-note')}</Text>
				</Container>
				<Button variant='sm-primary' className={classes.button}>
					{t('submit')}
				</Button>
			</form>
		</Stack>
	)
}

type UserProps = {
	avatarUrl: string | null
	avatarName: string | null
	api: ApiClient
}

type FormFields = ApiInput['review']['create']
