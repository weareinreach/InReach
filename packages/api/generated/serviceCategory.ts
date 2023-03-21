export const serviceCategory = [
	{
		id: 'svct_01GW0PY4W6E0161FEQ7YT0762W',
		category: 'Abortion Care',
		tsKey: 'abortion-care.CATEGORYNAME',
		tsNs: 'services',
	},
	{
		id: 'svct_01GW0PY4W8137SRR09DXM1ZH3P',
		category: 'Community Support',
		tsKey: 'community-support.CATEGORYNAME',
		tsNs: 'services',
	},
	{
		id: 'svct_01GW0PY4W9SP048554QRXRTCDP',
		category: 'Computers and Internet',
		tsKey: 'computers-and-internet.CATEGORYNAME',
		tsNs: 'services',
	},
	{
		id: 'svct_01GW0PY4W9JVBGXZ50KH150T0F',
		category: 'Education and Employment',
		tsKey: 'education-and-employment.CATEGORYNAME',
		tsNs: 'services',
	},
	{ id: 'svct_01GW0PY4WAGVNYV15G2DTA2282', category: 'Food', tsKey: 'food.CATEGORYNAME', tsNs: 'services' },
	{
		id: 'svct_01GW0PY4WBG50WR1SY0SB9W3XG',
		category: 'Housing',
		tsKey: 'housing.CATEGORYNAME',
		tsNs: 'services',
	},
	{
		id: 'svct_01GW0PY4WC6P6RTGT2E4GPNHAP',
		category: 'Hygiene and Clothing',
		tsKey: 'hygiene-and-clothing.CATEGORYNAME',
		tsNs: 'services',
	},
	{ id: 'svct_01GW0PY4WDP4BMH37GP5KR65FV', category: 'Legal', tsKey: 'legal.CATEGORYNAME', tsNs: 'services' },
	{
		id: 'svct_01GW0PY4WFCB6A3KB1YY2HXK6C',
		category: 'Medical',
		tsKey: 'medical.CATEGORYNAME',
		tsNs: 'services',
	},
	{
		id: 'svct_01GW0PY4WG5BBDBTC5QNENF88M',
		category: 'Mental Health',
		tsKey: 'mental-health.CATEGORYNAME',
		tsNs: 'services',
	},
	{
		id: 'svct_01GW0PY4WJN71HXR862X9DWDH3',
		category: 'Sports and Entertainment',
		tsKey: 'sports-and-entertainment.CATEGORYNAME',
		tsNs: 'services',
	},
	{
		id: 'svct_01GW0PY4WJZV16ADDG2X4HNH7X',
		category: 'Translation and Interpretation',
		tsKey: 'translation-and-interpretation.CATEGORYNAME',
		tsNs: 'services',
	},
	{
		id: 'svct_01GW0PY4WJSX5RW9T0AXNM9H9X',
		category: 'Transportation',
		tsKey: 'transportation.CATEGORYNAME',
		tsNs: 'services',
	},
	{ id: 'svct_01GW0PY4WKRM516Z5PTEZ1W1FE', category: 'Mail', tsKey: 'mail.CATEGORYNAME', tsNs: 'services' },
] as const

export type ServiceCategory = (typeof serviceCategory)[number]
