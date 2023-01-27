import { DateTime } from 'luxon'
import { NextPage } from 'next'
import { useSession } from 'next-auth/react'

import { api } from '~/utils/api'

const DataTest: NextPage = () => {
	const x = api.organization.getById.useQuery({ id: 'cldax0nbr00jev1mqeup963jo' })
	const time = DateTime.fromJSDate(x.data?.hours[0]?.end)
		//.set({ weekday: x.data?.hours[0]?.dayIndex })
		.toLocaleString(DateTime.TIME_24_WITH_SHORT_OFFSET)

	return (
		<>
			{JSON.stringify(useSession(), null, 2)}
			<br />
			{time}
			<br />
			{JSON.stringify(api.auth.getSession.useQuery(), null, 2)}
		</>
	)
}
export default DataTest
