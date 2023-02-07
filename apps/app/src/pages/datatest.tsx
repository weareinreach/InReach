import { Code } from '@mantine/core'
import { trpcServerClient } from '@weareinreach/api/trpc'
import { GetServerSidePropsContext, NextPage } from 'next'
import { useSession } from 'next-auth/react'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import { api } from '~app/utils/api'

const DataTest: NextPage = (props) => {
	const x = api.organization.searchName.useQuery({ search: 'trevor' })
	const utils = api.useContext()

	return (
		<>
			<Code block>{JSON.stringify(useSession(), null, 2)}</Code>
			<Code block>{JSON.stringify(x, null, 2)}</Code>
			<Code block>{JSON.stringify(api.savedList.getAll.useQuery(), null, 2)}</Code>
		</>
	)
}

export const getServerSideProps = async ({ req, res, locale }: GetServerSidePropsContext) => {
	const ssg = await trpcServerClient()

	await ssg.organization.searchName.prefetch({ search: 'trevor' })

	const props = {
		trpcState: ssg.dehydrate(),
		...(await serverSideTranslations(locale as string, ['common'])),
	}

	return {
		props,
	}
}

export default DataTest
