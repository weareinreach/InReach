import { type Meta, type StoryObj } from '@storybook/nextjs'

import { StorybookGridDouble } from '~ui/layouts'
import { trpc } from '~ui/lib/trpcClient'
import { organization } from '~ui/mockData/organization'

import { SearchResultCard } from './SearchResultCard'

export default {
	title: 'Design System/Search Results',
	component: SearchResultCard,
	decorators: [StorybookGridDouble],
	parameters: {
		layout: 'fullscreen',
	},
	argTypes: {
		loading: {
			type: 'boolean',
		},
	},
} satisfies Meta<typeof SearchResultCard>

type StoryDef = StoryObj<typeof SearchResultCard>

export const SingleResult = {
	beforeEach({ msw }) {
		msw.use(organization.searchDistance)
	},

	render: () => {
		const { data } = trpc.organization.searchDistance.useQuery({
			dist: 0,
			lat: 0,
			lon: 0,
			unit: 'mi',
			skip: 0,
			take: 0,
		})
		if (!data) {
			return <>Loading mock data</>
		}
		const item = data.orgs.at(0)
		if (!item) {
			return <>Something is wrong with the mock data</>
		}
		return <SearchResultCard result={item} index={0} />
	},
} satisfies StoryDef
export const SingleResultWithLongName = {
	beforeEach({ msw }) {
		msw.use(organization.searchDistanceLongTitle)
	},

	render: () => {
		const { data } = trpc.organization.searchDistance.useQuery({
			dist: 0,
			lat: 0,
			lon: 0,
			unit: 'mi',
			skip: 0,
			take: 0,
		})
		if (!data) {
			return <>Loading mock data</>
		}
		const item = data.orgs.at(0)
		if (!item) {
			return <>Something is wrong with the mock data</>
		}
		return <SearchResultCard result={item} index={0} />
	},
} satisfies StoryDef

export const MultipleResults = {
	beforeEach({ msw }) {
		msw.use(organization.searchDistance)
	},

	render: () => {
		const { data } = trpc.organization.searchDistance.useQuery({
			dist: 0,
			lat: 0,
			lon: 0,
			unit: 'mi',
			skip: 0,
			take: 0,
		})
		if (!data) {
			return <>Loading mock data</>
		}
		const item = data.orgs.at(0)
		if (!item) {
			return <>Something is wrong with the mock data</>
		}
		return (
			<>
				{data.orgs.map((result) => (
					<SearchResultCard key={result.id} result={result} index={0} />
				))}
			</>
		)
	},
} satisfies StoryDef
export const SingleLoading = {
	args: {
		loading: true,
	},
} satisfies StoryDef
