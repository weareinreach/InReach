import { Grid, Stack } from '@mantine/core'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { type GetServerSideProps } from 'nextjs-routes'
import { useForm } from 'react-hook-form'
import { Textarea, TextInput } from 'react-hook-form-mantine'
import { z } from 'zod'

import { prefixedId } from '@weareinreach/api/schemas/idPrefix'
import { trpcServerClient } from '@weareinreach/api/trpc'
import { checkServerPermissions } from '@weareinreach/auth'
import { api } from '~app/utils/api'
import { getServerSideTranslations } from '~app/utils/i18n'
import { Badge } from '~ui/components/core/Badge'
import { InlineTextInput } from '~ui/components/data-portal/InlineTextInput'

const FreetextObject = z
	.object({
		text: z.string().nullable(),
		key: z.string().nullish(),
		ns: z.string().nullish(),
	})
	.nullish()

const FormSchema = z.object({
	name: FreetextObject,
	desription: FreetextObject,
	services: z.object({ id: prefixedId('serviceTag'), tsKey: z.string(), tsNs: z.string() }).array(),
	published: z.boolean(),
	deleted: z.boolean(),
})
type FormSchemaType = z.infer<typeof FormSchema>
const EditServicePage = () => {
	const { t } = useTranslation()
	const router = useRouter<'/org/[slug]/[orgLocationId]/edit/[orgServiceId]'>()
	const { data } = api.page.serviceEdit.useQuery({ id: router.query.orgServiceId ?? '' })
	const form = useForm<FormSchemaType>({
		values: data ? data : undefined,
	})

	const nameIsDirty =
		typeof form.formState.dirtyFields.name === 'object' ? form.formState.dirtyFields.name.text : false

	return (
		<>
			<Grid.Col xs={12} sm={8} order={1}>
				<Stack pt={24} align='flex-start' spacing={40}>
					<Stack spacing={20} w='100%'>
						<InlineTextInput
							component={TextInput<FormSchemaType>}
							name='name.text'
							control={form.control}
							fontSize='h2'
							data-isDirty={nameIsDirty}
						/>
						<InlineTextInput
							component={Textarea<FormSchemaType>}
							name='description.text'
							control={form.control}
							data-isDirty={nameIsDirty}
							autosize
						/>
					</Stack>
					{!!data && (
						<Badge.Group>
							{data.services.map((service) => (
								<Badge.ServiceTag key={service.id}>{t(service.tsKey, { ns: service.tsNs })}</Badge.ServiceTag>
							))}
						</Badge.Group>
					)}
				</Stack>
			</Grid.Col>
		</>
	)
}

export default EditServicePage

export const getServerSideProps: GetServerSideProps = async ({ locale, params, req, res }) => {
	const urlParams = z
		.object({
			slug: z.string(),
			orgLocationId: prefixedId('orgLocation'),
			orgServiceId: prefixedId('orgService'),
		})
		.safeParse(params)
	if (!urlParams.success) return { notFound: true }
	const { slug, orgLocationId, orgServiceId } = urlParams.data
	const session = await checkServerPermissions({
		ctx: { req, res },
		permissions: ['dataPortalBasic'],
		has: 'some',
	})
	if (!session) {
		return {
			redirect: {
				destination: '/',
				permanent: false,
			},
		}
	}
	const ssg = await trpcServerClient({ session })
	const { id: orgId } = await ssg.organization.getIdFromSlug.fetch({ slug })
	const [i18n] = await Promise.all([
		getServerSideTranslations(locale, [
			'common',
			'services',
			'attribute',
			'phone-type',
			'country',
			'gov-dist',
			orgId,
		]),
		ssg.organization.getBySlug.prefetch({ slug }),
		ssg.location.getById.prefetch({ id: orgLocationId }),
	])
	const props = {
		session,
		trpcState: ssg.dehydrate(),
		...i18n,
	}

	return {
		props,
	}
}
