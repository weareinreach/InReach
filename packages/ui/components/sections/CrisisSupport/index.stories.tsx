import { type Meta, type StoryObj } from '@storybook/react'

import { trpc } from '~ui/lib/trpcClient'
import { organization } from '~ui/mockData/organization'

import { CrisisSupport } from './index'

export default {
	title: 'Sections/Crisis Support',
	component: CrisisSupport,
	parameters: {
		layoutWrapper: 'gridDouble',
		msw: [organization.getIntlCrisis, organization.getNatlCrisis],
	},
} satisfies Meta<typeof CrisisSupport>

export const InternationalContainer = {
	render: () => {
		const { data } = trpc.organization.getIntlCrisis.useQuery({ cca2: '' })

		return (
			<CrisisSupport role='international'>
				{data?.map((item) => (
					<CrisisSupport.International data={item} key={item.id} />
				))}
			</CrisisSupport>
		)
	},
} satisfies StoryObj<typeof CrisisSupport>
export const InternationalOrgCard = {
	render: () => {
		const { data } = trpc.organization.getIntlCrisis.useQuery({ cca2: '' })
		const item = data?.at(0)

		if (!item) return <>Loading...</>

		return <CrisisSupport.International data={item} />
	},
} satisfies StoryObj<typeof CrisisSupport.International>

export const NationalContainer = {
	render: () => {
		const { data } = trpc.organization.getNatlCrisis.useQuery({ cca2: '' })
		return (
			<CrisisSupport role='national'>
				{data?.map((item) => (
					<CrisisSupport.National data={item} key={item.id} />
				))}
			</CrisisSupport>
		)
	},
} satisfies StoryObj<typeof CrisisSupport>

export const NationalOrgCard = {
	render: () => {
		const { data } = trpc.organization.getNatlCrisis.useQuery({ cca2: '' })
		const item = data?.at(0)

		if (!item) return <>Loading...</>

		return <CrisisSupport.National data={item} />
	},
} satisfies StoryObj<typeof CrisisSupport.National>
