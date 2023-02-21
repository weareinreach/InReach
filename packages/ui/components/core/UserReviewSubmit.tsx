import { Stack, Text, createStyles, Rating, Textarea, useMantineTheme, Paper, Grid } from '@mantine/core'
import { useForm, zodResolver } from '@mantine/form'
import { ApiInput } from '@weareinreach/api'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'

import { Icon } from '~ui/icon'
import { trpc as api } from '~ui/lib/trpcClient'

import { Button } from './Button'
import { UserAvatar } from './UserAvatar'

const useStyles = createStyles((theme) => ({
	textContainer: {
		paddingLeft: '0px',
		paddingRight: '0px',
		height: '120px',
	},
	button: {
		// width: '178px',
		// height: '40px',
	},
	rating: {
		columnGap: '4px',
	},
	reviewLabel: {
		paddingBottom: 10,
	},
	inputElement: {
		padding: '14px 16px',
		borderColor: theme.other.colors.tertiary.coolGray,

		...theme.other.utilityFonts.utility2,
		'&::placeholder': {
			color: theme.other.colors.secondary.darkGray,
		},
		'&:focus, &:focus-within': {
			borderColor: theme.other.colors.secondary.black,
			borderWidth: '2px',
		},
	},
	inputWrapper: {
		height: '96px',
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

export const UserReviewSubmit = () => {
	const { classes } = useStyles()
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
	return (
		<Grid.Col sm={8}>
			<Paper withBorder radius='lg' p={theme.spacing.lg}>
				<form
					onSubmit={form.onSubmit((values) => {
						submitReview.mutate(values)
					}, console.log)}
				>
					<Stack align='flex-start' spacing='xl'>
						<UserAvatar useLoggedIn={true} subheading={null} />
						<Rating
							emptySymbol={
								<Icon icon='carbon:star-filled' color={theme.other.colors.tertiary.coolGray} height={24} />
							}
							fullSymbol={
								<Icon icon='carbon:star-filled' color={theme.other.colors.secondary.black} height={24} />
							}
							classNames={{ root: classes.rating }}
							{...form.getInputProps('rating')}
						/>
						<Stack spacing={10}>
							<Textarea
								label=<Text fw={theme.other.fontWeight.semibold}>{t('review-resource')}</Text>
								placeholder={t('enter-review')!}
								radius='md'
								autosize
								minRows={3}
								maxRows={5}
								w='100%'
								classNames={{
									label: classes.reviewLabel,
									input: classes.inputElement,
									wrapper: classes.inputWrapper,
								}}
								{...form.getInputProps('reviewText')}
							/>
							<Text size={14} color={theme.other.colors.secondary.darkGray}>
								{t('review-note')}
							</Text>
						</Stack>
						<Button variant='primary' className={classes.button} type='submit'>
							{t('submit')}
						</Button>
					</Stack>
				</form>
			</Paper>
		</Grid.Col>
	)
}

type FormFields = ApiInput['review']['create']
