import { type ApiOutput } from '@weareinreach/api'
import { getTRPCMock } from '~ui/lib/getTrpcMock'

export const getNames = [
	{
		id: 'osvc_01GVH3VEVPF1KEKBTRVTV70WGV',
		tsKey: 'whitman-walker-health.osvc_01GVH3VEVPF1KEKBTRVTV70WGV.name',
		defaultText: 'Get rapid HIV testing',
	},
	{
		id: 'osvc_01GVH3VEVR4SRPFQD2SJF1MCJJ',
		tsKey: 'whitman-walker-health.osvc_01GVH3VEVR4SRPFQD2SJF1MCJJ.name',
		defaultText: 'Receive gender affirming care and services',
	},
	{
		id: 'osvc_01GVH3VEVSNF9NH79R7HC9FHY6',
		tsKey: 'whitman-walker-health.osvc_01GVH3VEVSNF9NH79R7HC9FHY6.name',
		defaultText: 'Get HIV care for newly diagnosed patients',
	},
	{
		id: 'osvc_01GVH3VEVVHBRF1FFXZGMMYG7D',
		tsKey: 'whitman-walker-health.osvc_01GVH3VEVVHBRF1FFXZGMMYG7D.name',
		defaultText: 'Access youth and family support services',
	},
	{
		id: 'osvc_01GVH3VEVY24KAYTWY2ZSFZNBX',
		tsKey: 'whitman-walker-health.osvc_01GVH3VEVY24KAYTWY2ZSFZNBX.name',
		defaultText: 'Get free individual and group psychotherapy for LGBTQ young people (ages 13-24)',
	},
	{
		id: 'osvc_01GVH3VEVZY7K2TYY1ZE7WXRRC',
		tsKey: 'whitman-walker-health.osvc_01GVH3VEVZY7K2TYY1ZE7WXRRC.name',
		defaultText: 'Get legal help with immigration services',
	},
	{
		id: 'osvc_01GVH3VEW2ND36DB0XWAH1PQY0',
		tsKey: 'whitman-walker-health.osvc_01GVH3VEW2ND36DB0XWAH1PQY0.name',
		defaultText: 'Get dental health services for HIV-positive individuals',
	},
	{
		id: 'osvc_01GVH3VEW3CZ8P9VS6A5MA0R7Z',
		tsKey: 'whitman-walker-health.osvc_01GVH3VEW3CZ8P9VS6A5MA0R7Z.name',
		defaultText: 'Receive behavioral health services',
	},
	{
		id: 'osvc_01GVH3VEWD5ZQY1JZM16Y5M9NG',
		tsKey: 'whitman-walker-health.osvc_01GVH3VEWD5ZQY1JZM16Y5M9NG.name',
		defaultText:
			'Get legal help for transgender people to replace and update name/gender marker on immigration documents',
	},
	{
		id: 'osvc_01GVH3VEWFZ5FHZ6S7BXQY1W55',
		tsKey: 'whitman-walker-health.osvc_01GVH3VEWFZ5FHZ6S7BXQY1W55.name',
		defaultText: 'Get the COVID-19 vaccine',
	},
	{
		id: 'osvc_01GVH3VEWHDC6F5FCQHB0H5GD6',
		tsKey: 'whitman-walker-health.osvc_01GVH3VEWHDC6F5FCQHB0H5GD6.name',
		defaultText: 'Get gender affirming hormone therapy',
	},
	{
		id: 'osvc_01GVH3VEWK33YAKZMQ2W3GT4QK',
		tsKey: 'whitman-walker-health.osvc_01GVH3VEWK33YAKZMQ2W3GT4QK.name',
		defaultText: 'Access PEP and PrEP',
	},
	{
		id: 'osvc_01GVH3VEWM65579T29F19QXP8E',
		tsKey: 'whitman-walker-health.osvc_01GVH3VEWM65579T29F19QXP8E.name',
		defaultText: 'Get help with navigating health insurance options',
	},
] satisfies ApiOutput['service']['getNames']

