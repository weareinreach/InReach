import { ApiOutput } from '@weareinreach/api'

export const searchResultsMock = [
	{
		id: 'orgn_01GSKV7YTJ3R4PM8SSHBZ72HX1',
		name: 'Org with 1 lead badge & 2 comm badge',
		slug: 'lyon-martin-health-services',
		description: {
			key: 'lyon-martin-health-services.description',
			ns: 'org-data',
			text: 'Lyon-Martin Health Services provides health care to heterosexual women, bisexual women, lesbians and transgender people in a safe and caring environment, with sensitivity to sexual orientation and gender identity. All services are offered regardless of ability to pay. Lyon-Martin Health Services continues to provide primary and preventive healthcare, mental health services and HIV services to all women, including low-income and uninsured, and transgender people.',
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
			key: 'whitman-walker-health.description',
			ns: 'org-data',
			text: "Whitman-Walker Health's mission is to offer affirming community-based health and wellness services to all with a special expertise in LGBTQ and HIV care. They empower all persons to live healthy, love openly, and achieve equality and inclusion. Through multiple locations throughout DC, they provide stigma-free care to anyone who walks through our doors. They are proud and honored to be a place where the gay, lesbian, bisexual, transgender and queer communities, as well to those living with or affected by HIV feel supported, welcomed and respected. They strive to be a place where they see the person first; a healthcare home where you will be treated with the dignity, respect and love.",
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
			key: 'larkin-street-youth-services.description',
			ns: 'org-data',
			text: "Larkin Street Youth Services' vision is to end homelessness for young people permanently by providing comprehensive services that meet young peoples’ needs, while encouraging them to access Larkin Street's services when and how they feel comfortable. This helps Larkin Street's young people take charge of their own lives, developing long-lasting self-sufficiency while building trust in themselves and Larkin Street's staff.",
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
			key: 'mission-neighborhood-health-center.description',
			ns: 'org-data',
			text: 'Mission Neighborhood Health Center provides affordable healthcare on a sliding fee scale based on a patient’s income and family size. No one is denied care due to inability to pay or lack of insurance. They honor their Latino roots with a tradition of providing compassionate, patient-centered care.  They advocate for health equity and deliver many innovative, high quality services responsive to the neighborhoods and diverse communities they serve.',
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
