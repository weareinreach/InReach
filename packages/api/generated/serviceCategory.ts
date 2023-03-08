export const serviceCategory = [
	{
		id: 'svct_01GV0TJNGMDKYQA0MGKARWG4SQ',
		category: 'Abortion Care',
		tsKey: 'abortion-care.CATEGORYNAME',
		tsNs: 'services',
	},
	{
		id: 'svct_01GV0TJNGN9CW9DQWQ9VN21780',
		category: 'Community Support',
		tsKey: 'community-support.CATEGORYNAME',
		tsNs: 'services',
	},
	{
		id: 'svct_01GV0TJNGP1Y513YY0DY7P2DQA',
		category: 'Computers and Internet',
		tsKey: 'computers-and-internet.CATEGORYNAME',
		tsNs: 'services',
	},
	{
		id: 'svct_01GV0TJNGPQ05J2GX94SG95YG5',
		category: 'Education and Employment',
		tsKey: 'education-and-employment.CATEGORYNAME',
		tsNs: 'services',
	},
	{ id: 'svct_01GV0TJNGQPZ2VYRTY0MSYNDX6', category: 'Food', tsKey: 'food.CATEGORYNAME', tsNs: 'services' },
	{
		id: 'svct_01GV0TJNGQSB2N07SM3DJYFP60',
		category: 'Housing',
		tsKey: 'housing.CATEGORYNAME',
		tsNs: 'services',
	},
	{
		id: 'svct_01GV0TJNGRBDQ7J8XVZBFC5H1D',
		category: 'Hygiene and Clothing',
		tsKey: 'hygiene-and-clothing.CATEGORYNAME',
		tsNs: 'services',
	},
	{ id: 'svct_01GV0TJNGS92F6XKDVEKFD71Y1', category: 'Legal', tsKey: 'legal.CATEGORYNAME', tsNs: 'services' },
	{
		id: 'svct_01GV0TJNGVP4GS12JNQ93W7A91',
		category: 'Medical',
		tsKey: 'medical.CATEGORYNAME',
		tsNs: 'services',
	},
	{
		id: 'svct_01GV0TJNGWCY4C7JEFASTZWCKR',
		category: 'Mental Health',
		tsKey: 'mental-health.CATEGORYNAME',
		tsNs: 'services',
	},
	{
		id: 'svct_01GV0TJNGXX49YD78VYGGF9WNF',
		category: 'Sports and Entertainment',
		tsKey: 'sports-and-entertainment.CATEGORYNAME',
		tsNs: 'services',
	},
	{
		id: 'svct_01GV0TJNGXMYBD3932VYWNZ67P',
		category: 'Translation and Interpretation',
		tsKey: 'translation-and-interpretation.CATEGORYNAME',
		tsNs: 'services',
	},
	{
		id: 'svct_01GV0TJNGYTCC8SMJ2SX6R980W',
		category: 'Transportation',
		tsKey: 'transportation.CATEGORYNAME',
		tsNs: 'services',
	},
	{ id: 'svct_01GV0TJNGYCM8MVKZ0H8RSK842', category: 'Mail', tsKey: 'mail.CATEGORYNAME', tsNs: 'services' },
] as const

export type ServiceCategory = (typeof serviceCategory)[number]