export const serviceData = {
	getNames,
	forServiceDrawer: {
		'medical.CATEGORYNAME': [
			{
				id: 'osvc_01GVH3VEVPF1KEKBTRVTV70WGV',
				name: {
					tsNs: 'org-data',
					tsKey: 'whitman-walker-health.osvc_01GVH3VEVPF1KEKBTRVTV70WGV.name',
					defaultText: 'Get rapid HIV testing',
				},
				locations: [],
				attributes: [],
			},
			{
				id: 'osvc_01GVH3VEVR4SRPFQD2SJF1MCJJ',
				name: {
					tsNs: 'org-data',
					tsKey: 'whitman-walker-health.osvc_01GVH3VEVR4SRPFQD2SJF1MCJJ.name',
					defaultText: 'Receive gender affirming care and services',
				},
				locations: [],
				attributes: [],
			},
			{
				id: 'osvc_01GVH3VEVSNF9NH79R7HC9FHY6',
				name: {
					tsNs: 'org-data',
					tsKey: 'whitman-walker-health.osvc_01GVH3VEVSNF9NH79R7HC9FHY6.name',
					defaultText: 'Get HIV care for newly diagnosed patients',
				},
				locations: ['Whitman-Walker 1525'],
				attributes: [],
			},
			{
				id: 'osvc_01GVH3VEVVHBRF1FFXZGMMYG7D',
				name: {
					tsNs: 'org-data',
					tsKey: 'whitman-walker-health.osvc_01GVH3VEVVHBRF1FFXZGMMYG7D.name',
					defaultText: 'Access youth and family support services',
				},
				locations: [],
				attributes: [],
			},
			{
				id: 'osvc_01GVH3VEW2ND36DB0XWAH1PQY0',
				name: {
					tsNs: 'org-data',
					tsKey: 'whitman-walker-health.osvc_01GVH3VEW2ND36DB0XWAH1PQY0.name',
					defaultText: 'Get dental health services for HIV-positive individuals',
				},
				locations: ['Whitman-Walker 1525'],
				attributes: [],
			},
			{
				id: 'osvc_01GVH3VEWFZ5FHZ6S7BXQY1W55',
				name: {
					tsNs: 'org-data',
					tsKey: 'whitman-walker-health.osvc_01GVH3VEWFZ5FHZ6S7BXQY1W55.name',
					defaultText: 'Get the COVID-19 vaccine',
				},
				locations: [],
				attributes: [],
			},
			{
				id: 'osvc_01GVH3VEWHDC6F5FCQHB0H5GD6',
				name: {
					tsNs: 'org-data',
					tsKey: 'whitman-walker-health.osvc_01GVH3VEWHDC6F5FCQHB0H5GD6.name',
					defaultText: 'Get gender affirming hormone therapy',
				},
				locations: ['Whitman-Walker 1525'],
				attributes: [],
			},
			{
				id: 'osvc_01GVH3VEWK33YAKZMQ2W3GT4QK',
				name: {
					tsNs: 'org-data',
					tsKey: 'whitman-walker-health.osvc_01GVH3VEWK33YAKZMQ2W3GT4QK.name',
					defaultText: 'Access PEP and PrEP',
				},
				locations: ['Whitman-Walker 1525'],
				attributes: [],
			},
			{
				id: 'osvc_01GVH3VEWM65579T29F19QXP8E',
				name: {
					tsNs: 'org-data',
					tsKey: 'whitman-walker-health.osvc_01GVH3VEWM65579T29F19QXP8E.name',
					defaultText: 'Get help with navigating health insurance options',
				},
				locations: [],
				attributes: [],
			},
		],
		'legal.CATEGORYNAME': [
			{
				id: 'osvc_01GVH3VEVR4SRPFQD2SJF1MCJJ',
				name: {
					tsNs: 'org-data',
					tsKey: 'whitman-walker-health.osvc_01GVH3VEVR4SRPFQD2SJF1MCJJ.name',
					defaultText: 'Receive gender affirming care and services',
				},
				locations: [],
				attributes: [],
			},
			{
				id: 'osvc_01GVH3VEVZY7K2TYY1ZE7WXRRC',
				name: {
					tsNs: 'org-data',
					tsKey: 'whitman-walker-health.osvc_01GVH3VEVZY7K2TYY1ZE7WXRRC.name',
					defaultText: 'Get legal help with immigration services',
				},
				locations: [],
				attributes: [],
			},
			{
				id: 'osvc_01GVH3VEWD5ZQY1JZM16Y5M9NG',
				name: {
					tsNs: 'org-data',
					tsKey: 'whitman-walker-health.osvc_01GVH3VEWD5ZQY1JZM16Y5M9NG.name',
					defaultText:
						'Get legal help for transgender people to replace and update name/gender marker on immigration documents',
				},
				locations: [],
				attributes: [],
			},
		],
		'mental-health.CATEGORYNAME': [
			{
				id: 'osvc_01GVH3VEVR4SRPFQD2SJF1MCJJ',
				name: {
					tsNs: 'org-data',
					tsKey: 'whitman-walker-health.osvc_01GVH3VEVR4SRPFQD2SJF1MCJJ.name',
					defaultText: 'Receive gender affirming care and services',
				},
				locations: [],
				attributes: [],
			},
			{
				id: 'osvc_01GVH3VEVVHBRF1FFXZGMMYG7D',
				name: {
					tsNs: 'org-data',
					tsKey: 'whitman-walker-health.osvc_01GVH3VEVVHBRF1FFXZGMMYG7D.name',
					defaultText: 'Access youth and family support services',
				},
				locations: [],
				attributes: [],
			},
			{
				id: 'osvc_01GVH3VEVY24KAYTWY2ZSFZNBX',
				name: {
					tsNs: 'org-data',
					tsKey: 'whitman-walker-health.osvc_01GVH3VEVY24KAYTWY2ZSFZNBX.name',
					defaultText: 'Get free individual and group psychotherapy for LGBTQ young people (ages 13-24)',
				},
				locations: [],
				attributes: [],
			},
			{
				id: 'osvc_01GVH3VEW3CZ8P9VS6A5MA0R7Z',
				name: {
					tsNs: 'org-data',
					tsKey: 'whitman-walker-health.osvc_01GVH3VEW3CZ8P9VS6A5MA0R7Z.name',
					defaultText: 'Receive behavioral health services',
				},
				locations: ['Whitman-Walker 1525'],
				attributes: [],
			},
		],
		'community-support.CATEGORYNAME': [
			{
				id: 'osvc_01GVH3VEVVHBRF1FFXZGMMYG7D',
				name: {
					tsNs: 'org-data',
					tsKey: 'whitman-walker-health.osvc_01GVH3VEVVHBRF1FFXZGMMYG7D.name',
					defaultText: 'Access youth and family support services',
				},
				locations: [],
				attributes: [],
			},
			{
				id: 'osvc_01GVH3VEVY24KAYTWY2ZSFZNBX',
				name: {
					tsNs: 'org-data',
					tsKey: 'whitman-walker-health.osvc_01GVH3VEVY24KAYTWY2ZSFZNBX.name',
					defaultText: 'Get free individual and group psychotherapy for LGBTQ young people (ages 13-24)',
				},
				locations: [],
				attributes: [],
			},
		],
	},
	forServiceEditDrawer: {
		id: 'osvc_01GVH3VEVPF1KEKBTRVTV70WGV',
		description: {
			id: 'ftxt_01GW2HT9EZ3Y7G4JY1X91ZPX5P',
			key: 'whitman-walker-health.osvc_01GVH3VEVPF1KEKBTRVTV70WGV.description',
			ns: 'org-data',
			tsKey: {
				text: 'Whitman-Walker provides walk-in HIV testing at multiple locations in DC. Walk-in HIV testing includes a confidential, rapid HIV test and risk-reduction counseling. The counseling provides clients with education on their options for having safer sex. Whitman-Walker uses the INSTI® HIV-1/HIV-2 Rapid Antibody Test and results take one minute.',
				crowdinId: null,
			},
		},
		hours: [],
		published: true,
		deleted: false,
		serviceName: {
			id: 'ftxt_01GW2HT9F1PZAQCMGSWY07973D',
			key: 'whitman-walker-health.osvc_01GVH3VEVPF1KEKBTRVTV70WGV.name',
			ns: 'org-data',
			tsKey: {
				text: 'Get rapid HIV testing',
				crowdinId: null,
			},
		},
		phones: ['ophn_01GVH3VEVCFKT3NWQ79STYVDKR'],
		emails: [],
		locations: [],
		services: [
			{
				id: 'svtg_01GW2HHFBRPBXSYN12DWNEAJJ7',
				categoryId: 'svct_01GW2HHEVKVHTWSBY7PVWC5390',
			},
		],
		serviceAreas: {
			id: 'svar_01GW2HT9F1JKT1MCAJ3P7XBDHP',
			countries: ['ctry_01GW2HHDK9M26M80SG63T21SVH'],
			districts: [
				'gdst_01GW2HJ5A278S2G84AB3N9FCW0',
				'gdst_01GW2HHYFH1TDS4HXMJ6EZDCCM',
				'gdst_01GW2HKJ7PP2TBNC8MQQS02N6S',
				'gdst_01GW2HKF7GKZBEW06ATJGN7YA0',
			],
		},
		attributes: [
			{
				attribute: {
					id: 'attr_01GW2HHFV3BADK80TG0DXXFPMM',
					tsKey: 'additional.has-confidentiality-policy',
					tsNs: 'attribute',
					icon: null,
					categories: ['additional-information'],
				},
				supplement: [],
			},
			{
				attribute: {
					id: 'attr_01GW2HHFV4TM7H5V6FHWA7S9JK',
					tsKey: 'additional.time-walk-in',
					tsNs: 'attribute',
					icon: null,
					categories: ['additional-information'],
				},
				supplement: [],
			},
			{
				attribute: {
					id: 'attr_01GW2HHFVA06WHRSM241ZF0FY0',
					tsKey: 'community.hiv-aids',
					tsNs: 'attribute',
					icon: null,
					categories: ['community'],
				},
				supplement: [],
			},
			{
				attribute: {
					id: 'attr_01GW2HHFVGDTNW9PDQNXK6TF1T',
					tsKey: 'cost.cost-free',
					tsNs: 'attribute',
					icon: 'carbon:piggy-bank',
					categories: ['cost'],
				},
				supplement: [],
			},
			{
				attribute: {
					id: 'attr_01GW2HHFVJ8K180CNX339BTXM2',
					tsKey: 'lang.lang-offered',
					tsNs: 'attribute',
					icon: null,
					categories: ['languages'],
				},
				supplement: [
					{
						id: 'atts_01GW2HT9F15B2HJK144B3NZHQK',
						active: true,
						boolean: null,
						countryId: null,
						govDistId: null,
						languageId: 'lang_0000000000N3K70GZXE29Z03A4',
						text: null,
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
					categories: ['system'],
				},
				supplement: [
					{
						id: 'atts_01GW2HT9F13VVJCJ8W2WE86R6N',
						active: true,
						boolean: null,
						countryId: null,
						govDistId: null,
						languageId: null,
						text: null,
						data: [
							{
								'community-lgbt': 'true',
							},
							{},
						],
					},
				],
			},
		],
		accessDetails: [
			{
				id: 'svac_01GW2HT9EZ2TD5STD33AT17BX6',
				attributes: [
					{
						attribute: {
							id: 'attr_01GW2HHFVMH6AE94EXN7T5A87C',
							tsKey: 'serviceaccess.accesslocation',
							tsNs: 'attribute',
						},
						supplement: [
							{
								id: 'atts_01GW2HT9F0SPS3EBCQ710RCNTA',
								text: {
									id: 'ftxt_01GW2HT9F0ACKFYVT7EHMKJPFN',
									key: 'whitman-walker-health.attribute.atts_01GW2HT9F0SPS3EBCQ710RCNTA',
									ns: 'org-data',
									tsKey: {
										text: 'Max Robinson Center - NO walk-in testing is available. Monday: 08:30-12:30, 13:30-17:30; Tuesday: 08:30 - 12:30, 13:30 - 17:30; Wednesday: 08:30 - 12:30, 13:30 - 17:30; Thursday: 08:30 - 12:30, 13:30 - 17:30; Friday: 08:30 - 12:30, 14:15 - 17:30.',
										crowdinId: null,
									},
								},
								data: {
									_id: {
										$oid: '5e7e4bdbd54f1760921a4231',
									},
									access_type: 'location',
									access_value: '2301 M. Luther King Jr., Washington DC 20020',
									instructions:
										'Max Robinson Center - NO walk-in testing is available. Monday: 08:30-12:30, 13:30-17:30; Tuesday: 08:30 - 12:30, 13:30 - 17:30; Wednesday: 08:30 - 12:30, 13:30 - 17:30; Thursday: 08:30 - 12:30, 13:30 - 17:30; Friday: 08:30 - 12:30, 14:15 - 17:30.',
									access_value_ES: '2301 M. Luther King Jr., Washington DC 20020',
									instructions_ES:
										'Centro Max Robinson: NO hay pruebas disponibles sin cita previa. Lunes: 08:30-12:30, 13:30-17:30; Martes: 08:30 - 12:30, 13:30 - 17:30; Miércoles: 08:30 - 12:30, 13:30 - 17:30; Jueves: 08:30 - 12:30, 13:30 - 17:30; Viernes: 08:30 - 12:30, 14:15 - 17:30.',
								},
							},
						],
					},
				],
			},
			{
				id: 'svac_01GW2HT9F0A8EKG5P8HM3KX6AC',
				attributes: [
					{
						attribute: {
							id: 'attr_01GW2HHFVMKTFWCKBVVFJ5GMY0',
							tsKey: 'serviceaccess.accessphone',
							tsNs: 'attribute',
						},
						supplement: [
							{
								id: 'atts_01GW2HT9F09GFRWM3JK2A43AWG',
								text: {
									id: 'ftxt_01GW2HT9F0H3RBRWNQT73BKMKF',
									key: 'whitman-walker-health.attribute.atts_01GW2HT9F09GFRWM3JK2A43AWG',
									ns: 'org-data',
									tsKey: {
										text: 'Contact the Main Office about services offered in multiple languages upon request.',
										crowdinId: null,
									},
								},
								data: {
									_id: {
										$oid: '5e7e4bdbd54f1760921a4235',
									},
									access_type: 'phone',
									access_value: '202-745-7000',
									instructions:
										'Contact the Main Office about services offered in multiple languages upon request. ',
									access_value_ES: '202-745-7000',
									instructions_ES:
										'Comunícate con la oficina principal sobre los servicios que se ofrecen en varios idiomas si lo solicitas.',
								},
							},
						],
					},
				],
			},
			{
				id: 'svac_01GW2HT9F0DH2BAW2RFNRD8802',
				attributes: [
					{
						attribute: {
							id: 'attr_01GW2HHFVMH6AE94EXN7T5A87C',
							tsKey: 'serviceaccess.accesslocation',
							tsNs: 'attribute',
						},
						supplement: [
							{
								id: 'atts_01GW2HT9F0638MD74PJ3SCWNXC',
								text: {
									id: 'ftxt_01GW2HT9F0VGSCRNGE0Y06TJZQ',
									key: 'whitman-walker-health.attribute.atts_01GW2HT9F0638MD74PJ3SCWNXC',
									ns: 'org-data',
									tsKey: {
										text: 'Whitman-Walker at 1525 - NO walk-in testing is available. Monday-Thursday: 08:30-12:30 & 13:30-17:30; Friday: 08:30- 12:30 & 14:30 -17:30.',
										crowdinId: null,
									},
								},
								data: {
									_id: {
										$oid: '5e7e4bdbd54f1760921a4233',
									},
									access_type: 'location',
									access_value: '1525 14th St, NW Washington, DC 20005',
									instructions:
										'Whitman-Walker at 1525 - NO walk-in testing is available. Monday-Thursday: 08:30-12:30 & 13:30-17:30; Friday: 08:30- 12:30 & 14:30 -17:30.',
									access_value_ES: '1525 14th St, NW Washington, DC 20005',
									instructions_ES:
										'Whitman-Walker en 1525: NO hay pruebas disponibles. Lunes-Jueves: 08:30-12:30 y 13:30-17:30; Viernes: 08:30- 12:30 y 14:30 -17:30.',
								},
							},
						],
					},
				],
			},
			{
				id: 'svac_01GW2HT9F0ZD5K9G5BW46YYDRX',
				attributes: [
					{
						attribute: {
							id: 'attr_01GW2HHFVMYXMS8ARA3GE7HZFD',
							tsKey: 'serviceaccess.accesslink',
							tsNs: 'attribute',
						},
						supplement: [
							{
								id: 'atts_01GW2HT9F01W2M7FBSKSXAQ9R4',
								text: {
									id: 'ftxt_01GW2HT9F0D57GDYZJWTP9258B',
									key: 'whitman-walker-health.attribute.atts_01GW2HT9F01W2M7FBSKSXAQ9R4',
									ns: 'org-data',
									tsKey: {
										text: "Visit the website to learn more about Whitman-Walker's testing hours and locations.",
										crowdinId: null,
									},
								},
								data: {
									_id: {
										$oid: '5e7e4bdbd54f1760921a4234',
									},
									access_type: 'link',
									access_value: 'https://www.whitman-walker.org/hiv-sti-testing',
									instructions:
										"Visit the website to learn more about Whitman-Walker's testing hours and locations. ",
									access_value_ES: 'https://www.whitman-walker.org/hiv-sti-testing',
									instructions_ES:
										'Visita el sitio web para obtener más información sobre los horarios y lugares de prueba de Whitman-Walker.',
								},
							},
						],
					},
				],
			},
		],
	},
	getOptions: [
		{
			id: 'svtg_01GW2HHFBN31248B3MH1486GE9',
			active: true,
			tsKey: 'abortion-care.abortion-providers',
			tsNs: 'services',
			category: {
				id: 'svct_01GW2HHEVBM0ZHVJ295P2QKR6H',
				active: true,
				tsKey: 'abortion-care.CATEGORYNAME',
				tsNs: 'services',
			},
		},
		{
			id: 'svtg_01GW2HHFBNJ01JJT2ZGR52T4CM',
			active: true,
			tsKey: 'abortion-care.financial-assistance',
			tsNs: 'services',
			category: {
				id: 'svct_01GW2HHEVBM0ZHVJ295P2QKR6H',
				active: true,
				tsKey: 'abortion-care.CATEGORYNAME',
				tsNs: 'services',
			},
		},
		{
			id: 'svtg_01GW2HHFBNE70TNNS3KMKEYG8C',
			active: true,
			tsKey: 'abortion-care.lodging-assistance',
			tsNs: 'services',
			category: {
				id: 'svct_01GW2HHEVBM0ZHVJ295P2QKR6H',
				active: true,
				tsKey: 'abortion-care.CATEGORYNAME',
				tsNs: 'services',
			},
		},
		{
			id: 'svtg_01GW2HHFBNPM2CZ5S6A5GZ3CWY',
			active: true,
			tsKey: 'abortion-care.mail-order-services',
			tsNs: 'services',
			category: {
				id: 'svct_01GW2HHEVBM0ZHVJ295P2QKR6H',
				active: true,
				tsKey: 'abortion-care.CATEGORYNAME',
				tsNs: 'services',
			},
		},
		{
			id: 'svtg_01GW2HHFBNM7GG79WYXK355RC2',
			active: true,
			tsKey: 'abortion-care.mental-health-support',
			tsNs: 'services',
			category: {
				id: 'svct_01GW2HHEVBM0ZHVJ295P2QKR6H',
				active: true,
				tsKey: 'abortion-care.CATEGORYNAME',
				tsNs: 'services',
			},
		},
		{
			id: 'svtg_01GW2HHFBN1NBS5WWDSNB2D9DA',
			active: true,
			tsKey: 'abortion-care.travel-assistance',
			tsNs: 'services',
			category: {
				id: 'svct_01GW2HHEVBM0ZHVJ295P2QKR6H',
				active: true,
				tsKey: 'abortion-care.CATEGORYNAME',
				tsNs: 'services',
			},
		},
		{
			id: 'svtg_01GW2HHFBND37W7E730QVADK0B',
			active: true,
			tsKey: 'community-support.cultural-centers',
			tsNs: 'services',
			category: {
				id: 'svct_01GW2HHEVCXGK9GPK6SAZ2Q7E3',
				active: true,
				tsKey: 'community-support.CATEGORYNAME',
				tsNs: 'services',
			},
		},
		{
			id: 'svtg_01GW2HHFBNJ4CGGZATZZS8DZWR',
			active: true,
			tsKey: 'community-support.lgbtq-centers',
			tsNs: 'services',
			category: {
				id: 'svct_01GW2HHEVCXGK9GPK6SAZ2Q7E3',
				active: true,
				tsKey: 'community-support.CATEGORYNAME',
				tsNs: 'services',
			},
		},
		{
			id: 'svtg_01GW2HHFBN7M36NVSDWR6M9K20',
			active: true,
			tsKey: 'community-support.reception-services',
			tsNs: 'services',
			category: {
				id: 'svct_01GW2HHEVCXGK9GPK6SAZ2Q7E3',
				active: true,
				tsKey: 'community-support.CATEGORYNAME',
				tsNs: 'services',
			},
		},
		{
			id: 'svtg_01GW2HHFBN7GFWZJSATZDCK7EM',
			active: true,
			tsKey: 'community-support.sponsors',
			tsNs: 'services',
			category: {
				id: 'svct_01GW2HHEVCXGK9GPK6SAZ2Q7E3',
				active: true,
				tsKey: 'community-support.CATEGORYNAME',
				tsNs: 'services',
			},
		},
		{
			id: 'svtg_01GW2HHFBN1CFQYR8RPA0KHSV0',
			active: true,
			tsKey: 'community-support.spiritual-support',
			tsNs: 'services',
			category: {
				id: 'svct_01GW2HHEVCXGK9GPK6SAZ2Q7E3',
				active: true,
				tsKey: 'community-support.CATEGORYNAME',
				tsNs: 'services',
			},
		},
		{
			id: 'svtg_01GW2HHFBN4B2F1W8HAWNK1HVS',
			active: true,
			tsKey: 'computers-and-internet.computers-and-internet',
			tsNs: 'services',
			category: {
				id: 'svct_01GW2HHEVDKRVB42KT85KA3FM3',
				active: true,
				tsKey: 'computers-and-internet.CATEGORYNAME',
				tsNs: 'services',
			},
		},
		{
			id: 'svtg_01GW2HHFBP8GY6D2YJ8N1GYTNH',
			active: true,
			tsKey: 'education-and-employment.career-counseling',
			tsNs: 'services',
			category: {
				id: 'svct_01GW2HHEVDX898ZT0QGM471WMV',
				active: true,
				tsKey: 'education-and-employment.CATEGORYNAME',
				tsNs: 'services',
			},
		},
		{
			id: 'svtg_01GW2HHFBPZFZF43FEHPV32JC8',
			active: true,
			tsKey: 'education-and-employment.educational-support-for-lgbtq-youth',
			tsNs: 'services',
			category: {
				id: 'svct_01GW2HHEVDX898ZT0QGM471WMV',
				active: true,
				tsKey: 'education-and-employment.CATEGORYNAME',
				tsNs: 'services',
			},
		},
		{
			id: 'svtg_01GW2HHFBPC0P27MT0WMA3C4QH',
			active: true,
			tsKey: 'education-and-employment.english-classes',
			tsNs: 'services',
			category: {
				id: 'svct_01GW2HHEVDX898ZT0QGM471WMV',
				active: true,
				tsKey: 'education-and-employment.CATEGORYNAME',
				tsNs: 'services',
			},
		},
		{
			id: 'svtg_01GW2HHFBPHEBB94KEDQXEA8AC',
			active: true,
			tsKey: 'education-and-employment.language-classes',
			tsNs: 'services',
			category: {
				id: 'svct_01GW2HHEVDX898ZT0QGM471WMV',
				active: true,
				tsKey: 'education-and-employment.CATEGORYNAME',
				tsNs: 'services',
			},
		},
		{
			id: 'svtg_01GW2HHFBP9GBJPZMWM9PA5DX0',
			active: true,
			tsKey: 'education-and-employment.leadership-training-and-professional-development',
			tsNs: 'services',
			category: {
				id: 'svct_01GW2HHEVDX898ZT0QGM471WMV',
				active: true,
				tsKey: 'education-and-employment.CATEGORYNAME',
				tsNs: 'services',
			},
		},
		{
			id: 'svtg_01GW2HHFBPVH03WA49B1ABGW0F',
			active: true,
			tsKey: 'education-and-employment.libraries',
			tsNs: 'services',
			category: {
				id: 'svct_01GW2HHEVDX898ZT0QGM471WMV',
				active: true,
				tsKey: 'education-and-employment.CATEGORYNAME',
				tsNs: 'services',
			},
		},
		{
			id: 'svtg_01GW2HHFBPBQ7XNCBG5AJF6W0X',
			active: true,
			tsKey: 'education-and-employment.scholarships',
			tsNs: 'services',
			category: {
				id: 'svct_01GW2HHEVDX898ZT0QGM471WMV',
				active: true,
				tsKey: 'education-and-employment.CATEGORYNAME',
				tsNs: 'services',
			},
		},
		{
			id: 'svtg_01GW2HHFBP9CP8V4WGA1QCWVKQ',
			active: true,
			tsKey: 'food.food',
			tsNs: 'services',
			category: {
				id: 'svct_01GW2HHEVFXW9YFMK4R95ZHBPV',
				active: true,
				tsKey: 'food.CATEGORYNAME',
				tsNs: 'services',
			},
		},
		{
			id: 'svtg_01GW2HHFBPV0NV6R04MR84X9H6',
			active: true,
			tsKey: 'food.food-assistance',
			tsNs: 'services',
			category: {
				id: 'svct_01GW2HHEVFXW9YFMK4R95ZHBPV',
				active: true,
				tsKey: 'food.CATEGORYNAME',
				tsNs: 'services',
			},
		},
		{
			id: 'svtg_01GW2HHFBPG92H7F9REAG9T2X5',
			active: true,
			tsKey: 'housing.drop-in-centers-for-lgbtq-youth',
			tsNs: 'services',
			category: {
				id: 'svct_01GW2HHEVF8W7D67CH3NVSQYA6',
				active: true,
				tsKey: 'housing.CATEGORYNAME',
				tsNs: 'services',
			},
		},
		{
			id: 'svtg_01GW2HHFBPYW3BJXHHZSM33PMY',
			active: true,
			tsKey: 'housing.emergency-housing',
			tsNs: 'services',
			category: {
				id: 'svct_01GW2HHEVF8W7D67CH3NVSQYA6',
				active: true,
				tsKey: 'housing.CATEGORYNAME',
				tsNs: 'services',
			},
		},
		{
			id: 'svtg_01GW2HHFBP3A2B8E5F070E9HR6',
			active: true,
			tsKey: 'housing.housing-information-and-referrals',
			tsNs: 'services',
			category: {
				id: 'svct_01GW2HHEVF8W7D67CH3NVSQYA6',
				active: true,
				tsKey: 'housing.CATEGORYNAME',
				tsNs: 'services',
			},
		},
		{
			id: 'svtg_01GW2HHFBPC9YCGABHSSXEGN82',
			active: true,
			tsKey: 'housing.short-term-housing',
			tsNs: 'services',
			category: {
				id: 'svct_01GW2HHEVF8W7D67CH3NVSQYA6',
				active: true,
				tsKey: 'housing.CATEGORYNAME',
				tsNs: 'services',
			},
		},
		{
			id: 'svtg_01GW2HHFBQ02KJQ7E5NPM3ERNE',
			active: true,
			tsKey: 'housing.trans-housing',
			tsNs: 'services',
			category: {
				id: 'svct_01GW2HHEVF8W7D67CH3NVSQYA6',
				active: true,
				tsKey: 'housing.CATEGORYNAME',
				tsNs: 'services',
			},
		},
		{
			id: 'svtg_01GW2HHFBQYAZE13SSFJ1WZ7J8',
			active: true,
			tsKey: 'hygiene-and-clothing.clothes',
			tsNs: 'services',
			category: {
				id: 'svct_01GW2HHEVGD7CE9VKYVSZYYTPS',
				active: true,
				tsKey: 'hygiene-and-clothing.CATEGORYNAME',
				tsNs: 'services',
			},
		},
		{
			id: 'svtg_01GW2HHFBQ817GKC3K6D6JGMVC',
			active: true,
			tsKey: 'hygiene-and-clothing.gender-affirming-items',
			tsNs: 'services',
			category: {
				id: 'svct_01GW2HHEVGD7CE9VKYVSZYYTPS',
				active: true,
				tsKey: 'hygiene-and-clothing.CATEGORYNAME',
				tsNs: 'services',
			},
		},
		{
			id: 'svtg_01GW2HHFBQNARDK4H2W30GC1QR',
			active: true,
			tsKey: 'hygiene-and-clothing.gender-neutral-bathrooms',
			tsNs: 'services',
			category: {
				id: 'svct_01GW2HHEVGD7CE9VKYVSZYYTPS',
				active: true,
				tsKey: 'hygiene-and-clothing.CATEGORYNAME',
				tsNs: 'services',
			},
		},
		{
			id: 'svtg_01GW2HHFBQBV2YXAS0AQAFXY33',
			active: true,
			tsKey: 'hygiene-and-clothing.haircuts-and-stylists',
			tsNs: 'services',
			category: {
				id: 'svct_01GW2HHEVGD7CE9VKYVSZYYTPS',
				active: true,
				tsKey: 'hygiene-and-clothing.CATEGORYNAME',
				tsNs: 'services',
			},
		},
		{
			id: 'svtg_01GW2HHFBQ0J8FBM5SECT20H4K',
			active: true,
			tsKey: 'hygiene-and-clothing.hygiene',
			tsNs: 'services',
			category: {
				id: 'svct_01GW2HHEVGD7CE9VKYVSZYYTPS',
				active: true,
				tsKey: 'hygiene-and-clothing.CATEGORYNAME',
				tsNs: 'services',
			},
		},
		{
			id: 'svtg_01GW2HHFBQSF73S87ZRENXHKQV',
			active: true,
			tsKey: 'legal.asylum-application',
			tsNs: 'services',
			category: {
				id: 'svct_01GW2HHEVH75KPRYKD49EJHYXX',
				active: true,
				tsKey: 'legal.CATEGORYNAME',
				tsNs: 'services',
			},
		},
		{
			id: 'svtg_01GW2HHFBQ4R0QKMB5XKN0VPR3',
			active: true,
			tsKey: 'legal.citizenship',
			tsNs: 'services',
			category: {
				id: 'svct_01GW2HHEVH75KPRYKD49EJHYXX',
				active: true,
				tsKey: 'legal.CATEGORYNAME',
				tsNs: 'services',
			},
		},
		{
			id: 'svtg_01GW2HHFBQEVJCBZC1KSSEB8WN',
			active: true,
			tsKey: 'legal.crime-and-discrimination',
			tsNs: 'services',
			category: {
				id: 'svct_01GW2HHEVH75KPRYKD49EJHYXX',
				active: true,
				tsKey: 'legal.CATEGORYNAME',
				tsNs: 'services',
			},
		},
		{
			id: 'svtg_01GW2HHFBQMRW61WVCRR82EJ55',
			active: true,
			tsKey: 'legal.deferred-action-for-childhood-arrivals-daca',
			tsNs: 'services',
			category: {
				id: 'svct_01GW2HHEVH75KPRYKD49EJHYXX',
				active: true,
				tsKey: 'legal.CATEGORYNAME',
				tsNs: 'services',
			},
		},
		{
			id: 'svtg_01GW2HHFBQ053M5632FG5BEHAB',
			active: true,
			tsKey: 'legal.deportation-or-removal',
			tsNs: 'services',
			category: {
				id: 'svct_01GW2HHEVH75KPRYKD49EJHYXX',
				active: true,
				tsKey: 'legal.CATEGORYNAME',
				tsNs: 'services',
			},
		},
		{
			id: 'svtg_01GW2HHFBQWFR2KPXH7KPX96BD',
			active: true,
			tsKey: 'legal.employment-authorization',
			tsNs: 'services',
			category: {
				id: 'svct_01GW2HHEVH75KPRYKD49EJHYXX',
				active: true,
				tsKey: 'legal.CATEGORYNAME',
				tsNs: 'services',
			},
		},
		{
			id: 'svtg_01GW2HHFBQF6937029TNRN458W',
			active: true,
			tsKey: 'legal.family-petitions',
			tsNs: 'services',
			category: {
				id: 'svct_01GW2HHEVH75KPRYKD49EJHYXX',
				active: true,
				tsKey: 'legal.CATEGORYNAME',
				tsNs: 'services',
			},
		},
		{
			id: 'svtg_01GW2HHFBQ78QZGW7YAPDZ2YJS',
			active: true,
			tsKey: 'legal.immigration-detention',
			tsNs: 'services',
			category: {
				id: 'svct_01GW2HHEVH75KPRYKD49EJHYXX',
				active: true,
				tsKey: 'legal.CATEGORYNAME',
				tsNs: 'services',
			},
		},
		{
			id: 'svtg_01GW2HHFBRSQG19TQ4G5EVP3AQ',
			active: true,
			tsKey: 'legal.legal-advice',
			tsNs: 'services',
			category: {
				id: 'svct_01GW2HHEVH75KPRYKD49EJHYXX',
				active: true,
				tsKey: 'legal.CATEGORYNAME',
				tsNs: 'services',
			},
		},
		{
			id: 'svtg_01GW2HHFBRY1NC6GD7XAHG6AR8',
			active: true,
			tsKey: 'legal.legal-hotlines',
			tsNs: 'services',
			category: {
				id: 'svct_01GW2HHEVH75KPRYKD49EJHYXX',
				active: true,
				tsKey: 'legal.CATEGORYNAME',
				tsNs: 'services',
			},
		},
		{
			id: 'svtg_01GW2HHFBRB8R4AQVR2FYE72EC',
			active: true,
			tsKey: 'legal.name-and-gender-change',
			tsNs: 'services',
			category: {
				id: 'svct_01GW2HHEVH75KPRYKD49EJHYXX',
				active: true,
				tsKey: 'legal.CATEGORYNAME',
				tsNs: 'services',
			},
		},
		{
			id: 'svtg_01GW2HHFBRYMX5EH2J05SREANF',
			active: true,
			tsKey: 'legal.refugee-claim',
			tsNs: 'services',
			category: {
				id: 'svct_01GW2HHEVH75KPRYKD49EJHYXX',
				active: true,
				tsKey: 'legal.CATEGORYNAME',
				tsNs: 'services',
			},
		},
		{
			id: 'svtg_01GW2HHFBR53GRFZYTNQ8DQ2WF',
			active: true,
			tsKey: 'legal.residency',
			tsNs: 'services',
			category: {
				id: 'svct_01GW2HHEVH75KPRYKD49EJHYXX',
				active: true,
				tsKey: 'legal.CATEGORYNAME',
				tsNs: 'services',
			},
		},
		{
			id: 'svtg_01GW2HHFBR3T44H6K1BKD38JYT',
			active: true,
			tsKey: 'legal.special-immigrant-juvenile-status-sijs',
			tsNs: 'services',
			category: {
				id: 'svct_01GW2HHEVH75KPRYKD49EJHYXX',
				active: true,
				tsKey: 'legal.CATEGORYNAME',
				tsNs: 'services',
			},
		},
		{
			id: 'svtg_01GW2HHFBR0YA6DR2VTE0KCE9N',
			active: true,
			tsKey: 'legal.t-visa',
			tsNs: 'services',
			category: {
				id: 'svct_01GW2HHEVH75KPRYKD49EJHYXX',
				active: true,
				tsKey: 'legal.CATEGORYNAME',
				tsNs: 'services',
			},
		},
		{
			id: 'svtg_01GW2HHFBRYVSPX4GA4RZY0XTA',
			active: true,
			tsKey: 'legal.u-visa',
			tsNs: 'services',
			category: {
				id: 'svct_01GW2HHEVH75KPRYKD49EJHYXX',
				active: true,
				tsKey: 'legal.CATEGORYNAME',
				tsNs: 'services',
			},
		},
		{
			id: 'svtg_01GW2HHFBRJER29EH8BK4STRPE',
			active: true,
			tsKey: 'medical.covid-19-services',
			tsNs: 'services',
			category: {
				id: 'svct_01GW2HHEVKVHTWSBY7PVWC5390',
				active: true,
				tsKey: 'medical.CATEGORYNAME',
				tsNs: 'services',
			},
		},
		{
			id: 'svtg_01GW2HHFBRQ76SJBY7973FZFDC',
			active: true,
			tsKey: 'medical.dental-care',
			tsNs: 'services',
			category: {
				id: 'svct_01GW2HHEVKVHTWSBY7PVWC5390',
				active: true,
				tsKey: 'medical.CATEGORYNAME',
				tsNs: 'services',
			},
		},
		{
			id: 'svtg_01GW2HHFBRPBXSYN12DWNEAJJ7',
			active: true,
			tsKey: 'medical.hiv-and-sexual-health',
			tsNs: 'services',
			category: {
				id: 'svct_01GW2HHEVKVHTWSBY7PVWC5390',
				active: true,
				tsKey: 'medical.CATEGORYNAME',
				tsNs: 'services',
			},
		},
		{
			id: 'svtg_01GW2HHFBRJX151YFSTMPVN7CV',
			active: true,
			tsKey: 'medical.medical-clinics',
			tsNs: 'services',
			category: {
				id: 'svct_01GW2HHEVKVHTWSBY7PVWC5390',
				active: true,
				tsKey: 'medical.CATEGORYNAME',
				tsNs: 'services',
			},
		},
		{
			id: 'svtg_01GW2HHFBRDW97D7E0XAPA2XRN',
			active: true,
			tsKey: 'medical.obgyn-services',
			tsNs: 'services',
			category: {
				id: 'svct_01GW2HHEVKVHTWSBY7PVWC5390',
				active: true,
				tsKey: 'medical.CATEGORYNAME',
				tsNs: 'services',
			},
		},
		{
			id: 'svtg_01GW2HHFBRZB55NNQXGZDZSC8Y',
			active: true,
			tsKey: 'medical.physical-evaluations-for-asylum-claim',
			tsNs: 'services',
			category: {
				id: 'svct_01GW2HHEVKVHTWSBY7PVWC5390',
				active: true,
				tsKey: 'medical.CATEGORYNAME',
				tsNs: 'services',
			},
		},
		{
			id: 'svtg_01GW2HHFBRK22BMD8KX9DZ9JA5',
			active: true,
			tsKey: 'medical.physical-evaluations-for-refugee-claim',
			tsNs: 'services',
			category: {
				id: 'svct_01GW2HHEVKVHTWSBY7PVWC5390',
				active: true,
				tsKey: 'medical.CATEGORYNAME',
				tsNs: 'services',
			},
		},
		{
			id: 'svtg_01GW2HHFBR4WXR0SMNAKZAHFGK',
			active: true,
			tsKey: 'medical.trans-health',
			tsNs: 'services',
			category: {
				id: 'svct_01GW2HHEVKVHTWSBY7PVWC5390',
				active: true,
				tsKey: 'medical.CATEGORYNAME',
				tsNs: 'services',
			},
		},
		{
			id: 'svtg_01GW2HHFBR506BA0ZA7XZWX23Q',
			active: true,
			tsKey: 'medical.trans-health-gender-affirming-surgery',
			tsNs: 'services',
			category: {
				id: 'svct_01GW2HHEVKVHTWSBY7PVWC5390',
				active: true,
				tsKey: 'medical.CATEGORYNAME',
				tsNs: 'services',
			},
		},
		{
			id: 'svtg_01GW2HHFBSBVW6KJACB43FTFNQ',
			active: true,
			tsKey: 'medical.trans-health-hormone-and-surgery-letters',
			tsNs: 'services',
			category: {
				id: 'svct_01GW2HHEVKVHTWSBY7PVWC5390',
				active: true,
				tsKey: 'medical.CATEGORYNAME',
				tsNs: 'services',
			},
		},
		{
			id: 'svtg_01GW2HHFBSZJ7ZQD3AVMKQK83N',
			active: true,
			tsKey: 'medical.trans-health-hormone-therapy',
			tsNs: 'services',
			category: {
				id: 'svct_01GW2HHEVKVHTWSBY7PVWC5390',
				active: true,
				tsKey: 'medical.CATEGORYNAME',
				tsNs: 'services',
			},
		},
		{
			id: 'svtg_01GW2HHFBSG3BES4BKSW269M8K',
			active: true,
			tsKey: 'medical.trans-health-primary-care',
			tsNs: 'services',
			category: {
				id: 'svct_01GW2HHEVKVHTWSBY7PVWC5390',
				active: true,
				tsKey: 'medical.CATEGORYNAME',
				tsNs: 'services',
			},
		},
		{
			id: 'svtg_01GW2HHFBS5YQWBD8N2V56X5X0',
			active: true,
			tsKey: 'medical.trans-health-speech-therapy',
			tsNs: 'services',
			category: {
				id: 'svct_01GW2HHEVKVHTWSBY7PVWC5390',
				active: true,
				tsKey: 'medical.CATEGORYNAME',
				tsNs: 'services',
			},
		},
		{
			id: 'svtg_01GW2HHFBS2G776ZTE6R3ZCWEF',
			active: true,
			tsKey: 'mental-health.bipoc-support-groups',
			tsNs: 'services',
			category: {
				id: 'svct_01GW2HHEVMEF7DMG9WHP0JM2ZZ',
				active: true,
				tsKey: 'mental-health.CATEGORYNAME',
				tsNs: 'services',
			},
		},
		{
			id: 'svtg_01GW2HHFBSKZHCJT1X2KWXC8HB',
			active: true,
			tsKey: 'mental-health.hotlines',
			tsNs: 'services',
			category: {
				id: 'svct_01GW2HHEVMEF7DMG9WHP0JM2ZZ',
				active: true,
				tsKey: 'mental-health.CATEGORYNAME',
				tsNs: 'services',
			},
		},
		{
			id: 'svtg_01GW2HHFBSTS3SZNE3GBAF9N2B',
			active: true,
			tsKey: 'mental-health.private-therapy-and-counseling',
			tsNs: 'services',
			category: {
				id: 'svct_01GW2HHEVMEF7DMG9WHP0JM2ZZ',
				active: true,
				tsKey: 'mental-health.CATEGORYNAME',
				tsNs: 'services',
			},
		},
		{
			id: 'svtg_01GW2HHFBS617V01ANP6MXPSSX',
			active: true,
			tsKey: 'mental-health.psychological-evaluations-for-asylum-claim',
			tsNs: 'services',
			category: {
				id: 'svct_01GW2HHEVMEF7DMG9WHP0JM2ZZ',
				active: true,
				tsKey: 'mental-health.CATEGORYNAME',
				tsNs: 'services',
			},
		},
		{
			id: 'svtg_01GW2HHFBS6STMXJT0GK4F4YQS',
			active: true,
			tsKey: 'mental-health.psychological-evaluations-for-refugee-claim',
			tsNs: 'services',
			category: {
				id: 'svct_01GW2HHEVMEF7DMG9WHP0JM2ZZ',
				active: true,
				tsKey: 'mental-health.CATEGORYNAME',
				tsNs: 'services',
			},
		},
		{
			id: 'svtg_01GW2HHFBSX65WWRQ3BFXHWCJN',
			active: true,
			tsKey: 'mental-health.substance-use',
			tsNs: 'services',
			category: {
				id: 'svct_01GW2HHEVMEF7DMG9WHP0JM2ZZ',
				active: true,
				tsKey: 'mental-health.CATEGORYNAME',
				tsNs: 'services',
			},
		},
		{
			id: 'svtg_01GW2HHFBS72MEA9GWN7FWYWQA',
			active: true,
			tsKey: 'mental-health.support-for-caregivers-of-trans-youth',
			tsNs: 'services',
			category: {
				id: 'svct_01GW2HHEVMEF7DMG9WHP0JM2ZZ',
				active: true,
				tsKey: 'mental-health.CATEGORYNAME',
				tsNs: 'services',
			},
		},
		{
			id: 'svtg_01GW2HHFBS16CJP08CPDSNNVBY',
			active: true,
			tsKey: 'mental-health.support-for-conversion-therapy-survivors',
			tsNs: 'services',
			category: {
				id: 'svct_01GW2HHEVMEF7DMG9WHP0JM2ZZ',
				active: true,
				tsKey: 'mental-health.CATEGORYNAME',
				tsNs: 'services',
			},
		},
		{
			id: 'svtg_01GW2HHFBSTFJC21CK33S54BPZ',
			active: true,
			tsKey: 'mental-health.support-groups',
			tsNs: 'services',
			category: {
				id: 'svct_01GW2HHEVMEF7DMG9WHP0JM2ZZ',
				active: true,
				tsKey: 'mental-health.CATEGORYNAME',
				tsNs: 'services',
			},
		},
		{
			id: 'svtg_01GW2HHFBSPTXA7Q4W5RKFP53W',
			active: true,
			tsKey: 'mental-health.trans-support-groups',
			tsNs: 'services',
			category: {
				id: 'svct_01GW2HHEVMEF7DMG9WHP0JM2ZZ',
				active: true,
				tsKey: 'mental-health.CATEGORYNAME',
				tsNs: 'services',
			},
		},
		{
			id: 'svtg_01GW2HHFBSYJJ8FRE5QRW4BQVR',
			active: true,
			tsKey: 'sports-and-entertainment.sports-and-entertainment',
			tsNs: 'services',
			category: {
				id: 'svct_01GW2HHEVPE008PHCPNHZDAWMS',
				active: true,
				tsKey: 'sports-and-entertainment.CATEGORYNAME',
				tsNs: 'services',
			},
		},
		{
			id: 'svtg_01GW2HHFBSA32322K840DVFNSW',
			active: true,
			tsKey: 'translation-and-interpretation.general-translation-and-interpretation',
			tsNs: 'services',
			category: {
				id: 'svct_01GW2HHEVPFRQR07PTHMWJDDKS',
				active: true,
				tsKey: 'translation-and-interpretation.CATEGORYNAME',
				tsNs: 'services',
			},
		},
		{
			id: 'svtg_01GW2HHFBTPY48P18NZR9S3DC8',
			active: true,
			tsKey: 'translation-and-interpretation.for-healthcare',
			tsNs: 'services',
			category: {
				id: 'svct_01GW2HHEVPFRQR07PTHMWJDDKS',
				active: true,
				tsKey: 'translation-and-interpretation.CATEGORYNAME',
				tsNs: 'services',
			},
		},
		{
			id: 'svtg_01GW2HHFBTRAAMB3K1JQ2V41GH',
			active: true,
			tsKey: 'translation-and-interpretation.for-legal-services',
			tsNs: 'services',
			category: {
				id: 'svct_01GW2HHEVPFRQR07PTHMWJDDKS',
				active: true,
				tsKey: 'translation-and-interpretation.CATEGORYNAME',
				tsNs: 'services',
			},
		},
		{
			id: 'svtg_01GW2HHFBTM1JSTAQKF8DYS9V5',
			active: true,
			tsKey: 'transportation.transit-passes-and-discounts',
			tsNs: 'services',
			category: {
				id: 'svct_01GW2HHEVPXANJ6MPCDE0S4CWT',
				active: true,
				tsKey: 'transportation.CATEGORYNAME',
				tsNs: 'services',
			},
		},
		{
			id: 'svtg_01GW2HHFBTQ73C86ARY7WV96WB',
			active: true,
			tsKey: 'transportation.transportation-assistance',
			tsNs: 'services',
			category: {
				id: 'svct_01GW2HHEVPXANJ6MPCDE0S4CWT',
				active: true,
				tsKey: 'transportation.CATEGORYNAME',
				tsNs: 'services',
			},
		},
		{
			id: 'svtg_01GW2HHFBT91CV2R6WKEX6MYPE',
			active: true,
			tsKey: 'mail.mail',
			tsNs: 'services',
			category: {
				id: 'svct_01GW2HHEVQ0VE6E94T3CZWEW9F',
				active: true,
				tsKey: 'mail.CATEGORYNAME',
				tsNs: 'services',
			},
		},
	],
} satisfies Partial<MockData>

export const service = {
	getNames: getTRPCMock({
		path: ['service', 'getNames'],
		response: serviceData.getNames,
	}),
	forServiceDrawer: getTRPCMock({
		path: ['service', 'forServiceDrawer'],
		response: serviceData.forServiceDrawer,
	}),
	forServiceEditDrawer: getTRPCMock({
		path: ['service', 'forServiceEditDrawer'],
		response: serviceData.forServiceEditDrawer,
	}),
	getOptions: getTRPCMock({
		path: ['service', 'getOptions'],
		response: serviceData.getOptions,
	}),
} satisfies MockHandlers

type MockData = {
	[K in keyof ApiOutput['service']]: ApiOutput['service'][K]
}
type MockHandlers = {
	[K in keyof typeof serviceData]: ReturnType<typeof getTRPCMock>
}
