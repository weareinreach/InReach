import { ApiOutput } from '@weareinreach/api'

export const searchResultsMock = [
	{
		id: 'orgn_01GSKV7YTJ3R4PM8SSHBZ72HX1',
		name: 'Org with 1 lead badge & 2 comm badge',
		slug: 'lyon-martin-health-services',
		description: {
			key: 'lyon-martin-health-services',
			ns: 'org-description',
		},
		attributes: [
			{
				tsKey: 'bipoc-led',
				tsNs: 'orgLeader',
			},
			{
				tsKey: 'bipoc-comm',
				tsNs: 'srvFocus',
			},
			{
				tsKey: 'gender-nc',
				tsNs: 'srvFocus',
			},
		],
		services: [
			{
				id: 'svct_01GSKV6R520J9H61J6MYMZ21RS',
				tsKey: 'medical.CATEGORYNAME',
				tsNs: 'services',
			},
			{
				id: 'svct_01GSKV6R7ADHXMGQFKM5YYE5YS',
				tsKey: 'mental-health.CATEGORYNAME',
				tsNs: 'services',
			},
		],
	},
	{
		id: 'orgn_01GSKV7ZYP2GDSH8PNJY3TVTYK',
		name: 'Org w/ no leader/comm badges',
		slug: 'whitman-walker-health',
		description: {
			key: 'whitman-walker-health',
			ns: 'org-description',
		},
		attributes: [],
		services: [
			{
				id: 'svct_01GSKV6R520J9H61J6MYMZ21RS',
				tsKey: 'medical.CATEGORYNAME',
				tsNs: 'services',
			},
			{
				id: 'svct_01GSKV6R7ADHXMGQFKM5YYE5YS',
				tsKey: 'mental-health.CATEGORYNAME',
				tsNs: 'services',
			},
			{
				id: 'svct_01GSKV6R2FXY78FQSWTPPQTCE4',
				tsKey: 'legal.CATEGORYNAME',
				tsNs: 'services',
			},
			{
				id: 'svct_01GSKV6QXMBFAM7CDXNEMX3TBT',
				tsKey: 'community-support.CATEGORYNAME',
				tsNs: 'services',
			},
		],
	},
	{
		id: 'orgn_01GSKV7YV30W3B6EWEF4SJSX9S',
		name: 'Org with no leader, 3 comm badges',
		slug: 'larkin-street-youth-services',
		description: {
			key: 'larkin-street-youth-services',
			ns: 'org-description',
		},
		attributes: [
			{
				tsKey: 'spanish-speakers',
				tsNs: 'srvFocus',
			},
			{
				tsKey: 'trans-masc',
				tsNs: 'srvFocus',
			},
			{
				tsKey: 'trans-fem',
				tsNs: 'srvFocus',
			},
		],
		services: [
			{
				id: 'svct_01GSKV6R0JBM43P1434A2GYX8E',
				tsKey: 'housing.CATEGORYNAME',
				tsNs: 'services',
			},
			{
				id: 'svct_01GSKV6QYXRMGJNK7R5HZF7XYQ',
				tsKey: 'education-and-employment.CATEGORYNAME',
				tsNs: 'services',
			},
			{
				id: 'svct_01GSKV6R1HY3YE387REQJXCH0E',
				tsKey: 'hygiene-and-clothing.CATEGORYNAME',
				tsNs: 'services',
			},
			{
				id: 'svct_01GSKV6R520J9H61J6MYMZ21RS',
				tsKey: 'medical.CATEGORYNAME',
				tsNs: 'services',
			},
			{
				id: 'svct_01GSKV6R7ADHXMGQFKM5YYE5YS',
				tsKey: 'mental-health.CATEGORYNAME',
				tsNs: 'services',
			},
		],
	},
	{
		id: 'orgn_01GSKV7YVNTF1REYZGTAPA9HP8',
		name: 'Org w/ 1 leader badge, 0 comm badges',
		slug: 'mission-neighborhood-health-center',
		description: {
			key: 'mission-neighborhood-health-center',
			ns: 'org-description',
		},
		attributes: [
			{
				tsKey: 'immigrant-led',
				tsNs: 'orgLeader',
			},
		],
		services: [
			{
				id: 'svct_01GSKV6R520J9H61J6MYMZ21RS',
				tsKey: 'medical.CATEGORYNAME',
				tsNs: 'services',
			},
			{
				id: 'svct_01GSKV6R7ADHXMGQFKM5YYE5YS',
				tsKey: 'mental-health.CATEGORYNAME',
				tsNs: 'services',
			},
		],
	},
] satisfies ApiOutput['organization']['getSearchDetails']
