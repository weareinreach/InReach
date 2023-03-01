import { type ApiOutput } from '@weareinreach/api'

export const mockServiceData = {
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
						id: 'gdst_01GSKV71FAE5WQ4S7CPMCABW1F',
						name: 'California',
						slug: 'us-california',
						iso: 'US-CA',
						abbrev: 'CA',
						country: {
							cca2: 'US',
							cca3: 'USA',
							id: 'ctry_01GSKV6PZ0GFFX5TBZA6AJ3F8T',
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
						id: 'gdst_01GSKV71NACRZEKSRA3RNBWANK',
						name: 'San Francisco',
						slug: 'us-california-san-francisco-county',
						iso: null,
						abbrev: null,
						country: {
							cca2: 'US',
							cca3: 'USA',
							id: 'ctry_01GSKV6PZ0GFFX5TBZA6AJ3F8T',
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
							id: 'gdst_01GSKV71FAE5WQ4S7CPMCABW1F',
							name: 'California',
							slug: 'us-california',
							iso: 'US-CA',
							abbrev: 'CA',
							country: {
								cca2: 'US',
								cca3: 'USA',
								id: 'ctry_01GSKV6PZ0GFFX5TBZA6AJ3F8T',
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
				categories: [
					{
						category: {
							ns: 'attribute',
							tag: 'community',
						},
					},
				],
				tsKey: 'community-homeless',
				tsNs: 'attribute',
			},
			supplement: [],
		},
		{
			attribute: {
				categories: [
					{
						category: {
							ns: 'attribute',
							tag: 'community',
						},
					},
				],
				tsKey: 'community-lgbtq-youth',
				tsNs: 'attribute',
			},
			supplement: [],
		},
		{
			attribute: {
				categories: [
					{
						category: {
							ns: 'attribute',
							tag: 'community',
						},
					},
				],
				tsKey: 'community-teens',
				tsNs: 'attribute',
			},
			supplement: [],
		},
		{
			attribute: {
				categories: [
					{
						category: {
							ns: 'attribute',
							tag: 'languages',
						},
					},
				],
				tsKey: 'lang-lang-offered',
				tsNs: 'attribute',
			},
			supplement: [
				{
					country: null,
					language: {
						languageName: 'English',
						nativeName: 'English',
					},
					text: null,
					boolean: null,
					data: null,
				},
			],
		},
		{
			attribute: {
				categories: [
					{
						category: {
							ns: 'attribute',
							tag: 'system',
						},
					},
				],
				tsKey: 'sys-incompatible-info',
				tsNs: 'attribute',
			},
			supplement: [
				{
					country: null,
					language: null,
					text: null,
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
	],
	phones: [],
	emails: [],
	accessDetails: [
		{
			attributes: [
				{
					attribute: {
						categories: [
							{
								category: {
									ns: 'attribute',
									tag: 'service-access-instructions',
								},
							},
						],
						tsKey: 'serviceaccess-accesslocation',
						tsNs: 'attribute',
					},
					supplement: [
						{
							country: null,
							language: null,
							text: {
								ns: 'org-service',
								key: 'larkin-street-youth-services.attribute.atts_01GSKV960T544W381KPN759PP2',
							},
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
						categories: [
							{
								category: {
									ns: 'attribute',
									tag: 'service-access-instructions',
								},
							},
						],
						tsKey: 'serviceaccess-accessphone',
						tsNs: 'attribute',
					},
					supplement: [
						{
							country: null,
							language: null,
							text: {
								ns: 'org-service',
								key: 'larkin-street-youth-services.attribute.atts_01GSKV960T0Y3DBA04QZE0HR0W',
							},
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
					id: 'gdst_01GSKV71FAE5WQ4S7CPMCABW1F',
					name: 'California',
					slug: 'us-california',
					iso: 'US-CA',
					abbrev: 'CA',
					country: {
						cca2: 'US',
						cca3: 'USA',
						id: 'ctry_01GSKV6PZ0GFFX5TBZA6AJ3F8T',
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
					id: 'ctry_01GSKV6PZ0GFFX5TBZA6AJ3F8T',
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
} satisfies ApiOutput['service']['byId']
