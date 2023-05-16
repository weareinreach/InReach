import { getTRPCMock } from '~ui/lib/getTrpcMock'

export const orgEmail = {
	get: getTRPCMock({
		path: ['orgEmail', 'get'],
		response: [
			{
				id: 'oeml_01GVH3VEVDX7QVQ4QA4C1XXVN3',
				firstName: null,
				lastName: null,
				primary: false,
				email: 'contact-legal@whitman-walker.org',
				published: true,
				deleted: false,
				description: 'Legal Services Program',
				locations: [],
				organization: [
					{
						id: 'orgn_01GVH3V408N0YS7CDYAH3F2BMH',
						name: 'Whitman-Walker Health',
						slug: 'whitman-walker-health',
					},
				],
				title: null,
				services: [
					{
						id: 'osvc_01GVH3VEVZY7K2TYY1ZE7WXRRC',
						serviceName: 'Get legal help with immigration services',
					},
					{
						id: 'osvc_01GVH3VEWD5ZQY1JZM16Y5M9NG',
						serviceName:
							'Get legal help for transgender people to replace and update name/gender marker on immigration documents',
					},
				],
			},
			{
				id: 'oeml_01GVH3VEVD5Q45WH8V1KK13EZ8',
				firstName: null,
				lastName: null,
				primary: false,
				email: 'Transhealth@whitman-walker.org',
				published: true,
				deleted: false,
				description: 'Gender Affirming Services',
				locations: [],
				organization: [
					{
						id: 'orgn_01GVH3V408N0YS7CDYAH3F2BMH',
						name: 'Whitman-Walker Health',
						slug: 'whitman-walker-health',
					},
				],
				title: null,
				services: [
					{
						id: 'osvc_01GVH3VEVR4SRPFQD2SJF1MCJJ',
						serviceName: 'Receive gender affirming care and services',
					},
					{
						id: 'osvc_01GVH3VEWHDC6F5FCQHB0H5GD6',
						serviceName: 'Get gender affirming hormone therapy',
					},
				],
			},
			{
				id: 'oeml_01GVH3VEVD2HF0GFPPTHJA9AJT',
				firstName: null,
				lastName: null,
				primary: false,
				email: 'youthmentalhealth@whitman-walker.org',
				published: true,
				deleted: false,
				description: 'Youth Mental Health Services',
				locations: [],
				organization: [
					{
						id: 'orgn_01GVH3V408N0YS7CDYAH3F2BMH',
						name: 'Whitman-Walker Health',
						slug: 'whitman-walker-health',
					},
				],
				title: null,
				services: [
					{
						id: 'osvc_01GVH3VEVY24KAYTWY2ZSFZNBX',
						serviceName: 'Get free individual and group psychotherapy for LGBTQ young people (ages 13-24)',
					},
				],
			},
			{
				id: 'oeml_01GVH3VEVDZK28VPR8ETDTVX2V',
				firstName: null,
				lastName: null,
				primary: true,
				email: 'appointments@whitman-walker.org',
				published: true,
				deleted: false,
				description: 'Schedule An Appointment',
				locations: [],
				organization: [
					{
						id: 'orgn_01GVH3V408N0YS7CDYAH3F2BMH',
						name: 'Whitman-Walker Health',
						slug: 'whitman-walker-health',
					},
				],
				title: null,
				services: [
					{
						id: 'osvc_01GVH3VEW2ND36DB0XWAH1PQY0',
						serviceName: 'Get dental health services for HIV-positive individuals',
					},
				],
			},
		],
	}),
	upsertMany: getTRPCMock({
		path: ['orgEmail', 'upsertMany'],
		type: 'mutation',
		response: (input) => [],
	}),
}
