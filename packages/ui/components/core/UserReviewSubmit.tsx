import { Paper, Rating, Stack, Textarea, useMantineTheme } from '@mantine/core'
import { useForm, zodResolver } from '@mantine/form'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { useEffect } from 'react'
import { z } from 'zod'

import { type ApiInput } from '@weareinreach/api'
import { trpc as api } from '~ui/lib/trpcClient'

import { Button } from './Button'
import { UserAvatar } from './UserAvatar'

const RouterSchema = z.object({
	slug: z.string(),
	orgLocationId: z.string().optional(),
	serviceId: z.string().optional(),
})
const ReviewSchema = z.object({
	organizationId: z.string(),
	orgLocationId: z.string().optional(),
	orgServiceId: z.string().optional(),
	rating: z.number(),
	reviewText: z.string().optional(),
})

export const UserReviewSubmit = ({ type = 'body', closeModalHandler }: ReviewSubmitProps) => {
	const { t } = useTranslation()
	const theme = useMantineTheme()
	const { query: rawQuery } = useRouter()
	const query = RouterSchema.parse(rawQuery)
	const { data: orgQuery, status } = api.organization.getIdFromSlug.useQuery(query, { enabled: !!query })
	const { orgLocationId, serviceId } = query
	const apiUtil = api.useUtils()
	const submitReview = api.review.create.useMutation({
		onSuccess: () => {
			apiUtil.organization.forOrgPage.invalidate()
			apiUtil.location.forLocationPage.invalidate()
			if (closeModalHandler instanceof Function) {
				closeModalHandler()
			}
		},
	})

	const form = useForm<FormFields>({
		initialValues: {
			organizationId: orgQuery?.id ?? '',
			orgLocationId,
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
			})}
		>
			<Stack align='flex-start' spacing='xl'>
				<UserAvatar useLoggedIn={true} avatarSize={48} />
				<Rating {...form.getInputProps('rating')} />
				<Textarea
					label={t('review-resource')}
					placeholder={t('enter-review') satisfies string}
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
				<Paper withBorder radius='lg' p={theme.spacing.lg}>
					{component}
				</Paper>
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
	closeModalHandler?: () => void
}
