export const serviceCategory = [
	{
		id: 'svct_01GW2HHEVBM0ZHVJ295P2QKR6H',
		category: 'Abortion Care',
		tsKey: 'abortion-care.CATEGORYNAME',
		tsNs: 'services',
	},
	{
		id: 'svct_01GW2HHEVCXGK9GPK6SAZ2Q7E3',
		category: 'Community Support',
		tsKey: 'community-support.CATEGORYNAME',
		tsNs: 'services',
	},
	{
		id: 'svct_01GW2HHEVDKRVB42KT85KA3FM3',
		category: 'Computers and Internet',
		tsKey: 'computers-and-internet.CATEGORYNAME',
		tsNs: 'services',
	},
	{
		id: 'svct_01GW2HHEVDX898ZT0QGM471WMV',
		category: 'Education and Employment',
		tsKey: 'education-and-employment.CATEGORYNAME',
		tsNs: 'services',
	},
	{ id: 'svct_01GW2HHEVFXW9YFMK4R95ZHBPV', category: 'Food', tsKey: 'food.CATEGORYNAME', tsNs: 'services' },
	{
		id: 'svct_01GW2HHEVF8W7D67CH3NVSQYA6',
		category: 'Housing',
		tsKey: 'housing.CATEGORYNAME',
		tsNs: 'services',
	},
	{
		id: 'svct_01GW2HHEVGD7CE9VKYVSZYYTPS',
		category: 'Hygiene and Clothing',
		tsKey: 'hygiene-and-clothing.CATEGORYNAME',
		tsNs: 'services',
	},
	{ id: 'svct_01GW2HHEVH75KPRYKD49EJHYXX', category: 'Legal', tsKey: 'legal.CATEGORYNAME', tsNs: 'services' },
	{ id: 'svct_01GW2HHEVQ0VE6E94T3CZWEW9F', category: 'Mail', tsKey: 'mail.CATEGORYNAME', tsNs: 'services' },
	{
		id: 'svct_01GW2HHEVKVHTWSBY7PVWC5390',
		category: 'Medical',
		tsKey: 'medical.CATEGORYNAME',
		tsNs: 'services',
	},
	{
		id: 'svct_01GW2HHEVMEF7DMG9WHP0JM2ZZ',
		category: 'Mental Health',
		tsKey: 'mental-health.CATEGORYNAME',
		tsNs: 'services',
	},
	{
		id: 'svct_01GW2HHEVPE008PHCPNHZDAWMS',
		category: 'Sports and Entertainment',
		tsKey: 'sports-and-entertainment.CATEGORYNAME',
		tsNs: 'services',
	},
	{
		id: 'svct_01GW2HHEVPFRQR07PTHMWJDDKS',
		category: 'Translation and Interpretation',
		tsKey: 'translation-and-interpretation.CATEGORYNAME',
		tsNs: 'services',
	},
	{
		id: 'svct_01GW2HHEVPXANJ6MPCDE0S4CWT',
		category: 'Transportation',
		tsKey: 'transportation.CATEGORYNAME',
		tsNs: 'services',
	},
] as const

export type ServiceCategory = (typeof serviceCategory)[number]
