import { trpcServerClient } from '@weareinreach/api/trpc'
import { GetServerSideProps, NextPage } from 'next'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { z } from 'zod'

import { api } from '~app/utils/api'

const OrgLocationPage: NextPage = () => {
	const { t } = useTranslation()

	return <></>
}

export const getServerSideProps: GetServerSideProps = async ({ locale, params }) => {
	const urlParams = z.object({ slug: z.string(), orgLocationId: z.string() }).safeParse(params)
	if (!urlParams.success) return { notFound: true }
	const { slug, orgLocationId } = urlParams.data

	const ssg = await trpcServerClient()
	await ssg.organization.getBySlug.prefetch({ slug })
	await ssg.location.getById.prefetch({ id: orgLocationId })
	const props = {
		trpcState: ssg.dehydrate(),
		...(await serverSideTranslations(locale ?? 'en', ['common'])),
	}

	return {
		props,
	}
}
export default OrgLocationPage
