import { type ApiOutput } from '@weareinreach/api'

export const mockServiceData = {
	serviceName: {
		key: 'larkin-street-youth-services.osvc_01GVH3VDMSN34BACQDMY6S5GPM.name',
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
						id: 'gdst_01GVXZM7HZ4YR0DNSYHST80GXS',
						name: 'California',
						slug: 'us-california',
						iso: 'US-CA',
						abbrev: 'CA',
						country: {
							cca2: 'US',
							cca3: 'USA',
							id: 'ctry_01GVXZJT2JD3E5HN892PH78C2C',
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
						id: 'gdst_01GVXZM7KJEJ4JAZ9T3BB8TAKP',
						name: 'San Francisco',
						slug: 'us-california-san-francisco-county',
						iso: null,
						abbrev: null,
						country: {
							cca2: 'US',
							cca3: 'USA',
							id: 'ctry_01GVXZJT2JD3E5HN892PH78C2C',
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
							id: 'gdst_01GVXZM7HZ4YR0DNSYHST80GXS',
							name: 'California',
							slug: 'us-california',
							iso: 'US-CA',
							abbrev: 'CA',
							country: {
								cca2: 'US',
								cca3: 'USA',
								id: 'ctry_01GVXZJT2JD3E5HN892PH78C2C',
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
	hours: [],
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
								key: 'larkin-street-youth-services.attribute.atts_01GVXZN9E07W1E9QB5XTFC7Z5W',
								ns: 'org-data',
								tsKey: {
									text: 'The above are drop-in service hours for education. Drop-in hours for employment services are Monday, Tuesday: 10 a.m. to noon, and 2:30 to 4:30 p.m. Wednesday: 10 a.m. to noon, and 1 to 2 p.m. Thursday: 10 a.m. to noon, and 1 to 3 p.m. Friday: 10 a.m. to 1 p.m.',
								},
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
								key: 'larkin-street-youth-services.attribute.atts_01GVXZN9E1GH84KYBBE383GYN0',
								ns: 'org-data',
								tsKey: {
									text: 'Call for more information.',
								},
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
					id: 'gdst_01GVXZM7HZ4YR0DNSYHST80GXS',
					name: 'California',
					slug: 'us-california',
					iso: 'US-CA',
					abbrev: 'CA',
					country: {
						cca2: 'US',
						cca3: 'USA',
						id: 'ctry_01GVXZJT2JD3E5HN892PH78C2C',
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
					id: 'ctry_01GVXZJT2JD3E5HN892PH78C2C',
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
	id: 'osvc_01GVH3VDMSN34BACQDMY6S5GPM',
	createdAt: new Date('2020-03-27T18:54:17.534Z'),
	updatedAt: new Date('2022-10-25T11:28:34.601Z'),
	description: {
		key: 'larkin-street-youth-services.osvc_01GVH3VDMSN34BACQDMY6S5GPM.description',
		ns: 'org-data',
		tsKey: {
			text: 'Larkin Street Academy Services offers job readiness, college readiness, computer classes, job placement and retention, internships, tutoring, GED tutoring and classes, secondary and post-secondary school enrollment and support, mindfulness, visual and performing arts. Offices are open Monday through Thursday, 9:00 AM - 16:00 PM, appointments only.',
		},
	},
} satisfies ApiOutput['service']['byId']
