// apps/app/src/pages/data-portal/org-url-duplicate-check-exceptions.tsx
/* eslint-disable i18next/no-literal-string -- Data Portal is internal-only, no i18n needed */

import { Alert, Code, List, Text } from '@mantine/core'
import { type GetServerSideProps } from 'next'
import Head from 'next/head'
import { useTranslation } from 'next-i18next/pages'

import { checkServerPermissions } from '@weareinreach/auth'
import { AddOrgUrlDuplicateExceptionModal } from '@weareinreach/ui/components/data-portal/AddOrgUrlDuplicateExceptionModal'
import { DataPortalPageShell } from '@weareinreach/ui/components/data-portal/DataPortalPageShell'
import { organizationsSideNav } from '@weareinreach/ui/components/data-portal/organizationsSideNav'
import { OrgUrlDuplicateExceptionTable } from '@weareinreach/ui/components/data-portal/OrgUrlDuplicateExceptionTable'
import { PageHeading } from '@weareinreach/ui/components/data-portal/PageHeading'
import { Icon } from '@weareinreach/ui/icon'
import { type NextPageWithOptions } from '~app/pages/_app'
import { getServerSideTranslations } from '~app/utils/i18n'

const HowExceptionsWorkAlert = () => (
	<Alert
		icon={<Icon icon='carbon:information-filled' />}
		color='blue'
		variant='light'
		title='How exceptions work'
		mb='md'
	>
		<Text size='sm' mb={4}>
			The exact same web address can never be used by two different organizations - that's always true,
			whether or not it's on this list.
		</Text>
		<List size='sm' spacing={4}>
			<List.Item>
				Add a whole site, e.g. <Code>example.com</Code>, to let different organizations each use their own
				page on it - <Code>example.com/providerA</Code>, <Code>example.com/providerB</Code>, and so on.
			</List.Item>
			<List.Item>
				Add a specific section instead, e.g. <Code>example.com/directory</Code>, to exempt only that section.
				Pages outside it - including the plain <Code>example.com</Code> address - are still treated as
				duplicates if another organization is already somewhere on that site.
			</List.Item>
		</List>
	</Alert>
)

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
					action={<AddOrgUrlDuplicateExceptionModal>Add Base URL</AddOrgUrlDuplicateExceptionModal>}
				/>
				<HowExceptionsWorkAlert />
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
