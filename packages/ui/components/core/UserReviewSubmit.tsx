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
import { ApiInput } from '@weareinreach/api'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'

import { Button } from '.'
import { useTypedRouterQuery } from '../../hooks'
import { Icon } from '../../icon'
import { trpc as api } from '../../lib/trpcClient'

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
	locationId: z.string().optional(),
	serviceId: z.string().optional(),
})
const ReviewSchema = z.object({
	organizationId: z.string(),
	orgLocationId: z.string().optional(),
	orgServiceId: z.string().optional(),
	rating: z.number(),
	reviewText: z.string().optional(),
})

export const UserReviewSubmit = ({ avatarUrl, avatarName }: UserProps) => {
	const { classes } = useStyles()
	const { t } = useTranslation()
	const theme = useMantineTheme()
	const { query } = useTypedRouterQuery(RouterSchema)
	const { data: orgQuery, status } = api.organization.getIdFromSlug.useQuery(query, { enabled: !!query })
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
			<form
				onSubmit={form.onSubmit((values) => {
					submitReview.mutate(values)
				}, console.log)}
			>
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
				<Button variant='primary' className={classes.button} type='submit'>
					{t('submit')}
				</Button>
			</form>
		</Stack>
	)
}

type UserProps = {
	avatarUrl: string | null
	avatarName: string | null
}

type FormFields = ApiInput['review']['create']
