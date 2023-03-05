/* eslint-disable i18next/no-literal-string */
import { Code } from '@mantine/core'
import { trpcServerClient } from '@weareinreach/api/trpc'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import { useTranslation, Trans } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { type RoutedQuery } from 'nextjs-routes'
import { useEffect, useState } from 'react'
import { z } from 'zod'

import { api, RouterOutputs } from '~app/utils/api'
import { i18nextConfig } from '~app/utils/i18n'

const ParamSchema = z.tuple([
	z.literal('dist'),
	z.coerce.number().gte(-180).lte(180).describe('longitude'),
	z.coerce.number().gte(-90).lte(90).describe('latitude'),
	z.coerce.number().describe('distance'),
	z.literal('mi').or(z.literal('km')).describe(`'mi' or 'km'`),
])

const ResultCard = ({
	result,
}: {
	result: NonNullable<RouterOutputs['organization']['getSearchDetails']>[number]
}) => {
	const namespaces = new Set([result.slug, ...result.services.map((service) => service.tsNs)])
	const { t, ready, i18n } = useTranslation([...namespaces], { useSuspense: false })
	console.log(result.slug, 'i18n ready?', ready, 'ns', i18n.hasLoadedNamespace(result.slug), i18n)
	if (!ready) return <div>Loading Text</div>
	if (!i18n.hasLoadedNamespace(result.slug)) return <div>ns not loaded</div>
	console.log(
		t(result.description.key, {
			ns: result.slug,
			returnDetails: true,
		})
	)
	return (
		<div key={result.id}>
			<p>Name: {result.name}</p>
			<p>Slug: {result.slug}</p>
			<p>
				Description:{' '}
				{result.description
					? // 	<Trans i18nKey={result.description.key} ns={result.slug}>
					  // 		default value
					  // 	</Trans>
					  // ) : (
					  t(result.description.key, {
							ns: result.slug,
					  })
					: 'none'}
			</p>
			Services:{' '}
			<ul>
				{result.services.map((service) => (
					<li key={service.id}>{t(service.tsKey, { ns: service.tsNs, defaultValue: 'default value' })}</li>
				))}
			</ul>
		</div>
	)
}

const SearchResults = () => {
	const { query, locale } = useRouter<'/search/[...params]'>()
	const queryClient = api.useContext()
	const [namespaces, setNamespaces] = useState(['services'])
	const { t, ready, i18n } = useTranslation(['services'])
	const queryParams = ParamSchema.safeParse(query.params)
	const [okay, setOkay] = useState(false)
	// useEffect(() => {
	// 	console.log('uE', namespaces)
	// 	// i18n.getResourceBundle('es', namespaces)
	// 	// eslint-disable-next-line react-hooks/exhaustive-deps
	// }, [namespaces])

	if (!queryParams.success) return <>Error</>

	console.log('i18n ready', ready)
	console.log('namespaces', namespaces)

	const [searchType, lon, lat, dist, unit] = queryParams.data
	const ids = api.organization.searchDistance.useQuery(
		{ lat, lon, dist, unit },
		{
			onSuccess: (input) =>
				queryClient.organization.getSearchDetails.invalidate({ ids: input.orgs.map(({ id }) => id) }),
		}
	)

	const resultIds = ids.data?.orgs.map(({ id }) => id) ?? []

	const orgs = api.organization.getSearchDetails.useQuery(
		{ ids: resultIds },
		{
			enabled: ids.isSuccess && Boolean(ids.data) && Boolean(resultIds.length),
			// onSettled: async (data) => {
			// 	if (data !== undefined) {
			// 		if (i18n.language !== 'en') {
			// 			const ns = data.map((result) => result.slug)
			// 			await i18n.reloadResources('es', ns)
			// 			await i18n.loadNamespaces(ns)
			// 		}
			// 	}
			// 	setOkay(true)
			// },
		}
	)

	const resultList =
		orgs?.data && orgs?.isSuccess
			? orgs.data.map((result) => {
					return <ResultCard key={result.id} result={result} />
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

export const getServerSideProps: GetServerSideProps<{}, RoutedQuery<'/search/[...params]'>> = async ({
	locale,
	query,
}) => {
	const urlParams = ParamSchema.safeParse(query.params)

	const [_searchType, lon, lat, dist, unit] = ParamSchema.parse(query.params)

	const ssg = await trpcServerClient()

	await ssg.organization.searchDistance.prefetch({ lat, lon, dist, unit })

	const props = {
		trpcState: ssg.dehydrate(),
		...(await serverSideTranslations(locale ?? 'en', undefined, i18nextConfig)),
	}

	return {
		props,
	}
}

export default SearchResults
