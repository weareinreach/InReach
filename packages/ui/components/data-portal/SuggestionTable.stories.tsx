import { type Meta, type StoryObj } from '@storybook/react'
import { DateTime } from 'luxon'
import { http, HttpResponse } from 'msw'

import { SuggestionTable } from './SuggestionTable'

const mockSuggestions = [
	{
		id: 'sugg_1',
		text: 'It would be great to see swimming lane availability schedules directly on the site dashboard instead of digging through PDFs.',
		handled: false,
		createdAt: DateTime.now().minus({ days: 1 }).toJSDate(),
		updatedAt: DateTime.now().minus({ days: 1 }).toJSDate(),
		organization: { id: 'org_1', name: 'Camden Community Center', slug: 'camden-community' },
		user: { id: 'u1', name: 'John Doe', email: 'john@example.com' },
	},
	{
		id: 'sugg_2',
		text: 'Add a dark mode toggle option for nighttime navigation, please!',
		handled: true,
		createdAt: DateTime.now().minus({ days: 4 }).toJSDate(),
		updatedAt: DateTime.now().minus({ days: 2 }).toJSDate(),
		organization: null, // Global or non-org specific suggestion
		user: { id: 'u2', name: 'Alice Johnson', email: 'alice@example.com' },
	},
	{
		id: 'sugg_3',
		text: 'The phone number listed on the profile header is missing an extension digit.',
		handled: false,
		createdAt: DateTime.now().minus({ days: 7 }).toJSDate(),
		updatedAt: DateTime.now().minus({ days: 7 }).toJSDate(),
		organization: { id: 'org_2', name: 'Fresh Start Housing', slug: 'fresh-start' },
		user: null, // Anonymous suggestion submissions
	},
]

export default {
	title: 'Data Portal/Tables/Suggestions',
	component: SuggestionTable,
	parameters: {
		layoutWrapper: 'centeredFullscreen',
		nextjs: {
			router: {
				// @ts-expect-error - isReady is used by Next.js Storybook addon but missing in BaseRouter types
				isReady: true,
			},
		},
		msw: {
			handlers: [
				// Intercept the tRPC Query to populate your table layout
				http.get('*/trpc/suggestion.forSuggestionTable*', () => {
					return HttpResponse.json([
						{
							result: {
								data: {
									json: mockSuggestions,
								},
							},
						},
					])
				}),
				// Intercept the toggle mutation handler operation
				http.post('*/trpc/suggestion.toggleHandled*', async ({ request }) => {
					// Extracts the request URL parameters or payload safely if needed for updates
					const url = new URL(request.url)
					const idParam = url.searchParams.get('id') || 'sugg_1'

					return HttpResponse.json([
						{
							result: {
								data: {
									json: { id: idParam, handled: true },
								},
							},
						},
					])
				}),
			],
		},
		rqDevtools: true,
	},
} satisfies Meta<typeof SuggestionTable>

type StoryDef = StoryObj<typeof SuggestionTable>

export const Default = {} satisfies StoryDef
