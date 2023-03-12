export const serviceCategory = [
	{
		id: 'svct_01GVBN0W7H6Q8R551BM6S9PE5Q',
		category: 'Abortion Care',
		tsKey: 'abortion-care.CATEGORYNAME',
		tsNs: 'services',
	},
	{
		id: 'svct_01GVBN0W7JAE190SXEEBWQW08X',
		category: 'Community Support',
		tsKey: 'community-support.CATEGORYNAME',
		tsNs: 'services',
	},
	{
		id: 'svct_01GVBN0W7MA8ER0HDK4NPZN4G2',
		category: 'Computers and Internet',
		tsKey: 'computers-and-internet.CATEGORYNAME',
		tsNs: 'services',
	},
	{
		id: 'svct_01GVBN0W7MBEHFN1YNG3X67JJE',
		category: 'Education and Employment',
		tsKey: 'education-and-employment.CATEGORYNAME',
		tsNs: 'services',
	},
	{ id: 'svct_01GVBN0W7PB0SB4J34QJJ66GTX', category: 'Food', tsKey: 'food.CATEGORYNAME', tsNs: 'services' },
	{
		id: 'svct_01GVBN0W7P0Q3Q5MVZM9ZAJ8WF',
		category: 'Housing',
		tsKey: 'housing.CATEGORYNAME',
		tsNs: 'services',
	},
	{
		id: 'svct_01GVBN0W7QAW7VBFTPYXBF8HGY',
		category: 'Hygiene and Clothing',
		tsKey: 'hygiene-and-clothing.CATEGORYNAME',
		tsNs: 'services',
	},
	{ id: 'svct_01GVBN0W7RKY8XVWCTVXJ1WZYW', category: 'Legal', tsKey: 'legal.CATEGORYNAME', tsNs: 'services' },
	{
		id: 'svct_01GVBN0W7VTP6FE4WEMSK628V5',
		category: 'Medical',
		tsKey: 'medical.CATEGORYNAME',
		tsNs: 'services',
	},
	{
		id: 'svct_01GVBN0W7W8A49FEGSA845XBM3',
		category: 'Mental Health',
		tsKey: 'mental-health.CATEGORYNAME',
		tsNs: 'services',
	},
	{
		id: 'svct_01GVBN0W7Y8VYBS6RXEQRQQQTW',
		category: 'Sports and Entertainment',
		tsKey: 'sports-and-entertainment.CATEGORYNAME',
		tsNs: 'services',
	},
	{
		id: 'svct_01GVBN0W7Z32QTPW6NP0GYYS1G',
		category: 'Translation and Interpretation',
		tsKey: 'translation-and-interpretation.CATEGORYNAME',
		tsNs: 'services',
	},
	{
		id: 'svct_01GVBN0W7ZXED4249QHXJ5XCCT',
		category: 'Transportation',
		tsKey: 'transportation.CATEGORYNAME',
		tsNs: 'services',
	},
	{ id: 'svct_01GVBN0W80DQ2TN5V6NA4BDMZ4', category: 'Mail', tsKey: 'mail.CATEGORYNAME', tsNs: 'services' },
] as const

export type ServiceCategory = (typeof serviceCategory)[number]
