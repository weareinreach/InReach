import { ApiOutput } from '@weareinreach/api'

export const searchResultsMock = {
	orgs: [
		{
			id: 'orgn_01GVH3V43QAKQH440MP6TWWD0X',
			name: 'The George Washington University Immigration Clinic',
			slug: 'the-george-washington-university-immigration-clinic',
			description: {
				key: 'the-george-washington-university-immigration-clinic.description',
				ns: 'org-data',
				text: 'The George Washington University Immigration Clinic represents clients from around the world on immigration law matters, including removal proceedings and petitions for affirmative asylum. The clinic accepts removal cases scheduled in the Arlington Immigration Court and affirmative asylum cases, as well as deportation or removal proceedings involving cancellation of removal, temporary protected status, or criminal issues.',
			},
			serviceCategories: [
				{ id: 'svct_01GW2HHEVH75KPRYKD49EJHYXX', tsKey: 'legal.CATEGORYNAME', tsNs: 'services' },
			],
			orgLeader: [
				{
					tsKey: 'orgleader.bipoc-led',
					icon: '🤎',
					iconBg: '#F1DD7F',
					id: '',
					category: {
						tag: 'organization-leadership',
					},
				},
			],
			orgFocus: [
				{
					tsKey: 'srvfocus.bipoc-comm',
					icon: '️‍️‍✊🏿',
					iconBg: null,
					id: '',
					category: {
						tag: 'organization-focus',
					},
				},
				{
					tsKey: 'srvfocus.gender-nc',
					icon: '🏳️‍⚧️',
					iconBg: null,
					id: '',
					category: {
						tag: 'organization-focus',
					},
				},
			],
			locations: ['Washington'],
			distance: 8.52,
			unit: 'mi',
		},
		{
			id: 'orgn_01GVH3V43VTXXF9FET8M5J2GNA',
			name: 'Ayuda',
			slug: 'ayuda',
			description: {
				key: 'ayuda.description',
				ns: 'org-data',
				text: 'Ayuda advocates for and defends the legal and human rights of low-income immigrants living in Washington, DC, Maryland, and Virginia. Ayuda provides legal, social, and language services to help low-income immigrants access justice and transform their lives. Ayuda’s expert and dedicated professionals help immigrants from anywhere in the world navigate the immigration and justice systems and access the social safety net. Their comprehensive and welcoming approach breaks down barriers, helps those in need, and makes the community stronger.',
			},
			serviceCategories: [
				{ id: 'svct_01GW2HHEVMEF7DMG9WHP0JM2ZZ', tsKey: 'mental-health.CATEGORYNAME', tsNs: 'services' },
				{ id: 'svct_01GW2HHEVH75KPRYKD49EJHYXX', tsKey: 'legal.CATEGORYNAME', tsNs: 'services' },
				{
					id: 'svct_01GW2HHEVPFRQR07PTHMWJDDKS',
					tsKey: 'translation-and-interpretation.CATEGORYNAME',
					tsNs: 'services',
				},
			],
			orgLeader: [],
			orgFocus: [],
			locations: ['Washington ', 'Fairfax', 'Silver Spring'],
			distance: 8.75,
			unit: 'mi',
		},
		{
			id: 'orgn_01GVH3V44AQG32G6119BCJDTX0',
			name: 'National Center for Lesbian Rights (NCLR)',
			slug: 'national-center-for-lesbian-rights-nclr',
			description: {
				key: 'national-center-for-lesbian-rights-nclr.description',
				ns: 'org-data',
				text: 'National Center for Lesbian Rights (NCLR) is a legal organization committed to advancing the civil and human rights of lesbian, gay, bisexual, and transgender people and their families through litigation, legislation, policy, and public education. NCLR offers free legal help to LGBTQ asylum seekers and immigrants. They advocate for equitable public policies that affect the LGBTQ community, provide free legal services, and provide community education on LGBTQ issues.',
			},
			serviceCategories: [
				{
					id: 'svct_01GW2HHEVCXGK9GPK6SAZ2Q7E3',
					tsKey: 'community-support.CATEGORYNAME',
					tsNs: 'services',
				},
				{ id: 'svct_01GW2HHEVH75KPRYKD49EJHYXX', tsKey: 'legal.CATEGORYNAME', tsNs: 'services' },
			],
			orgLeader: [],
			orgFocus: [],
			locations: ['Washington DC', 'San Francisco'],
			distance: 8.84,
			unit: 'mi',
		},
		{
			id: 'orgn_01GVH3V3S8ZFWWNVC4V5J71PAZ',
			name: 'Upwardly Global',
			slug: 'upwardly-global',
			description: {
				key: 'upwardly-global.description',
				ns: 'org-data',
				text: 'Upwardly Global (UpGlo) helps work-authorized immigrants, refugees, asylees, and Special Immigrant Visa holders (SIVs) restart or start their professional careers in the United States.',
			},
			serviceCategories: [
				{
					id: 'svct_01GW2HHEVDX898ZT0QGM471WMV',
					tsKey: 'education-and-employment.CATEGORYNAME',
					tsNs: 'services',
				},
			],
			orgLeader: [],
			orgFocus: [],
			locations: ['Washington', 'New York', 'Chicago', 'San Francisco'],
			distance: 8.9,
			unit: 'mi',
		},
		{
			id: 'orgn_01GVH3V446G607JE4V8YJQ2XEE',
			name: "Capital Area Immigrants' Rights (CAIR) Coalition",
			slug: 'capital-area-immigrants-rights-cair-coalition',
			description: {
				key: 'capital-area-immigrants-rights-cair-coalition.description',
				ns: 'org-data',
				text: 'The Capital Area Immigrants’ Rights (CAIR) Coalition strives to ensure equal justice for all immigrant adults and children at risk of detention and deportation in the Capital region and beyond through direct legal representation, know your rights presentations, impact litigation, advocacy, and the enlistment and training of attorneys to defend immigrants. CAIR provides free immigration legal assistance for all immigrant men, women, and children at risk of detention and deportation in the DC metropolitan area and beyond.',
			},
			serviceCategories: [
				{ id: 'svct_01GW2HHEVH75KPRYKD49EJHYXX', tsKey: 'legal.CATEGORYNAME', tsNs: 'services' },
			],
			orgLeader: [],
			orgFocus: [
				{
					tsKey: 'srvfocus.spanish-speakers',
					icon: '🗣️',
					iconBg: null,
					id: '',
					category: {
						tag: 'organization-focus',
					},
				},
				{
					tsKey: 'srvfocus.trans-masc',
					icon: '🏳️‍⚧️',
					iconBg: null,
					id: '',
					category: {
						tag: 'organization-focus',
					},
				},
				{
					tsKey: 'srvfocus.trans-fem',
					icon: '🏳️‍⚧️',
					iconBg: null,
					id: '',
					category: {
						tag: 'organization-focus',
					},
				},
			],
			locations: ['Washington', 'Washington, DC ', 'Baltimore'],
			distance: 9.04,
			unit: 'mi',
		},
		{
			id: 'orgn_01GVH3V408N0YS7CDYAH3F2BMH',
			name: 'Whitman-Walker Health',
			slug: 'whitman-walker-health',
			description: {
				key: 'whitman-walker-health.description',
				ns: 'org-data',
				text: "Whitman-Walker Health's mission is to offer affirming community-based health and wellness services to all with a special expertise in LGBTQ and HIV care. They empower all persons to live healthy, love openly, and achieve equality and inclusion. Through multiple locations throughout DC, they provide stigma-free care to anyone who walks through our doors. They are proud and honored to be a place where the gay, lesbian, bisexual, transgender and queer communities, as well to those living with or affected by HIV feel supported, welcomed and respected. They strive to be a place where they see the person first; a healthcare home where you will be treated with the dignity, respect and love.",
			},
			serviceCategories: [
				{ id: 'svct_01GW2HHEVKVHTWSBY7PVWC5390', tsKey: 'medical.CATEGORYNAME', tsNs: 'services' },
				{ id: 'svct_01GW2HHEVH75KPRYKD49EJHYXX', tsKey: 'legal.CATEGORYNAME', tsNs: 'services' },
				{ id: 'svct_01GW2HHEVMEF7DMG9WHP0JM2ZZ', tsKey: 'mental-health.CATEGORYNAME', tsNs: 'services' },
				{
					id: 'svct_01GW2HHEVCXGK9GPK6SAZ2Q7E3',
					tsKey: 'community-support.CATEGORYNAME',
					tsNs: 'services',
				},
			],
			orgLeader: [],
			orgFocus: [],
			locations: ['Washington'],
			distance: 9.13,
			unit: 'mi',
		},
		{
			id: 'orgn_01GVH3V43ZWVSZA5046E3YD5YX',
			name: 'The Wanda Alston Foundation',
			slug: 'the-wanda-alston-foundation',
			description: {
				key: 'the-wanda-alston-foundation.description',
				ns: 'org-data',
				text: "The Wanda Alston Foundation (WAF) is the only housing nonprofit in Washington, D.C. that is solely dedicated to offering pre-independent transitional living and support services to homeless or at-risk LGBTQ youth ages 16-24. The foundation consists of two separate transitional housing programs, Wanda's House and Alston's Place. WAF's mission is to eradicate homelessness and poverty for LGBTQ youth ages 18 to 24, and provides services in the areas of long-term transitional living (up to 18 months), on-site 24/7 staff, case management, educational guidance and support, job training and guidance, and support service referrals.",
			},
			serviceCategories: [
				{
					id: 'svct_01GW2HHEVDKRVB42KT85KA3FM3',
					tsKey: 'computers-and-internet.CATEGORYNAME',
					tsNs: 'services',
				},
				{ id: 'svct_01GW2HHEVF8W7D67CH3NVSQYA6', tsKey: 'housing.CATEGORYNAME', tsNs: 'services' },
				{
					id: 'svct_01GW2HHEVDX898ZT0QGM471WMV',
					tsKey: 'education-and-employment.CATEGORYNAME',
					tsNs: 'services',
				},
				{ id: 'svct_01GW2HHEVMEF7DMG9WHP0JM2ZZ', tsKey: 'mental-health.CATEGORYNAME', tsNs: 'services' },
			],
			orgLeader: [],
			orgFocus: [],
			locations: ['Washington'],
			distance: 9.34,
			unit: 'mi',
		},
		{
			id: 'orgn_01GVH3V43M2WBQ1RHDVT4CF58M',
			name: 'Human Rights First',
			slug: 'human-rights-first',
			description: {
				key: 'human-rights-first.description',
				ns: 'org-data',
				text: 'Human Rights First is an independent advocacy and action organization that helps people living in the greater Washington, D.C., New York City, and Houston metropolitan areas who do not already have legal representation, cannot afford an attorney, and need help with a claim for asylum or other protection-based form of immigration status. Their New York and Houston offices can also help people who are seeking asylum from within a nearby immigration detention center.',
			},
			serviceCategories: [
				{ id: 'svct_01GW2HHEVH75KPRYKD49EJHYXX', tsKey: 'legal.CATEGORYNAME', tsNs: 'services' },
			],
			orgLeader: [],
			orgFocus: [],
			locations: ['Washington', 'New York', 'Los Angeles'],
			distance: 9.41,
			unit: 'mi',
		},
		{
			id: 'orgn_01GVH3V442E4QSM849J47CJWDJ',
			name: 'SMYAL',
			slug: 'smyal',
			description: {
				key: 'smyal.description',
				ns: 'org-data',
				text: 'SMYAL (Supporting and Mentoring Youth Advocates and Leaders) supports and empowers lesbian, gay, bisexual, transgender, and questioning (LGBTQ) youth in the Washington, DC, metropolitan region. Through youth leadership, SMYAL creates opportunities for LGBTQ youth to build self-confidence, develop critical life skills, and engage their peers and community through service and advocacy. Committed to social change, SMYAL builds, sustains, and advocates for programs, policies, and services that LGBTQ youth need as they grow into adulthood.',
			},
			serviceCategories: [
				{
					id: 'svct_01GW2HHEVCXGK9GPK6SAZ2Q7E3',
					tsKey: 'community-support.CATEGORYNAME',
					tsNs: 'services',
				},
				{
					id: 'svct_01GW2HHEVDX898ZT0QGM471WMV',
					tsKey: 'education-and-employment.CATEGORYNAME',
					tsNs: 'services',
				},
				{ id: 'svct_01GW2HHEVF8W7D67CH3NVSQYA6', tsKey: 'housing.CATEGORYNAME', tsNs: 'services' },
				{ id: 'svct_01GW2HHEVKVHTWSBY7PVWC5390', tsKey: 'medical.CATEGORYNAME', tsNs: 'services' },
				{ id: 'svct_01GW2HHEVMEF7DMG9WHP0JM2ZZ', tsKey: 'mental-health.CATEGORYNAME', tsNs: 'services' },
			],
			orgLeader: [
				{
					tsKey: 'orgleader.immigrant-led',
					icon: '️‍️‍🌎',
					iconBg: '#79ADD7',
					id: '',
					category: {
						tag: 'organization-leadership',
					},
				},
			],
			orgFocus: [],
			locations: ['Washington'],
			distance: 9.74,
			unit: 'mi',
		},
		{
			id: 'orgn_01GVH3V40BD8DYPDG81EKBMCB7',
			name: 'The DC Center for the LGBT Community',
			slug: 'the-dc-center-for-the-lgbt-community',
			description: {
				key: 'the-dc-center-for-the-lgbt-community.description',
				ns: 'org-data',
				text: 'The DC Center for the LGBT Community educates, empowers, celebrates, and connects the lesbian, gay, bisexual, and transgender communities by focusing on four core areas: health and wellness, arts and culture, social and peer support, and advocacy and community building. They envision communities where LGBT people feel healthy, safe, and affirmed.',
			},
			serviceCategories: [
				{
					id: 'svct_01GW2HHEVGD7CE9VKYVSZYYTPS',
					tsKey: 'hygiene-and-clothing.CATEGORYNAME',
					tsNs: 'services',
				},
				{
					id: 'svct_01GW2HHEVCXGK9GPK6SAZ2Q7E3',
					tsKey: 'community-support.CATEGORYNAME',
					tsNs: 'services',
				},
				{ id: 'svct_01GW2HHEVKVHTWSBY7PVWC5390', tsKey: 'medical.CATEGORYNAME', tsNs: 'services' },
				{ id: 'svct_01GW2HHEVMEF7DMG9WHP0JM2ZZ', tsKey: 'mental-health.CATEGORYNAME', tsNs: 'services' },
				{ id: 'svct_01GW2HHEVFXW9YFMK4R95ZHBPV', tsKey: 'food.CATEGORYNAME', tsNs: 'services' },
				{ id: 'svct_01GW2HHEVPXANJ6MPCDE0S4CWT', tsKey: 'transportation.CATEGORYNAME', tsNs: 'services' },
			],
			orgLeader: [],
			orgFocus: [],
			locations: ['Washington'],
			distance: 10.43,
			unit: 'mi',
		},
	],
	serviceAreas: {
		country: [{ id: 'ctry_01GW2HHDK9M26M80SG63T21SVH' }],
		govDist: [{ id: 'gdst_01GW2HKADSS3SDS9XJV1WHMTVY' }, { id: 'gdst_01GW2HKB0NJVC3N82WNDDT9C8S' }],
	},
	resultCount: 72,
} satisfies ApiOutput['organization']['searchDistance']

