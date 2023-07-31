import { type Meta, type StoryObj } from '@storybook/react'

import { organizationData } from '~ui/mockData/organization'

import { CrisisSupport } from './index'

/**
 * Throws an error - Use to raise an error for nullish-coalesced values
 *
 * @example FnThatDoesntAcceptUndefined(possibleUndefined ?? raise('this is the error'))
 */
const raise = (err: string): never => {
	throw new Error(err)
}
export default {
	title: 'Sections/Crisis Support',
	component: CrisisSupport,
	parameters: {
		layoutWrapper: 'gridDouble',
	},
} satisfies Meta<typeof CrisisSupport>

export const InternationalContainer = {
	args: {
		role: 'international',
		children: organizationData.getIntlCrisis.map((item) => (
			<CrisisSupport.International data={item} key={item.id} />
		)),
	},
} satisfies StoryObj<typeof CrisisSupport>
export const InternationalOrgCard = {
	args: {
		data: organizationData.getIntlCrisis[0],
	},
	render: (args) => <CrisisSupport.International {...args} />,
} satisfies StoryObj<typeof CrisisSupport.International>

export const NationalContainer = {
	args: {
		role: 'national',
		children: organizationData.getNatlCrisis.map((item) => (
			<CrisisSupport.National data={item} key={item.id} />
		)),
	},
} satisfies StoryObj<typeof CrisisSupport>

export const NationalOrgCard = {
	args: {
		data: organizationData.getNatlCrisis[0],
	},
	render: (args) => <CrisisSupport.National {...args} />,
} satisfies StoryObj<typeof CrisisSupport.National>
