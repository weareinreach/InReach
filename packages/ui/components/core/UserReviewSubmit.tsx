import { Stack, Text, Rating, Textarea, useMantineTheme, Paper, Grid } from '@mantine/core'
import { useForm, zodResolver } from '@mantine/form'
import { ApiInput } from '@weareinreach/api'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'

import { trpc as api } from '~ui/lib/trpcClient'

import { Button } from './Button'
import { UserAvatar } from './UserAvatar'

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

export const UserReviewSubmit = ({ type = 'body' }: ReviewSubmitProps) => {
	const { t } = useTranslation()
	const theme = useMantineTheme()
	const { query: rawQuery } = useRouter()
	const query = RouterSchema.parse(rawQuery)
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

	const isBody = type === 'body'

	const component = (
		<form
			onSubmit={form.onSubmit((values) => {
				submitReview.mutate(values)
			}, console.log)}
		>
			<Stack align='flex-start' spacing='xl'>
				<UserAvatar useLoggedIn={true} />
				<Rating {...form.getInputProps('rating')} />
				<Textarea
					label={t('review-resource')}
					placeholder={t('enter-review')!}
					description={t('review-note')}
					{...form.getInputProps('reviewText')}
				/>
				<Button variant={isBody ? 'primary' : 'primary-icon'} fullWidth={!isBody} type='submit'>
					{t('submit-review')}
				</Button>
			</Stack>
		</form>
	)

	switch (type) {
		case 'modal': {
			return component
		}
		case 'body': {
			return (
				<Grid.Col sm={8}>
					<Paper withBorder radius='lg' p={theme.spacing.lg}>
						{component}
					</Paper>
				</Grid.Col>
			)
		}
	}
}

type FormFields = ApiInput['review']['create']

type ReviewSubmitProps = {
	/**
	 * Is this being used in a page body or in a modal?
	 *
	 * Page body will add a Grid.Col wrapper
	 */
	type?: 'body' | 'modal'
}
