import { PortableText } from '@portabletext/react'
import * as Sentry from '@sentry/nextjs'
import { groq } from 'next-sanity'

import { GetStaticPaths, GetStaticProps, InferGetStaticPropsType } from 'next'

import type { ReactElement } from 'react'

import { Blocks } from '@inreach/ui/components/web'
import { WebLayout } from '@inreach/ui/layouts'

import navData from '../../data/nav.json'
import { getClient } from '../../lib/sanity.server'
import { heroCarouselFragment } from '../../sanity/schemas/objects'
import { getSlugVariations, slugParamToPath } from '../utils/url'
import type { NextPageWithLayout } from './_app'

const PageTemplate: NextPageWithLayout = (props: InferGetStaticPropsType<typeof getStaticProps>) => {
	const { data } = props
	return (
		<>
			<Blocks />
		</>
	)
}

PageTemplate.getLayout = (page: ReactElement) => {
	return <WebLayout navData={navData}>{page}</WebLayout>
}

const pageQuery = groq`
*[_id == $pageId] {
  ...,
	content[] {
		...,
		${heroCarouselFragment}
	}
}
`

const getPageId = groq`
*[_type == "route" && slug.current in $possibleSlugs][0] {
  page {
    _ref
  }
}
`

export const getStaticProps: GetStaticProps = async ({ params, preview = false }) => {
	const slug = slugParamToPath(params?.slug)

	const possibleSlugs = getSlugVariations(slug)
	const pageId = await getClient(preview)
		.fetch(getPageId, { possibleSlugs })
		.then((res) => res.page._ref)
	const page = await getClient(preview).fetch(pageQuery, { pageId })
	console.log('gsprops', slug, JSON.stringify(page, null, 2), preview, params)

	return {
		props: {
			preview,
			data: { page },
		},
	}
}

const pathsQuery = groq`*[_type == "route"][].slug.current`

export const getStaticPaths: GetStaticPaths = async () => {
	const pathResult = await getClient().fetch(pathsQuery)
	const paths = pathResult.map((slug: string) => ({
		params: { slug: slug.split('/').filter((x) => x) },
	}))

	return {
		paths,
		fallback: 'blocking',
	}
}

export default PageTemplate
