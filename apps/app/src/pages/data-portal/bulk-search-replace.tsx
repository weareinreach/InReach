// apps/app/src/pages/data-portal/bulk-search-replace.tsx

import { type GetServerSideProps } from 'next'
import Head from 'next/head'
import { useTranslation } from 'next-i18next/pages'

import { checkServerPermissions } from '@weareinreach/auth'
import { BulkSearchReplaceTable } from '@weareinreach/ui/components/data-portal/BulkSearchReplaceTable'
import { DataPortalPageShell } from '@weareinreach/ui/components/data-portal/DataPortalPageShell'
import { organizationsSideNav } from '@weareinreach/ui/components/data-portal/organizationsSideNav'
import { PageHeading } from '@weareinreach/ui/components/data-portal/PageHeading'
import { type NextPageWithOptions } from '~app/pages/_app'
import { getServerSideTranslations } from '~app/utils/i18n'

const DataPortalBulkSearchReplace: NextPageWithOptions = () => {
	const { t } = useTranslation(['common'])

	return (
		<>
			<Head>
				<title>{t('page-title.base', { title: 'Bulk Search & Replace' })}</title>
			</Head>
			<DataPortalPageShell
				activeSection='organizations'
				sideNav={organizationsSideNav('Bulk Search & Replace')}
			>
				<PageHeading title='Bulk Search & Replace' />
				<BulkSearchReplaceTable />
			</DataPortalPageShell>
		</>
	)
}
// Matches every other Data Portal page - see organizations.tsx's own comment on this.
DataPortalBulkSearchReplace.omitGrid = true

export default DataPortalBulkSearchReplace

export const getServerSideProps: GetServerSideProps = async ({ locale, req, res }) => {
	// Stricter floor than organizations.tsx's Basic+ - see docs/DataPortal/Organizations/bulk-search-replace.md's
	// Access section for why (population-sensitive content, both text and bulk taxonomy edits).
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
			// 'attribute'/'services' needed for the bulk attribute/tag dialog's real labels.
			...(await getServerSideTranslations(locale, ['common', 'attribute', 'services'])),
		},
	}
}