export const searchResultLongTitle = {
	id: 'orgn_01GVH3V43QAKQH440MP6TWWD0X',
	name: 'The George Washington University Immigration Clinic With Some Extra Long Text To Test Wrapping',
	slug: 'the-george-washington-university-immigration-clinic',
	description: {
		key: 'the-george-washington-university-immigration-clinic.description',
		ns: 'org-data',
		text: 'The George Washington University Immigration Clinic represents clients from around the world on immigration law matters, including removal proceedings and petitions for affirmative asylum. The clinic accepts removal cases scheduled in the Arlington Immigration Court and affirmative asylum cases, as well as deportation or removal proceedings involving cancellation of removal, temporary protected status, or criminal issues.',
	},
	serviceCategories: [
		{ id: 'svct_01GW2HHEVH75KPRYKD49EJHYXX', tsKey: 'legal.CATEGORYNAME', tsNs: 'services' },
	],
	orgLeader: [
		{
			tsKey: 'orgleader.bipoc-led',
			icon: '🤎',
			iconBg: '#F1DD7F',
			id: '',
			category: {
				tag: 'organization-leadership',
			},
		},
	],
	orgFocus: [
		{
			tsKey: 'srvfocus.bipoc-comm',
			icon: '️‍️‍✊🏿',
			iconBg: null,
			id: '',
			category: {
				tag: 'organization-focus',
			},
		},
		{
			tsKey: 'srvfocus.gender-nc',
			icon: '🏳️‍⚧️',
			iconBg: null,
			id: '',
			category: {
				tag: 'organization-focus',
			},
		},
	],
	locations: ['Washington'],
	distance: 8.52,
	unit: 'mi',
} satisfies ApiOutput['organization']['searchDistance']['orgs'][number]
