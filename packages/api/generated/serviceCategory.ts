export const serviceCategory = [
	{
		id: 'svct_01GV23GR1B67943S6N7CSPXW7B',
		category: 'Abortion Care',
		tsKey: 'abortion-care.CATEGORYNAME',
		tsNs: 'services',
	},
	{
		id: 'svct_01GV23GR1CKCGBPSH6EQP1VVM0',
		category: 'Community Support',
		tsKey: 'community-support.CATEGORYNAME',
		tsNs: 'services',
	},
	{
		id: 'svct_01GV23GR1D203A51QKFYH9VP0A',
		category: 'Computers and Internet',
		tsKey: 'computers-and-internet.CATEGORYNAME',
		tsNs: 'services',
	},
	{
		id: 'svct_01GV23GR1DEMH3H68AQD8S000V',
		category: 'Education and Employment',
		tsKey: 'education-and-employment.CATEGORYNAME',
		tsNs: 'services',
	},
	{ id: 'svct_01GV23GR1EQ089KPNRY1FY7Z5G', category: 'Food', tsKey: 'food.CATEGORYNAME', tsNs: 'services' },
	{
		id: 'svct_01GV23GR1E85JEH185ZDZNP8DG',
		category: 'Housing',
		tsKey: 'housing.CATEGORYNAME',
		tsNs: 'services',
	},
	{
		id: 'svct_01GV23GR1FNYGEAC8SV2VXXM7F',
		category: 'Hygiene and Clothing',
		tsKey: 'hygiene-and-clothing.CATEGORYNAME',
		tsNs: 'services',
	},
	{ id: 'svct_01GV23GR1GD22N3PFJB7Q9RKV2', category: 'Legal', tsKey: 'legal.CATEGORYNAME', tsNs: 'services' },
	{
		id: 'svct_01GV23GR1HFE91VRDPZG7B12T3',
		category: 'Medical',
		tsKey: 'medical.CATEGORYNAME',
		tsNs: 'services',
	},
	{
		id: 'svct_01GV23GR1JTS9BBZJPB54DVSNK',
		category: 'Mental Health',
		tsKey: 'mental-health.CATEGORYNAME',
		tsNs: 'services',
	},
	{
		id: 'svct_01GV23GR1MQ59BRFY2QNG99NW6',
		category: 'Sports and Entertainment',
		tsKey: 'sports-and-entertainment.CATEGORYNAME',
		tsNs: 'services',
	},
	{
		id: 'svct_01GV23GR1MYVB1TKA54XTAZZ23',
		category: 'Translation and Interpretation',
		tsKey: 'translation-and-interpretation.CATEGORYNAME',
		tsNs: 'services',
	},
	{
		id: 'svct_01GV23GR1M1SRV2077NKY5V381',
		category: 'Transportation',
		tsKey: 'transportation.CATEGORYNAME',
		tsNs: 'services',
	},
	{ id: 'svct_01GV23GR1N82EGTNNVR7C8F9HT', category: 'Mail', tsKey: 'mail.CATEGORYNAME', tsNs: 'services' },
] as const

export type ServiceCategory = (typeof serviceCategory)[number]
