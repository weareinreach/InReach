import { trpcServerClient } from '@weareinreach/api/trpc'
import { UserReviewPrompt } from '@weareinreach/ui/components/core'
import { DateTime } from 'luxon'
import { GetServerSidePropsContext, NextPage } from 'next'
import { useSession } from 'next-auth/react'

import { api } from '~/utils/api'

const DataTest: NextPage = () => {
	const x = api.organization.getById.useQuery({ id: 'cldax0nbr00jev1mqeup963jo' })
	// const time = DateTime.fromJSDate(x.data?.hours[0]?.end)
	// 	//.set({ weekday: x.data?.hours[0]?.dayIndex })
	// 	.toLocaleString(DateTime.TIME_24_WITH_SHORT_OFFSET)

	return (
		<>
			{JSON.stringify(useSession(), null, 2)}
			<br />
			<br />
			{JSON.stringify(api.auth.getSession.useQuery(), null, 2)}
			<UserReviewPrompt avatarName='' avatarUrl='' submitHandler={y} />
		</>
	)
}

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
	const { req, res } = context

	const ssg = await trpcServerClient()

	await ssg.organization.searchName.prefetch({ search: 'trevor' })

	return {
		props: {
			trpcState: ssg.dehydrate(),
		},
	}
}

export default DataTest
