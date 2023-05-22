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
} satisfies MockHandlers

type MockData = {
	[K in keyof ApiOutput['service']]: ApiOutput['service'][K]
}
type MockHandlers = {
	[K in keyof typeof serviceData]: ReturnType<typeof getTRPCMock>
}
