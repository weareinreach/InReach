export const serviceCategory = [
	{
		id: 'svct_01GTJ0VVVQTE8HGCJ7RWATDFF5',
		category: 'Abortion Care',
		tsKey: 'abortion-care.CATEGORYNAME',
		tsNs: 'services',
	},
	{
		id: 'svct_01GTJ0VVWX5VFB732C0566K3DD',
		category: 'Community Support',
		tsKey: 'community-support.CATEGORYNAME',
		tsNs: 'services',
	},
	{
		id: 'svct_01GTJ0VVXY3AXPQMASJB9M4QHH',
		category: 'Computers and Internet',
		tsKey: 'computers-and-internet.CATEGORYNAME',
		tsNs: 'services',
	},
	{
		id: 'svct_01GTJ0VVY808CZKQ69B5VD8T68',
		category: 'Education and Employment',
		tsKey: 'education-and-employment.CATEGORYNAME',
		tsNs: 'services',
	},
	{ id: 'svct_01GTJ0VVZR181201F6SN8DE2Z4', category: 'Food', tsKey: 'food.CATEGORYNAME', tsNs: 'services' },
	{
		id: 'svct_01GTJ0VW07PBZ7F2JYF696TNW8',
		category: 'Housing',
		tsKey: 'housing.CATEGORYNAME',
		tsNs: 'services',
	},
	{
		id: 'svct_01GTJ0VW1B2HSQ29YWBAG2BBV5',
		category: 'Hygiene and Clothing',
		tsKey: 'hygiene-and-clothing.CATEGORYNAME',
		tsNs: 'services',
	},
	{ id: 'svct_01GTJ0VW2DHAZNK220KG5P7REX', category: 'Legal', tsKey: 'legal.CATEGORYNAME', tsNs: 'services' },
	{ id: 'svct_01GTJ0VWBMZYWGZC9YFTTY0VXC', category: 'Mail', tsKey: 'mail.CATEGORYNAME', tsNs: 'services' },
	{
		id: 'svct_01GTJ0VW5CGEZRT16ACEV9Y3TR',
		category: 'Medical',
		tsKey: 'medical.CATEGORYNAME',
		tsNs: 'services',
	},
	{
		id: 'svct_01GTJ0VW7Z4PQAF0XBJJXNT7G0',
		category: 'Mental Health',
		tsKey: 'mental-health.CATEGORYNAME',
		tsNs: 'services',
	},
	{
		id: 'svct_01GTJ0VWA1AV9P87G2FH64CBF2',
		category: 'Sports and Entertainment',
		tsKey: 'sports-and-entertainment.CATEGORYNAME',
		tsNs: 'services',
	},
	{
		id: 'svct_01GTJ0VWACTERATYSD4G5V9EE1',
		category: 'Translation and Interpretation',
		tsKey: 'translation-and-interpretation.CATEGORYNAME',
		tsNs: 'services',
	},
	{
		id: 'svct_01GTJ0VWB3GZ9SJSVVSESX7A6Z',
		category: 'Transportation',
		tsKey: 'transportation.CATEGORYNAME',
		tsNs: 'services',
	},
] as const

export type ServiceCategory = (typeof serviceCategory)[number]
