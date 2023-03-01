/* eslint-disable i18next/no-literal-string */
import { Code } from '@mantine/core'
import { trpcServerClient } from '@weareinreach/api/trpc'
import { GetServerSideProps, NextPage } from 'next'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { type RoutedQuery } from 'nextjs-routes'

import { api } from '~app/utils/api'

const OrganizationPage: NextPage = () => {
	const { t } = useTranslation()
	const router = useRouter<'/org/[slug]'>()
	const { query } = router
	console.log(query)
	const { data, isLoading } = api.organization.getBySlug.useQuery(query)

	if (isLoading && !data) return <>Loading</>

	if (data?.locations?.length === 1) {
		return (
			<>
				Single Location view
				<Code block>{JSON.stringify(data, null, 2)}</Code>
			</>
		)
	}

	return (
		<>
			Multi Location view
			<Code block>{JSON.stringify(data, null, 2)}</Code>
		</>
	)
}

export const getServerSideProps: GetServerSideProps<{}, RoutedQuery<'/org/[slug]'>> = async ({
	locale,
	params,
}) => {
	if (!params) return { notFound: true }
	const { slug } = params

	const ssg = await trpcServerClient()

	await ssg.organization.getBySlug.prefetch({ slug })
	const props = {
		trpcState: ssg.dehydrate(),
		...(await serverSideTranslations(locale ?? 'en', ['common'])),
	}

	return {
		props,
	}
}

export default OrganizationPage
