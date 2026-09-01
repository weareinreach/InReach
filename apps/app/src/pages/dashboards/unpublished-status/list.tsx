// apps/app/src/pages/dashboards/unpublished-status/list.tsx

import { Group, Title } from '@mantine/core'
import { type GetServerSideProps } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next/pages'

import { checkServerPermissions } from '@weareinreach/auth'
import { Link } from '@weareinreach/ui/components/core/Link'
import { UnpublishedStatusWorklistTable } from '@weareinreach/ui/components/dashboard/UnpublishedStatusWorklistTable'
import { Icon } from '@weareinreach/ui/icon'
import { type NextPageWithOptions } from '~app/pages/_app'
import { getServerSideTranslations } from '~app/utils/i18n'

const UnpublishedStatusList: NextPageWithOptions = () => {
	const { t } = useTranslation(['common'])
	const router = useRouter()
	const tier = typeof router.query.tier === 'string' ? router.query.tier : undefined

	return (
		<>
			<Head>
				<title>{t('page-title.base', { title: 'Unpublished Status' })}</title>
			</Head>
			<Group gap={8}>
				<Link href={{ pathname: '/dashboards/unpublished-status' }}>
					<Icon icon='carbon:arrow-left' />
				</Link>
				<Title order={2}>{tier ? `Unpublished Status — ${tier}` : 'Unpublished Status — All groups'}</Title>
			</Group>
			<UnpublishedStatusWorklistTable tier={tier} />
		</>
	)
}

export default UnpublishedStatusList

export const getServerSideProps: GetServerSideProps = async ({ locale, req, res }) => {
	const session = await checkServerPermissions({
		ctx: { req, res },
		permissions: ['dataPortalManager', 'dataPortalAdmin', 'root'],
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
	return {
		props: {
			session,
			...(await getServerSideTranslations(locale, ['common'])),
		},
	}
}
