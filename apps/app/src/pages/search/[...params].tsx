/* eslint-disable i18next/no-literal-string */
import { Code } from '@mantine/core'
import { trpcServerClient } from '@weareinreach/api/trpc'
import { useTypedRouterQuery } from '@weareinreach/ui/hooks'
import { GetServerSideProps } from 'next'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { z } from 'zod'

import { api } from '~app/utils/api'
import { i18nextConfig } from '~app/utils/i18n'

const ParamSchema = z.tuple([
	z.literal('dist'),
	z.coerce.number().gte(-180).lte(180).describe('longitude'),
	z.coerce.number().gte(-90).lte(90).describe('latitude'),
	z.coerce.number().describe('distance'),
	z.literal('mi').or(z.literal('km')).describe(`'mi' or 'km'`),
])

const SearchResults = () => {
	const { query } = useTypedRouterQuery(z.object({ params: ParamSchema }))
	const queryClient = api.useContext()
	const { t, ready } = useTranslation(['services', 'org-description'])

	const [searchType, lon, lat, dist, unit] = query.params
	const ids = api.organization.searchDistance.useQuery(
		{ lat, lon, dist, unit },
		{
			onSuccess: (input) =>
				queryClient.organization.getSearchDetails.invalidate({ ids: input.orgs.map(({ id }) => id) }),
		}
	)

	const orgs =
		ids.data && ids.isSuccess
			? api.organization.getSearchDetails.useQuery({ ids: ids.data.orgs.map(({ id }) => id) })
			: undefined

	const resultList =
		orgs?.data && orgs?.isSuccess && ready
			? orgs.data.map((result) => {
					return (
						<div key={result.id}>
							<p>Name: {result.name}</p>
							<p>Slug: {result.slug}</p>
							<p>
								Description:{' '}
								{result.description ? t(result.description.key, { ns: result.description.ns }) : 'none'}
							</p>
							Services:{' '}
							<ul>
								{result.services.map((service) => (
									<li key={service.id}>{t(service.tsKey, { ns: service.tsNs })}</li>
								))}
							</ul>
						</div>
					)
			  })
			: null

	return (
		<div>
			{resultList}
			{/* <Code block>{JSON.stringify(ids, null, 2)}</Code> */}
			<Code block>{JSON.stringify(orgs, null, 2)}</Code>
		</div>
	)
}

export const getServerSideProps: GetServerSideProps = async ({ req, res, locale, query }) => {
	const [searchType, lon, lat, dist, unit] = ParamSchema.parse(query.params)

	const ssg = await trpcServerClient()

	await ssg.organization.searchDistance.prefetch({ lat, lon, dist, unit })

	const props = {
		trpcState: ssg.dehydrate(),
		// ...(await serverSideTranslations(locale as string, [], i18nextConfig)),
	}

	return {
		props,
	}
}

export default SearchResults
