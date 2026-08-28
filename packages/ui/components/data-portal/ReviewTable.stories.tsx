import { type Meta, type StoryObj } from '@storybook/nextjs'
import { DateTime } from 'luxon'
import { http, HttpResponse } from 'msw'

import { ReviewTable } from './ReviewTable'

const mockReviews = [
	{
		id: 'review_1',
		rating: 4,
		reviewText: 'Great help and very professional staff.',
		visible: true,
		deleted: false,
		createdAt: DateTime.now().minus({ days: 1 }).toJSDate(),
		updatedAt: DateTime.now().minus({ days: 1 }).toJSDate(),
		organization: { id: 'org_1', name: 'Fresh Start Housing', slug: 'fresh-start' },
		orgService: {
			id: 'svc_1',
			serviceName: {
				key: 'svc_emergency_shelter',
				ns: 'common',
				tsKey: { text: 'Emergency Shelter' },
			},
		},
		user: { id: 'u1', name: 'John Doe', email: 'john@example.com' },
	},
	{
		id: 'review_2',
		rating: 2,
		reviewText: 'Waiting time was a bit too long.',
		visible: false,
		deleted: false,
		createdAt: DateTime.now().minus({ days: 3 }).toJSDate(),
		updatedAt: DateTime.now().minus({ days: 3 }).toJSDate(),
		organization: { id: 'org_1', name: 'Fresh Start Housing', slug: 'fresh-start' },
		orgService: {
			id: 'svc_1',
			serviceName: {
				key: 'svc_emergency_shelter',
				ns: 'common',
				tsKey: { text: 'Emergency Shelter' },
			},
		},
		user: { id: 'u3', name: 'Alice Johnson', email: 'alice@example.com' },
	},
	{
		id: 'review_3',
		rating: 1,
		reviewText: 'This place is closed and did not help.',
		visible: false,
		deleted: true,
		createdAt: DateTime.now().minus({ days: 5 }).toJSDate(),
		updatedAt: DateTime.now().minus({ days: 5 }).toJSDate(),
		organization: { id: 'org_2', name: 'Community Clinic', slug: 'community-clinic' },
		orgService: null,
		user: { id: 'u2', name: 'Jane Smith', email: 'jane@example.com' },
	},
]

export default {
	title: 'Data Portal/Tables/Reviews',
	component: ReviewTable,

	beforeEach({ msw }) {
		msw.use(
			http.get('*/trpc/review.forReviewTable*', () => {
				return HttpResponse.json([
					{
						result: {
							data: {
								json: { results: mockReviews, total: mockReviews.length },
							},
						},
					},
				])
			}),
			http.post('*/trpc/review.hide*', () => {
				return HttpResponse.json([
					{
						result: {
							data: {
								json: { id: 'review_1', visible: false },
							},
						},
					},
				])
			}),
			http.post('*/trpc/review.unHide*', () => {
				return HttpResponse.json([
					{
						result: {
							data: {
								json: { id: 'review_2', visible: true },
							},
						},
					},
				])
			}),
			http.post('*/trpc/review.delete*', () => {
				return HttpResponse.json([
					{
						result: {
							data: {
								json: { id: 'review_1', deleted: true },
							},
						},
					},
				])
			}),
			http.post('*/trpc/review.unDelete*', () => {
				return HttpResponse.json([
					{
						result: {
							data: {
								json: { id: 'review_3', deleted: false },
							},
						},
					},
				])
			})
		)
	},

	parameters: {
		layoutWrapper: 'centeredFullscreen',

		nextjs: {
			router: {
				// @ts-expect-error - isReady is used by Next.js Storybook addon but missing in BaseRouter types
				isReady: true,
			},
		},

		rqDevtools: true,
	},
} satisfies Meta<typeof ReviewTable>

type StoryDef = StoryObj<typeof ReviewTable>

export const Default = {} satisfies StoryDef
