import { type Meta, type StoryObj } from '@storybook/nextjs'
import { DateTime } from 'luxon'
import { http, HttpResponse } from 'msw'

import { ReportIssueType, ReportStatus } from '@weareinreach/db/enums'

import { ReportTable } from './ReportTable'

const mockReports = [
	{
		id: 'report_1',
		organizationId: 'org_1',
		orgNameSnapshot: 'Fresh Start Housing',
		serviceId: 'svc_1',
		serviceNameSnapshot: 'Emergency Shelter',
		issueType: ReportIssueType.INCORRECT_INFO,
		status: ReportStatus.PENDING,
		informed: false,
		userEmail: 'user@example.com',
		userName: 'Test User',
		userNote: 'The phone number is wrong. It should be 555-0199.',
		incorrectFields: ['contact-info'],
		internalNotes: [],
		language: null,
		createdAt: DateTime.now().minus({ hours: 2 }).toJSDate(),
		updatedAt: DateTime.now().minus({ hours: 2 }).toJSDate(),
		organization: { slug: 'fresh-start' },
		reportedBy: { id: 'u1', name: 'Test User' },
		handledBy: null,
	},
	{
		id: 'report_2',
		organizationId: 'org_2',
		orgNameSnapshot: 'Community Clinic',
		serviceId: null,
		serviceNameSnapshot: null,
		issueType: ReportIssueType.CLOSED_INACTIVE,
		status: ReportStatus.PENDING,
		informed: false,
		userEmail: 'anon@example.com',
		userName: 'Anonymous',
		userNote: 'This place closed down last month.',
		incorrectFields: [],
		internalNotes: [],
		language: null,
		createdAt: DateTime.now().minus({ days: 5 }).toJSDate(),
		updatedAt: DateTime.now().minus({ days: 5 }).toJSDate(),
		organization: { slug: 'community-clinic' },
		reportedBy: null,
		handledBy: null,
	},
]

export default {
	title: 'Data Portal/Tables/Reports',
	component: ReportTable,

	beforeEach({ msw }) {
		msw.use(
			http.get('*/trpc/report.forReportsTable*', () => {
				return HttpResponse.json([
					{
						result: {
							data: {
								json: { results: mockReports, total: mockReports.length },
							},
						},
					},
				])
			}),
			http.post('*/trpc/report.update*', () => {
				return HttpResponse.json([
					{
						result: {
							data: {
								json: { id: 'report_1', status: ReportStatus.RESOLVED },
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
				// @ts-expect-error - isReady is used by the Next.js Storybook addon but missing in BaseRouter types
				isReady: true,
			},
		},

		rqDevtools: true,
	},
} satisfies Meta<typeof ReportTable>

type StoryDef = StoryObj<typeof ReportTable>

export const Default = {} satisfies StoryDef

export const DeepLinkOpen = {
	parameters: {
		nextjs: {
			router: {
				// @ts-expect-error - isReady is used by the Next.js Storybook addon but missing in BaseRouter types
				isReady: true,
				query: {
					reportId: 'report_1',
				},
			},
		},
	},
} satisfies StoryDef
