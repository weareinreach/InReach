import { type Meta, type StoryObj } from '@storybook/react'

import { trpc as api } from '~ui/lib/trpcClient'
import { component } from '~ui/mockData/component'

import { LocationBasedAlertBanner, type LocationBasedAlertBannerProps } from './index'

const RenderWrapper = ({ lat, lon, type }: LocationBasedAlertBannerProps) => {
	return (
		<div style={{ marginTop: '4rem' }}>
			<LocationBasedAlertBanner lat={lat} lon={lon} type={type} />
		</div>
	)
}

export default {
	title: 'Design System/Location Based Alert Banner',
	component: RenderWrapper,
	parameters: {
		msw: [component.LocationBasedAlertBanner],
		layout: 'fullscreen',
	},
} satisfies Meta<typeof RenderWrapper>

type StoryDef = StoryObj<typeof RenderWrapper>

export const Statewide = {
	args: {
		// i18nKey: 'alerts.search-page-legislative-map',
		// ns: 'common',
		lat: 1,
		lon: 1,
	},
} satisfies StoryDef
export const CountyLevel = {
	args: {
		lat: 2,
		lon: 2,
	},
} satisfies StoryDef
export const Nationwide = {
	args: {
		lat: 3,
		lon: 3,
	},
} satisfies StoryDef
