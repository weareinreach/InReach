const US = [
	'ctry_01GW2HHDK9M26M80SG63T21SVH',
	'ctry_01GW2HHDK8HTCM0MWQXBJRXEYB',
	'ctry_01GW2HHDKBRDF1DMR5DA9DAT7K',
	'ctry_01GW2HHDK67GZQVGA3NZ8PE5SS',
	'ctry_01GW2HHDKCRS9KW4FG2WR2GG06',
	'ctry_01GW2HHDKFJ4Q7PBTTN4GSMPV0',
	'ctry_01GW2HHDKGZ2XQ8Q9D8GX564MJ',
	'ctry_01GW2HHDK7PACTC9GJ2XBMVPKY',
	'ctry_01GW2HHDK9DG12Y7RQMVEE5XSQ',
]
const CA = ['ctry_01GW2HHDKAWXWYHAAESAA5HH94']
const MX = ['ctry_01GW2HHDKB9DG2T2YZM5MFFVX9']

export const data: Data[] = [
	{
		orgId: 'orgn_01H29CX1TRDGZZ73ETGHRN910M',
		orgName: '988 Suicide and Crisis Lifeline',
		description:
			"If you're thinking about suicide, are worried about a friend or loved one, or would like emotional support, the Lifeline network is available 24/7 across the United States.",
		svcId: 'osvc_01H6PKD58K02BF1H6F1THZN3PZ',
		servAreaId: 'svar_01H6PMM595430XJD1J5JTP2C9Y',
		svcAcc: [
			{
				id: 'atts_01H6PKZ9ZRRBVNN3E76NAQ2F0F',
				access_type: 'phone',
				access_value: '988',
				description: 'hotline for english speakers (24/7)',
				descriptionId: 'ftxt_01H6PMVZ44JYCWH23QN2MBXY8S',
			},
			{
				id: 'atts_01H6PKZ9ZSCZZFK8DH7T2774BS',
				access_type: 'sms',
				access_value: '988',
				description: 'sms for english speakers (24/7)',
				descriptionId: 'ftxt_01H6PMYWVW58EWEZ3M1D1X8SP2',
			},
			{
				id: 'atts_01H6PKZ9ZS4K3AD435F367CHJP',
				access_type: 'phone',
				access_value: '8886289454',
				description: 'hotline spanish speakers (en español) (24/7)',
				descriptionId: 'ftxt_01H6PMYXCSPS6J1B2G8MBA4S2E',
			},
		],
		communityTagId: 'attr_01H6P8T277D0C8HFQA6N09FJWD',
		ftDescId: 'ftxt_01H6PMNQ5YQX5YDX884NVFW51X',
		countries: US,
	},
	{
		orgId: 'orgn_01H6PFMSPGG8FAJC32D97PMHQE',
		orgName: 'LGBT National Hotline',
		description:
			'The LGBT National Hotline provides a confidential safe space where callers of any age can speak about sexual orientation or gender identity/expression issues.',
		ftDescId: 'ftxt_01H6PMNQ5YFP2RJVNZA9QBNRJ1',
		communityTagId: 'attr_01H6P8T277D0C8HFQA6N09FJWD',
		servAreaId: 'svar_01H6PMM596N688R9KWX0CARQV1',
		svcId: 'osvc_01H6PKD58K1XCFP2D7QXNPDB14',
		svcAcc: [
			{
				id: 'atts_01H6PN3E5AESF853RAH59JB7XT',
				access_type: 'phone',
				access_value: '8888434564',
				description: 'hotline (mon-fri 4pm-12am & sat 12pm-5pm est)',
				descriptionId: 'ftxt_01H6PN4NWCBCGE1AA25DCGRKBV',
			},
		],
		countries: US,
	},
	{
		orgId: 'orgn_01GVH3VAZZ9QX30X2MYM5R71SH',
		orgName: 'BlackLine',
		description:
			'BlackLine provides a space for peer support and counseling, reporting of mistreatment, and affirming the lived experiences to folxs who are most impacted by systemic oppression with an LGBTQ+ Black Femme Lens.',
		ftDescId: 'ftxt_01H6PMNQ5ZCBBWVWQEAG9PZCGN',
		communityTagId: 'attr_01GW2HHFVN72D7XEBZZJXCJQXQ',
		servAreaId: 'svar_01H6PMM596ASZT8ZNJ2JTK8BSA',
		svcId: 'osvc_01H6PKD58MB0KW16KMSSR1SYYJ',
		svcAcc: [
			{
				id: 'atts_01H6PN84RFP01RTQKA4YRNGGSG',
				access_type: 'phone',
				access_value: '8006045841',
				description: 'hotline (24/7)',
				descriptionId: 'ftxt_01H6PN94CD7MGX404RPMKDNYV0',
			},
		],
		countries: US,
	},
	{
		orgId: 'orgn_01GVH3V4BHVEYSTF9AY2RYCMP5',
		orgName: 'Trans Lifeline',
		description:
			"Trans Lifeline's Hotline is a peer support phone service run by trans people for trans and questioning people. Call them if you need someone trans to talk to, even if you're not in crisis or if you're not sure you're trans.",
		ftDescId: 'ftxt_01H6PMNQ5ZKBZA54P3X49HJBX8',
		communityTagId: 'attr_01GW2HHFVPSYBCYF37B44WP6CZ',
		servAreaId: 'svar_01H6PMM596GPESESJ3B8VGR1YT',
		svcId: 'osvc_01H6PKD58M5HT9MEANJKKR304Q',
		svcAcc: [
			{
				id: 'atts_01H6PNCHJCWE8PHEJPZHP2VBXM',
				access_type: 'phone',
				access_value: '8775658860',
				description: 'hotline (24/7)',
				descriptionId: 'ftxt_01H6PNCJFQZ936CKA96FBSE5GQ',
			},
		],
		countries: [...US, ...CA],
	},
	{
		orgId: 'orgn_01GVH3V3SYFJEYC2Y8QZ28V9FQ',
		orgName: 'The Trevor Project',
		description:
			'The Trevor Project provides 24/7 crisis support services to LGBTQ young people. Text, chat, or call anytime to reach a trained counselor.',
		communityTagId: 'attr_01GW2HHFVQCZPA3Z5GW6J3MQHW',
		ftDescId: 'ftxt_01H6PMNQ5ZNJ89YJM071ERTTH7',
		servAreaId: 'svar_01H6PMM5962A5XWRTX5JHRS4K4',
		svcId: 'osvc_01H6PKD58MA73WWVR1WJ7XZQ8N',
		svcAcc: [
			{
				id: 'atts_01H6PNGB7E1K5915253CG2CSY1',
				access_type: 'phone',
				access_value: '8664887386',
				description: 'hotline (24/7)',
				descriptionId: 'ftxt_01H6PNGBWDAZPPEP4CMDXN3EA8',
			},
		],
		countries: US,
	},
	{
		orgId: 'orgn_01GVH3V3SYFJEYC2Y8QZ28V9FQ',
		orgName: 'The Trevor Project',
		description:
			"The Trevor Project provides information and support to LGBTQ+ youth 24/7, every day of the year, throughout Mexico. Services are 100% free and confidential. Contact the Trevor Project's trained crisis counselors in Mexico 24/7 via the information below.",
		communityTagId: 'attr_01GW2HHFVQCZPA3Z5GW6J3MQHW',
		ftDescId: 'ftxt_01H6PQGGZVXSXMCDR44CAMYN4T',
		servAreaId: 'svar_01H6PQH1AQS07GHPM3XZC1JS14',
		svcId: 'osvc_01H6PQGS55V1ERST7E0KJB98Q3',
		svcAcc: [
			{
				id: 'atts_01H6PQPFNXWXPDCEA8NDNF81B7',
				access_type: 'link',
				access_value: 'https://thetrevorproject.mx/Ayuda',
				description: 'online chat (24/7)',
				descriptionId: 'ftxt_01H6PQR8VKZA6SN9YRF1C0DJWD',
			},
			{
				id: 'atts_01H6PQHNWS0AH8AD8FD33ZWHX5',
				access_type: 'whatsapp',
				access_value: '+5592253337',
				description: 'whatsapp in mexico (24/7)',
				descriptionId: 'ftxt_01H6PQHMECVXB42D9T8CEYXHMJ',
			},
			{
				id: 'atts_01H6PQRQ184NRH6N7TZSDX91GV',
				access_type: 'sms',
				access_value: '67676',
				sms_body: 'Comenzar',
				description: 'sms in mexico (24/7)',
				descriptionId: 'ftxt_01H6PQTAC03K1E55DBARC4A700',
			},
		],
		countries: MX,
	},
	{
		orgId: 'orgn_01GVXXKS098AD03KRV5MRVNAAS',
		orgName: 'SAGE',
		description:
			'SAGE connects LGBTQ+ older people who want to talk with friendly, certified crisis responders who are ready to listen. The SAGE LGBTQ+ Elder Hotline is available 24 hours a day, 7 days a week, in English and Spanish, with translation in 180 languages.',
		ftDescId: 'ftxt_01H6PMNQ5ZE9N519V00FMN92PB',
		communityTagId: 'attr_01H6P951P0V3CR807P8KRH82S1',
		servAreaId: 'svar_01H6PMM596RVBDAX2J2CDF08F1',
		svcId: 'osvc_01H6PKD58MYHEA2XAWSYH805H1',
		svcAcc: [
			{
				id: 'atts_01H6PNKFK8NM46PE05T0SN3BD7',
				access_type: 'phone',
				access_value: '8773605428',
				description: 'hotline (24/7)',
				descriptionId: 'ftxt_01H6PNKG4TCWHFN02W32TJBNN8',
			},
		],
		countries: US,
	},
	{
		orgId: 'orgn_01H6PQ07W414JAWCEN619FQ77W',
		orgName: 'Kids Help Phone',
		description:
			"Kids Help Phone is Canada's only 24/7 e-mental health service offering free, confidential support to young people in English and French. Kids Help Phone is here for 2SLGBTQ+ youth from coast to coast to coast 365 days a year.",
		ftDescId: 'ftxt_01H6PQ39AGTTG7S0601HRW8EGZ',
		communityTagId: 'attr_01GW2HHFVQCZPA3Z5GW6J3MQHW',
		servAreaId: 'svar_01H6PQ6S817TMPA462V1X1YZFK',
		svcId: 'osvc_01H6PQ75E8THP2ZK08RHHB6X02',
		countries: CA,
		svcAcc: [
			{
				id: 'atts_01H6PQ7YC72VJ3HRS6NVMF9NQE',
				access_type: 'sms',
				access_value: '686868',
				sms_body: 'CONNECT',
				description: 'sms in canada (24/7)',
				descriptionId: 'ftxt_01H6PQ806K8Q6T3DRE997XBXGJ',
			},
		],
	},
]

interface Data {
	orgId: string
	orgName: string
	description: string
	ftDescId: string
	svcId: string
	servAreaId: string
	svcAcc: {
		id: string
		access_type: 'link' | 'phone' | 'email' | 'sms' | 'whatsapp'
		access_value: string
		sms_body?: string
		description: string
		descriptionId: string
	}[]
	communityTagId: string
	countries: string[]
}
