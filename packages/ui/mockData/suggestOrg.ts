import { type ApiOutput } from '@weareinreach/api'

export const suggestionOptions = {
	countries: [
		{
			id: 'ctry_01GW2HHDK9M26M80SG63T21SVH',
			tsKey: 'USA.name',
			cca2: 'US',
		},
		{
			id: 'ctry_01GW2HHDKB9DG2T2YZM5MFFVX9',
			tsKey: 'MEX.name',
			cca2: 'MX',
		},
		{
			id: 'ctry_01GW2HHDKAWXWYHAAESAA5HH94',
			tsKey: 'CAN.name',
			cca2: 'CA',
		},
	],
	serviceTypes: [
		{
			id: 'svct_01GW2HHEVBM0ZHVJ295P2QKR6H',
			tsKey: 'abortion-care.CATEGORYNAME',
			tsNs: 'services',
		},
		{
			id: 'svct_01GW2HHEVCXGK9GPK6SAZ2Q7E3',
			tsKey: 'community-support.CATEGORYNAME',
			tsNs: 'services',
		},
		{
			id: 'svct_01GW2HHEVDKRVB42KT85KA3FM3',
			tsKey: 'computers-and-internet.CATEGORYNAME',
			tsNs: 'services',
		},
		{
			id: 'svct_01GW2HHEVDX898ZT0QGM471WMV',
			tsKey: 'education-and-employment.CATEGORYNAME',
			tsNs: 'services',
		},
		{
			id: 'svct_01GW2HHEVFXW9YFMK4R95ZHBPV',
			tsKey: 'food.CATEGORYNAME',
			tsNs: 'services',
		},
		{
			id: 'svct_01GW2HHEVF8W7D67CH3NVSQYA6',
			tsKey: 'housing.CATEGORYNAME',
			tsNs: 'services',
		},
		{
			id: 'svct_01GW2HHEVGD7CE9VKYVSZYYTPS',
			tsKey: 'hygiene-and-clothing.CATEGORYNAME',
			tsNs: 'services',
		},
		{
			id: 'svct_01GW2HHEVH75KPRYKD49EJHYXX',
			tsKey: 'legal.CATEGORYNAME',
			tsNs: 'services',
		},
		{
			id: 'svct_01GW2HHEVQ0VE6E94T3CZWEW9F',
			tsKey: 'mail.CATEGORYNAME',
			tsNs: 'services',
		},
		{
			id: 'svct_01GW2HHEVKVHTWSBY7PVWC5390',
			tsKey: 'medical.CATEGORYNAME',
			tsNs: 'services',
		},
		{
			id: 'svct_01GW2HHEVMEF7DMG9WHP0JM2ZZ',
			tsKey: 'mental-health.CATEGORYNAME',
			tsNs: 'services',
		},
		{
			id: 'svct_01GW2HHEVPE008PHCPNHZDAWMS',
			tsKey: 'sports-and-entertainment.CATEGORYNAME',
			tsNs: 'services',
		},
		{
			id: 'svct_01GW2HHEVPFRQR07PTHMWJDDKS',
			tsKey: 'translation-and-interpretation.CATEGORYNAME',
			tsNs: 'services',
		},
		{
			id: 'svct_01GW2HHEVPXANJ6MPCDE0S4CWT',
			tsKey: 'transportation.CATEGORYNAME',
			tsNs: 'services',
		},
	],
	communities: [
		{
			id: 'attr_01GW2HHFVN72D7XEBZZJXCJQXQ',
			tsNs: 'attribute',
			tsKey: 'srvfocus.bipoc-comm',
			icon: '️‍️‍✊🏿',
			children: [],
		},
		{
			id: 'attr_01GW2HHFVRMQFJ9AMA633SQQGV',
			tsNs: 'attribute',
			tsKey: 'srvfocus.hiv-comm',
			icon: '💛',
			children: [],
		},
		{
			id: 'attr_01GW2HHFVPTK9555WHJHDBDA2J',
			tsNs: 'attribute',
			tsKey: 'srvfocus.immigrant-comm',
			icon: '️‍️‍🌎',
			children: [
				{
					id: 'attr_01GW2HHFVPCVX8F3B7M30ZJEHW',
					tsNs: 'attribute',
					tsKey: 'srvfocus.asylum-seekers',
					parentId: 'attr_01GW2HHFVPTK9555WHJHDBDA2J',
				},
				{
					id: 'attr_01GW2HHFVPJERY0GS9D7F56A23',
					tsNs: 'attribute',
					tsKey: 'srvfocus.resettled-refugees',
					parentId: 'attr_01GW2HHFVPTK9555WHJHDBDA2J',
				},
			],
		},
		{
			id: 'attr_01GW2HHFVQCZPA3Z5GW6J3MQHW',
			tsNs: 'attribute',
			tsKey: 'srvfocus.lgbtq-youth-focus',
			icon: '🌱',
			children: [
				{
					id: 'attr_01GW2HHFVQVEGH6W3A2ANH1QZE',
					tsNs: 'attribute',
					tsKey: 'srvfocus.trans-youth-focus',
					parentId: 'attr_01GW2HHFVQCZPA3Z5GW6J3MQHW',
				},
			],
		},
		{
			id: 'attr_01GW2HHFVQ8AGBKBBZJWTHNP2F',
			tsNs: 'attribute',
			tsKey: 'srvfocus.spanish-speakers',
			icon: '🗣️',
			children: [],
		},
		{
			id: 'attr_01GW2HHFVPSYBCYF37B44WP6CZ',
			tsNs: 'attribute',
			tsKey: 'srvfocus.trans-comm',
			icon: '🏳️‍⚧️',
			children: [
				{
					id: 'attr_01GW2HHFVQ7SYGD3KM8WP9X50B',
					tsNs: 'attribute',
					tsKey: 'srvfocus.gender-nc',
					parentId: 'attr_01GW2HHFVPSYBCYF37B44WP6CZ',
				},
				{
					id: 'attr_01GW2HHFVQEFWW42MBAD64BWXZ',
					tsNs: 'attribute',
					tsKey: 'srvfocus.trans-masc',
					parentId: 'attr_01GW2HHFVPSYBCYF37B44WP6CZ',
				},
				{
					id: 'attr_01GW2HHFVQX4M8DY1FSAYSJSSK',
					tsNs: 'attribute',
					tsKey: 'srvfocus.trans-fem',
					parentId: 'attr_01GW2HHFVPSYBCYF37B44WP6CZ',
				},
				{
					id: 'attr_01GW2HHFVQVEGH6W3A2ANH1QZE',
					tsNs: 'attribute',
					tsKey: 'srvfocus.trans-youth-focus',
					parentId: 'attr_01GW2HHFVPSYBCYF37B44WP6CZ',
				},
			],
		},
	],
} satisfies ApiOutput['organization']['suggestionOptions']

export const existingOrg = (input: string): ApiOutput['organization']['checkForExisting'] => {
	const name = 'Existing Organization'
	const regex = new RegExp(`.*${input}.*`, 'gi')
	if (regex.test(name)) {
		return {
			name,
			published: true,
			slug: 'existing-org',
		}
	}
	return null
}
