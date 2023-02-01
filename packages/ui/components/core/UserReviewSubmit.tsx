import {
	Stack,
	Text,
	Group,
	createStyles,
	Avatar,
	Rating,
	Textarea,
	useMantineTheme,
	Paper,
	Grid,
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
		// width: '816px',
		// [theme.fn.smallerThan('md')]: {
		// 	width: '700px',
		// },
		// [theme.fn.smallerThan('sm')]: {
		// 	width: '300px',
		// 	marginBottom: theme.spacing.sm,
		// },
	},
	button: {
		// width: '178px',
		// height: '40px',
	},
	avatar: {
		// height: '48px',
		// width: '48px',
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
		<Grid.Col sm={8}>
			<Paper withBorder radius='lg' p={theme.spacing.lg}>
				<form
					onSubmit={form.onSubmit((values) => {
						submitReview.mutate(values)
					}, console.log)}
				>
					<Stack align='flex-start' spacing='xl'>
						<Group>
							<Avatar
								radius='xl'
								size={48}
								className={classes.avatar}
								src={avatarUrl}
								alt={avatarName || (t('user-avatar') as string)}
							>
								<Icon icon='carbon:user' height={24} />
							</Avatar>
							<Text weight={theme.other.fontWeight.semibold}>
								{avatarName ? avatarName : t('in-reach-user')}
							</Text>
						</Group>

						<Rating
							emptySymbol={
								<Icon icon='carbon:star-filled' color={theme.other.colors.tertiary.coolGray} height={24} />
							}
							fullSymbol={
								<Icon icon='carbon:star-filled' color={theme.other.colors.secondary.black} height={24} />
							}
							{...form.getInputProps('rating')}
						/>
						<Textarea
							label=<Text fw={theme.other.fontWeight.semibold} mb={10}>
								{t('review-resource')}
							</Text>
							placeholder={t('enter-review')!}
							radius='md'
							autosize
							minRows={2}
							maxRows={5}
							w='100%'
							{...form.getInputProps('reviewText')}
						/>
						<Text size={14} mt={-14} color={theme.other.colors.secondary.darkGray}>
							{t('review-note')}
						</Text>

						<Button variant='primary' className={classes.button} type='submit'>
							{t('submit')}
						</Button>
					</Stack>
				</form>
			</Paper>
		</Grid.Col>
	)
}

type UserProps = {
	avatarUrl: string | null
	avatarName: string | null
}

type FormFields = ApiInput['review']['create']
