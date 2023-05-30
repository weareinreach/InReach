export const serviceCategory = [
	{
		id: 'svct_01GSKV6QWAK72ZTDFVSNVJFDQ6',
		category: 'Abortion Care',
		tsKey: 'abortion-care.CATEGORYNAME',
		tsNs: 'services',
	},
	{
		id: 'svct_01GSKV6QXMBFAM7CDXNEMX3TBT',
		category: 'Community Support',
		tsKey: 'community-support.CATEGORYNAME',
		tsNs: 'services',
	},
	{
		id: 'svct_01GSKV6QYM131PBK9MEXF6AV35',
		category: 'Computers and Internet',
		tsKey: 'computers-and-internet.CATEGORYNAME',
		tsNs: 'services',
	},
	{
		id: 'svct_01GSKV6QYXRMGJNK7R5HZF7XYQ',
		category: 'Education and Employment',
		tsKey: 'education-and-employment.CATEGORYNAME',
		tsNs: 'services',
	},
	{ id: 'svct_01GSKV6R05KHWM7PDJ73M9M9JD', category: 'Food', tsKey: 'food.CATEGORYNAME', tsNs: 'services' },
	{
		id: 'svct_01GSKV6R0JBM43P1434A2GYX8E',
		category: 'Housing',
		tsKey: 'housing.CATEGORYNAME',
		tsNs: 'services',
	},
	{
		id: 'svct_01GSKV6R1HY3YE387REQJXCH0E',
		category: 'Hygiene and Clothing',
		tsKey: 'hygiene-and-clothing.CATEGORYNAME',
		tsNs: 'services',
	},
	{ id: 'svct_01GSKV6R2FXY78FQSWTPPQTCE4', category: 'Legal', tsKey: 'legal.CATEGORYNAME', tsNs: 'services' },
	{ id: 'svct_01GSKV6RAB1Z346J16WV29MQ8K', category: 'Mail', tsKey: 'mail.CATEGORYNAME', tsNs: 'services' },
	{
		id: 'svct_01GSKV6R520J9H61J6MYMZ21RS',
		category: 'Medical',
		tsKey: 'medical.CATEGORYNAME',
		tsNs: 'services',
	},
	{
		id: 'svct_01GSKV6R7ADHXMGQFKM5YYE5YS',
		category: 'Mental Health',
		tsKey: 'mental-health.CATEGORYNAME',
		tsNs: 'services',
	},
	{
		id: 'svct_01GSKV6R93766PAS3P6N06J30X',
		category: 'Sports and Entertainment',
		tsKey: 'sports-and-entertainment.CATEGORYNAME',
		tsNs: 'services',
	},
	{
		id: 'svct_01GSKV6R98D3JNNKWRHXMYHTPJ',
		category: 'Translation and Interpretation',
		tsKey: 'translation-and-interpretation.CATEGORYNAME',
		tsNs: 'services',
	},
	{
		id: 'svct_01GSKV6R9WRMQS5SFB29744ZHR',
		category: 'Transportation',
		tsKey: 'transportation.CATEGORYNAME',
		tsNs: 'services',
	},
] as const

export type ServiceCategory = (typeof serviceCategory)[number]
