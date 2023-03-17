import { type ApiOutput } from '@weareinreach/api'

export const mockServiceData = {
	serviceName: {
		key: 'larkin-street-youth-services.osvc_01GVDMX95RZDJV2ZYKGQADY30D.name',
		ns: 'org-data',
		tsKey: {
			text: 'Get education and employment services for youth ages 24 and under',
		},
	},
	services: [
		{
			tag: {
				defaultAttributes: [],
				category: {
					tsKey: 'education-and-employment.CATEGORYNAME',
					tsNs: 'services',
				},
				tsKey: 'education-and-employment.career-counseling',
				tsNs: 'services',
				active: true,
			},
		},
	],
	serviceAreas: [
		{
			countries: [],
			districts: [
				{
					govDist: {
						id: 'gdst_01GVDMWGFBETETNV61RXMF493H',
						name: 'California',
						slug: 'us-california',
						iso: 'US-CA',
						abbrev: 'CA',
						country: {
							cca2: 'US',
							cca3: 'USA',
							id: 'ctry_01GVDMWD2WTDVEMWA4WCXM50MH',
							name: 'United States',
							dialCode: null,
							flag: '🇺🇸',
							tsKey: 'USA.name',
							tsNs: 'country',
							demonymKey: 'USA.demonym',
							demonymNs: 'country',
						},
						govDistType: {
							tsKey: 'type-state',
							tsNs: 'gov-dist',
						},
						isPrimary: true,
						tsKey: 'us-california',
						tsNs: 'gov-dist',
						parent: null,
					},
				},
				{
					govDist: {
						id: 'gdst_01GVDMWGGVH6GP35FXD3GB7E4P',
						name: 'San Francisco',
						slug: 'us-california-san-francisco-county',
						iso: null,
						abbrev: null,
						country: {
							cca2: 'US',
							cca3: 'USA',
							id: 'ctry_01GVDMWD2WTDVEMWA4WCXM50MH',
							name: 'United States',
							dialCode: null,
							flag: '🇺🇸',
							tsKey: 'USA.name',
							tsNs: 'country',
							demonymKey: 'USA.demonym',
							demonymNs: 'country',
						},
						govDistType: {
							tsKey: 'type-county',
							tsNs: 'gov-dist',
						},
						isPrimary: false,
						tsKey: 'us-california-san-francisco-county',
						tsNs: 'gov-dist',
						parent: {
							id: 'gdst_01GVDMWGFBETETNV61RXMF493H',
							name: 'California',
							slug: 'us-california',
							iso: 'US-CA',
							abbrev: 'CA',
							country: {
								cca2: 'US',
								cca3: 'USA',
								id: 'ctry_01GVDMWD2WTDVEMWA4WCXM50MH',
								name: 'United States',
								dialCode: null,
								flag: '🇺🇸',
								tsKey: 'USA.name',
								tsNs: 'country',
								demonymKey: 'USA.demonym',
								demonymNs: 'country',
							},
							govDistType: {
								tsKey: 'type-state',
								tsNs: 'gov-dist',
							},
							isPrimary: true,
							tsKey: 'us-california',
							tsNs: 'gov-dist',
						},
					},
				},
			],
		},
	],
	hours: [
		{
			start: new Date('2023-03-13T08:30:00'),
			end: new Date('2023-03-13T12:30:00'),
			dayIndex: 1,
			closed: false,
		},
		{
			start: new Date('2023-03-13T14:30:00'),
			end: new Date('2023-03-13T18:30:00'),
			dayIndex: 1,
			closed: false,
		},
		{
			start: new Date(2023, 3, 14),
			end: new Date(2023, 3, 14),
			dayIndex: 2,
			closed: false,
		},
		{
			start: new Date(2023, 3, 15),
			end: new Date(2023, 3, 15),
			dayIndex: 3,
			closed: false,
		},
		{
			start: new Date(2023, 3, 16),
			end: new Date(2023, 3, 16),
			dayIndex: 4,
			closed: false,
		},
		{
			start: new Date(2023, 3, 17),
			end: new Date(2023, 3, 17),
			dayIndex: 5,
			closed: false,
		},
		{
			start: new Date(),
			end: new Date(),
			dayIndex: 6,
			closed: true,
		},
		{
			start: new Date(),
			end: new Date(),
			dayIndex: 7,
			closed: true,
		},
	],
	reviews: [],
	attributes: [
		{
			attribute: {
				tsKey: 'community.homeless',
				tsNs: 'attribute',
				icon: null,
				iconBg: null,
				showOnLocation: null,
				categories: [
					{
						category: {
							tag: 'community',
							icon: null,
						},
					},
				],
			},
			supplement: [],
		},
		{
			attribute: {
				tsKey: 'community.lgbtq-youth',
				tsNs: 'attribute',
				icon: null,
				iconBg: null,
				showOnLocation: null,
				categories: [
					{
						category: {
							tag: 'community',
							icon: null,
						},
					},
				],
			},
			supplement: [],
		},
		{
			attribute: {
				tsKey: 'community.teens',
				tsNs: 'attribute',
				icon: null,
				iconBg: null,
				showOnLocation: null,
				categories: [
					{
						category: {
							tag: 'community',
							icon: null,
						},
					},
				],
			},
			supplement: [],
		},
		{
			attribute: {
				tsKey: 'additional.at-capacity',
				tsNs: 'attribute',
				icon: null,
				iconBg: null,
				showOnLocation: null,
				categories: [
					{
						category: {
							tag: 'community',
							icon: null,
						},
					},
				],
			},
			supplement: [],
		},
		{
			attribute: {
				tsKey: 'sys.incompatible-info',
				tsNs: 'attribute',
				icon: null,
				iconBg: null,
				showOnLocation: null,
				categories: [
					{
						category: {
							tag: 'system',
							icon: null,
						},
					},
				],
			},
			supplement: [
				{
					country: null,
					language: null,
					text: null,
					govDist: null,
					boolean: null,
					data: {
						json: [
							{
								'service-city-california-san-francisco': 'true',
							},
							{
								'community-transitional-age-youth': 'true',
							},
							{
								'elig-age-or-under': '24',
							},
							{
								'cost-free': 'true',
							},
							{
								'action-signup-url': 'http://larkinstreetyouth.org/get-help/#section-education-employment',
							},
							{
								'community-lgbt': 'true',
							},
							{
								'elig-age-or-under (value = #)': 'true',
							},
							{
								'has-confidentiality-policy': 'true',
							},
							{
								'time-appointment-required': 'true',
							},
						],
					},
				},
			],
		},
		{
			attribute: {
				tsKey: 'lang.lang-offered',
				tsNs: 'attribute',
				icon: null,
				iconBg: null,
				showOnLocation: null,
				categories: [
					{
						category: {
							tag: 'languages',
							icon: null,
						},
					},
				],
			},
			supplement: [
				{
					country: null,
					language: {
						languageName: 'English',
						nativeName: 'English',
					},
					text: null,
					govDist: null,
					boolean: null,
					data: null,
				},
			],
		},
	],
	phones: [],
	emails: [],
	accessDetails: [
		{
			attributes: [
				{
					attribute: {
						tsKey: 'serviceaccess.accesslocation',
						tsNs: 'attribute',
						icon: null,
						iconBg: null,
						showOnLocation: null,
						categories: [
							{
								category: {
									tag: 'service-access-instructions',
									icon: null,
								},
							},
						],
					},
					supplement: [
						{
							country: null,
							language: null,
							text: {
								ns: 'org-data',
								key: 'larkin-street-youth-services.attribute.atts_01GVDMX95RTFSRBMJC677B3WAB',
							},
							govDist: null,
							boolean: null,
							data: {
								json: {
									_id: {
										$oid: '5e7e4bd9d54f1760921a3aff',
									},
									access_type: 'location',
									access_value: '134 Golden Gate Ave, San Francisco, CA 94102',
									instructions:
										'The above are drop-in service hours for education. Drop-in hours for employment services are Monday, Tuesday: 10 a.m. to noon, and 2:30 to 4:30 p.m. Wednesday: 10 a.m. to noon, and 1 to 2 p.m. Thursday: 10 a.m. to noon, and 1 to 3 p.m. Friday: 10 a.m. to 1 p.m.',
									access_value_ES: '134 Golden Gate Ave, San Francisco, CA 94102',
									instructions_ES: 'Visita para más información.',
								},
							},
						},
					],
				},
			],
		},
		{
			attributes: [
				{
					attribute: {
						tsKey: 'serviceaccess.accessphone',
						tsNs: 'attribute',
						icon: null,
						iconBg: null,
						showOnLocation: null,
						categories: [
							{
								category: {
									tag: 'service-access-instructions',
									icon: null,
								},
							},
						],
					},
					supplement: [
						{
							country: null,
							language: null,
							text: {
								ns: 'org-data',
								key: 'larkin-street-youth-services.attribute.atts_01GVDMX95R2GVT18RP93MEQJSH',
							},
							govDist: null,
							boolean: null,
							data: {
								json: {
									_id: {
										$oid: '5e7e4bd9d54f1760921a3b00',
									},
									access_type: 'phone',
									access_value: '415-673-0911',
									instructions: 'Call for more information.',
									access_value_ES: '415-673-0911',
									instructions_ES: 'Llama para más información.',
								},
							},
						},
					],
				},
			],
		},
	],
	locations: [
		{
			location: {
				name: 'Larkin Street Youth Services - Administration Office',
				street1: '134 Golden Gate Avenue',
				street2: '',
				city: 'San Francisco',
				postCode: '94109',
				primary: true,
				govDist: {
					id: 'gdst_01GVDMWGFBETETNV61RXMF493H',
					name: 'California',
					slug: 'us-california',
					iso: 'US-CA',
					abbrev: 'CA',
					country: {
						cca2: 'US',
						cca3: 'USA',
						id: 'ctry_01GVDMWD2WTDVEMWA4WCXM50MH',
						name: 'United States',
						dialCode: null,
						flag: '🇺🇸',
						tsKey: 'USA.name',
						tsNs: 'country',
						demonymKey: 'USA.demonym',
						demonymNs: 'country',
					},
					govDistType: {
						tsKey: 'type-state',
						tsNs: 'gov-dist',
					},
					isPrimary: true,
					tsKey: 'us-california',
					tsNs: 'gov-dist',
					parent: null,
				},
				country: {
					cca2: 'US',
					cca3: 'USA',
					id: 'ctry_01GVDMWD2WTDVEMWA4WCXM50MH',
					name: 'United States',
					dialCode: null,
					flag: '🇺🇸',
					tsKey: 'USA.name',
					tsNs: 'country',
					demonymKey: 'USA.demonym',
					demonymNs: 'country',
				},
				longitude: -122.413,
				latitude: 37.782,
			},
		},
	],
	id: 'osvc_01GVDMX95RZDJV2ZYKGQADY30D',
	createdAt: new Date('2020-03-27T18:54:17.534Z'),
	updatedAt: new Date('2022-10-25T11:28:34.601Z'),
	description: {
		key: 'larkin-street-youth-services.osvc_01GVDMX95RZDJV2ZYKGQADY30D.description',
		ns: 'org-data',
		tsKey: {
			text: 'Larkin Street Academy Services offers job readiness, college readiness, computer classes, job placement and retention, internships, tutoring, GED tutoring and classes, secondary and post-secondary school enrollment and support, mindfulness, visual and performing arts. Offices are open Monday through Thursday, 9:00 AM - 16:00 PM, appointments only.',
		},
	},
} satisfies ApiOutput['service']['byId']
