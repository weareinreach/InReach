import { type ApiOutput } from '@weareinreach/api'
import { transformer, type SuperJSONResult } from '@weareinreach/api/lib/transformer'

const isSuperJSON = (data: unknown): data is SuperJSONResult =>
	typeof data === 'object' && data !== null && Object.hasOwn(data, 'json')

// http://localhost:3000/api/panel
// service.byId: osvc_01GVH3VDMSN34BACQDMY6S5GPM

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
						id: 'gdst_01GW2HJ23GMD17FBJMJWD16PZ1',
						name: 'California',
						slug: 'us-california',
						iso: 'US-CA',
						abbrev: 'CA',
						country: {
							cca2: 'US',
							cca3: 'USA',
							id: 'ctry_01GW2HHDK9M26M80SG63T21SVH',
							name: 'United States',
							dialCode: null,
							flag: '🇺🇸',
							tsKey: 'USA.name',
							tsNs: 'country',
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
						id: 'gdst_01GW2HJ2S1061RNRAT6S4RJN1S',
						name: 'San Francisco',
						slug: 'us-california-san-francisco-county',
						iso: null,
						abbrev: null,
						country: {
							cca2: 'US',
							cca3: 'USA',
							id: 'ctry_01GW2HHDK9M26M80SG63T21SVH',
							name: 'United States',
							dialCode: null,
							flag: '🇺🇸',
							tsKey: 'USA.name',
							tsNs: 'country',
						},
						govDistType: {
							tsKey: 'type-county',
							tsNs: 'gov-dist',
						},
						isPrimary: false,
						tsKey: 'us-california-san-francisco-county',
						tsNs: 'gov-dist',
						parent: {
							id: 'gdst_01GW2HJ23GMD17FBJMJWD16PZ1',
							name: 'California',
							slug: 'us-california',
							iso: 'US-CA',
							abbrev: 'CA',
							country: {
								cca2: 'US',
								cca3: 'USA',
								id: 'ctry_01GW2HHDK9M26M80SG63T21SVH',
								name: 'United States',
								dialCode: null,
								flag: '🇺🇸',
								tsKey: 'USA.name',
								tsNs: 'country',
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
				id: 'attr_01GW2HHFV3BADK80TG0DXXFPMM',
				tsKey: 'additional.has-confidentiality-policy',
				tsNs: 'attribute',
				icon: null,
				iconBg: null,
				showOnLocation: null,
				categories: [
					{
						category: {
							tag: 'additional-information',
							icon: null,
						},
					},
				],
				_count: {
					parents: 0,
					children: 0,
				},
			},
			supplement: [],
		},
		{
			attribute: {
				id: 'attr_01GW2HHFVGDTNW9PDQNXK6TF1T',
				tsKey: 'cost.cost-free',
				tsNs: 'attribute',
				icon: 'carbon:piggy-bank',
				iconBg: null,
				showOnLocation: null,
				categories: [
					{
						category: {
							tag: 'cost',
							icon: null,
						},
					},
				],
				_count: {
					parents: 0,
					children: 0,
				},
			},
			supplement: [],
		},
		{
			attribute: {
				id: 'attr_01GW2HHFVGJ5GD2WHNJDPSFNRW',
				tsKey: 'eligibility.time-appointment-required',
				tsNs: 'attribute',
				icon: null,
				iconBg: null,
				showOnLocation: null,
				categories: [
					{
						category: {
							tag: 'eligibility-requirements',
							icon: null,
						},
					},
				],
				_count: {
					parents: 0,
					children: 0,
				},
			},
			supplement: [],
		},
		{
			attribute: {
				id: 'attr_01GW2HHFVGSAZXGR4JAVHEK6ZC',
				tsKey: 'eligibility.elig-age',
				tsNs: 'attribute',
				icon: null,
				iconBg: null,
				showOnLocation: null,
				categories: [
					{
						category: {
							tag: 'eligibility-requirements',
							icon: null,
						},
					},
				],
				_count: {
					parents: 0,
					children: 0,
				},
			},
			supplement: [
				{
					id: 'atts_01GW2HT8C1J8AQAEHVGANCYRPB',
					country: null,
					language: null,
					text: null,
					govDist: null,
					boolean: null,
					data: {
						min: 24,
					},
				},
			],
		},
		{
			attribute: {
				id: 'attr_01GW2HHFVJ8K180CNX339BTXM2',
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
				_count: {
					parents: 0,
					children: 0,
				},
			},
			supplement: [
				{
					id: 'atts_01GW2HT8C1N900BKNRTY39R58H',
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
		{
			attribute: {
				id: 'attr_01GW2HHFVK8KPRGKYFSSM5ECPQ',
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
				_count: {
					parents: 0,
					children: 0,
				},
			},
			supplement: [
				{
					id: 'atts_01GW2HT8C256BP7P50M1G32GNK',
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
								'action-signup-url': 'http://larkinstreetyouth.org/get-help/#section-education-employment',
							},
							{
								'community-lgbt': 'true',
							},
							{
								'elig-age-or-under (value = #)': null,
							},
						],
						meta: {
							values: {
								'4.elig-age-or-under (value = #)': ['undefined'],
							},
						},
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
						id: 'attr_01GW2HHFVMH6AE94EXN7T5A87C',
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
						_count: {
							parents: 0,
							children: 0,
						},
					},
					supplement: [
						{
							id: 'atts_01GW2HT8BWQ0WZ804A34QV7P0J',
							country: null,
							language: null,
							text: {
								key: 'larkin-street-youth-services.attribute.atts_01GW2HT8BWQ0WZ804A34QV7P0J',
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
						id: 'attr_01GW2HHFVMKTFWCKBVVFJ5GMY0',
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
						_count: {
							parents: 0,
							children: 0,
						},
					},
					supplement: [
						{
							id: 'atts_01GW2HT8BWZG5BTQ57DAQHJZ5Z',
							country: null,
							language: null,
							text: {
								key: 'larkin-street-youth-services.attribute.atts_01GW2HT8BWZG5BTQ57DAQHJZ5Z',
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
					id: 'gdst_01GW2HJ23GMD17FBJMJWD16PZ1',
					name: 'California',
					slug: 'us-california',
					iso: 'US-CA',
					abbrev: 'CA',
					country: {
						cca2: 'US',
						cca3: 'USA',
						id: 'ctry_01GW2HHDK9M26M80SG63T21SVH',
						name: 'United States',
						dialCode: null,
						flag: '🇺🇸',
						tsKey: 'USA.name',
						tsNs: 'country',
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
					id: 'ctry_01GW2HHDK9M26M80SG63T21SVH',
					name: 'United States',
					dialCode: null,
					flag: '🇺🇸',
					tsKey: 'USA.name',
					tsNs: 'country',
				},
				longitude: -122.413,
				latitude: 37.782,
			},
		},
	],
	id: 'osvc_01GVH3VDMSN34BACQDMY6S5GPM',
	description: {
		key: 'larkin-street-youth-services.osvc_01GVH3VDMSN34BACQDMY6S5GPM.description',
		ns: 'org-data',
		tsKey: {
			text: 'Larkin Street Academy Services offers job readiness, college readiness, computer classes, job placement and retention, internships, tutoring, GED tutoring and classes, secondary and post-secondary school enrollment and support, mindfulness, visual and performing arts. Offices are open Monday through Thursday, 9:00 AM - 16:00 PM, appointments only.',
		},
	},
} satisfies ApiOutput['service']['byId']

export const mockServData = () =>
	({
		...mockServiceData,
		attributes: mockServiceData.attributes.map(({ attribute, supplement }) => ({
			attribute,
			supplement: supplement.map((supplement) =>
				isSuperJSON(supplement.data)
					? { ...supplement, data: transformer.deserialize(supplement.data) }
					: supplement
			),
		})),
		accessDetails: mockServiceData.accessDetails.map(({ attributes }) => ({
			attributes: attributes.map(({ attribute, supplement }) => ({
				attribute,
				supplement: supplement.map((supplement) =>
					isSuperJSON(supplement.data)
						? { ...supplement, data: transformer.deserialize(supplement.data) }
						: supplement
				),
			})),
		})),
	} satisfies ApiOutput['service']['byId'])
