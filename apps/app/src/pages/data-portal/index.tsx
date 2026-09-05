// apps/app/src/pages/data-portal/index.tsx
// Organizations is the default landing view for the Data Portal, matching current /admin behavior -
// see docs/DataPortal/2026-Redesign/UI_elements.md ("Routing").

import { type GetServerSideProps } from 'next'

export default function DataPortalIndex() {
	return null
}

export const getServerSideProps: GetServerSideProps = async () => ({
	redirect: {
		destination: '/data-portal/organizations',
		permanent: false,
	},
})
