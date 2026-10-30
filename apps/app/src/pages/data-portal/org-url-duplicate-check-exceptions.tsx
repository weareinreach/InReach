// apps/app/src/pages/data-portal/org-url-duplicate-check-exceptions.tsx

import { type GetServerSideProps } from 'next'
import Head from 'next/head'
import { useTranslation } from 'next-i18next/pages'

import { checkServerPermissions } from '@weareinreach/auth'
import { AddOrgUrlDuplicateExceptionModal } from '@weareinreach/ui/components/data-portal/AddOrgUrlDuplicateExceptionModal'
import { DataPortalPageShell } from '@weareinreach/ui/components/data-portal/DataPortalPageShell'
import { organizationsSideNav } from '@weareinreach/ui/components/data-portal/organizationsSideNav'
import { OrgUrlDuplicateExceptionTable } from '@weareinreach/ui/components/data-portal/OrgUrlDuplicateExceptionTable'
import { PageHeading } from '@weareinreach/ui/components/data-portal/PageHeading'
import { type NextPageWithOptions } from '~app/pages/_app'
import { getServerSideTranslations } from '~app/utils/i18n'

const DataPortalOrgUrlDuplicateCheckExceptions: NextPageWithOptions = () => {
	const { t } = useTranslation(['common'])
	const title = 'Org URL Duplicate Check Exceptions'

	return (
		<>
			<Head>
				<title>{t('page-title.base', { title })}</title>
			</Head>
			<DataPortalPageShell activeSection='organizations' sideNav={organizationsSideNav('URL Exceptions')}>
				<PageHeading
					title={title}
					// eslint-disable-next-line i18next/no-literal-string -- Data Portal is internal-only, no i18n needed
					action={<AddOrgUrlDuplicateExceptionModal>Add Base URL</AddOrgUrlDuplicateExceptionModal>}
				/>
				<OrgUrlDuplicateExceptionTable />
			</DataPortalPageShell>
		</>
	)
}
// Matches every other Data Portal page - see organizations.tsx's own comment on this.
DataPortalOrgUrlDuplicateCheckExceptions.omitGrid = true

export default DataPortalOrgUrlDuplicateCheckExceptions

export const getServerSideProps: GetServerSideProps = async ({ locale, req, res }) => {
	// Manager+ - same floor as Downloads/Bulk Search & Replace/Contact Cleanup, the other manager-and-above
	// items in this same side-nav section.
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
