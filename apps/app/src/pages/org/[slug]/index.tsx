import { trpcServerClient } from '@weareinreach/api/trpc'
import { GetServerSideProps, NextPage } from 'next'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import { type ParsedUrlQuery } from 'querystring'

import { api } from '@app/utils/api'

const OrganizationPage: NextPage = () => {
	const { t } = useTranslation()

	return <></>
}

export const getServerSideProps: GetServerSideProps = async ({ req, res, locale, params }) => {
	const ssg = await trpcServerClient()
	const { slug } = params as PathParams

	await ssg.organization.getBySlug.prefetch({ slug })
	await ssg.organization.getIdFromSlug.prefetch({ slug })
	const props = {
		trpcState: ssg.dehydrate(),
		...(await serverSideTranslations(locale as string, ['common'])),
	}

	return {
		props,
	}
}

interface PathParams extends ParsedUrlQuery {
	slug: string
}

export default OrganizationPage
