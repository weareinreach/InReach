import { useRouter } from 'next/router'
import { type GetServerSideProps } from 'nextjs-routes'
import { z } from 'zod'

import { prefixedId } from '@weareinreach/api/schemas/idPrefix'
import { trpcServerClient } from '@weareinreach/api/trpc'
import { checkServerPermissions } from '@weareinreach/auth'
import { getServerSideTranslations } from '~app/utils/i18n'

const EditServicePage = () => {
	const router = useRouter()

	return <>Edit service page: {router.query.orgServiceId}</>
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
		getServerSideTranslations(locale, ['common', 'services', 'attribute', 'phone-type', orgId]),
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
