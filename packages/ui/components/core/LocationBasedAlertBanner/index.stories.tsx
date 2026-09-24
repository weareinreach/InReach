import { type Meta, type StoryObj } from '@storybook/nextjs'

import * as PrismaEnums from '@weareinreach/db/enums'
import { getTRPCMock } from '~ui/lib/getTrpcMock'
import { component } from '~ui/mockData/component'

import { LocationBasedAlertBanner, type LocationBasedAlertBannerProps } from './index'

const RenderWrapper = ({ lat, lon, type }: LocationBasedAlertBannerProps) => {
	return (
		<div style={{ marginTop: '4rem' }}>
			<LocationBasedAlertBanner lat={lat} lon={lon} type={type} />
		</div>
	)
}

/**
 * A single-alert mock, scoped per-story via that story's own `beforeEach` - the shared
 * `component.LocationBasedAlertBanner` mock (mockData/component.ts) always returns every mock alert
 * regardless of `lat`/`lon` (there's no real per-request filtering in it), so without this, every story below
 * would show all three PRIMARY-level alerts stacked together instead of just the one its name implies.
 */
const singleAlertMock = (
	level: (typeof PrismaEnums.LocationAlertLevel)[keyof typeof PrismaEnums.LocationAlertLevel]
) =>
	getTRPCMock({
		path: ['component', 'LocationBasedAlertBanner'],
		type: 'query',
		response: async () => {
			const { default: data } = await import('../../../mockData/json/component.LocationBasedAlertBanner.json')
			const match = data.find((alert) => alert.level === level)
			if (!match) {
				throw new Error(`No mock alert with level ${level}`)
			}
			return [
				{
					...match,
					level: PrismaEnums.LocationAlertLevel[match.level as keyof typeof PrismaEnums.LocationAlertLevel],
				},
			]
		},
	})

export default {
	title: 'Design System/Location Based Alert Banner',
	component: RenderWrapper,

	beforeEach({ msw }) {
		msw.use(component.LocationBasedAlertBanner)
	},

	parameters: {
		layout: 'fullscreen',
	},
} satisfies Meta<typeof RenderWrapper>

type StoryDef = StoryObj<typeof RenderWrapper>

/**
 * `type` was missing from every story's args here before this - `RenderWrapper`'s `type` prop was
 * `undefined`, and the component's own filter (`alertProps.level.toLowerCase().endsWith(type)`) coerced that
 * to the string "undefined", which never matches any alert's level suffix. All three stories rendered zero
 * alert boxes despite their names implying otherwise - a story that looks like coverage but isn't. See
 * docs/Testing/search-test-inventory.md §14.
 */
export const Statewide = {
	args: {
		lat: 1,
		lon: 1,
		type: 'primary',
	},
	beforeEach({ msw }) {
		msw.use(singleAlertMock(PrismaEnums.LocationAlertLevel.INFO_PRIMARY))
	},
} satisfies StoryDef

export const CountyLevel = {
	args: {
		lat: 2,
		lon: 2,
		type: 'primary',
	},
	beforeEach({ msw }) {
		msw.use(singleAlertMock(PrismaEnums.LocationAlertLevel.WARN_PRIMARY))
	},
} satisfies StoryDef

export const Nationwide = {
	args: {
		lat: 3,
		lon: 3,
		type: 'primary',
	},
	beforeEach({ msw }) {
		msw.use(singleAlertMock(PrismaEnums.LocationAlertLevel.CRITICAL_PRIMARY))
	},
} satisfies StoryDef

/**
 * No `*_SECONDARY`-level mock alert existed at all before this (mockData/json/
 * component.LocationBasedAlertBanner.json had only `*_PRIMARY` entries) - added three
 * (INFO/WARN/CRITICAL_SECONDARY) so this state, and its own container/margin/color CSS
 * (`.secondaryContainer`/`.secondary[data-alert-level=...]`), has any coverage at all. See
 * docs/Testing/search-test-inventory.md §14, case 14.9.
 */
export const SecondaryLevel = {
	args: {
		lat: 4,
		lon: 4,
		type: 'secondary',
	},
	beforeEach({ msw }) {
		msw.use(singleAlertMock(PrismaEnums.LocationAlertLevel.WARN_SECONDARY))
	},
} satisfies StoryDef
