import { type ApiOutput } from '@weareinreach/api'

export const searchResultsMock = {
	orgs: [
		{
			id: 'orgn_01GVH3V4MT8QBB7JSP7HSYAZ7Y',
			name: 'Arlington Food Assistance Center',
			slug: 'arlington-food-assistance-center',
			description: {
				key: 'orgn_01GVH3V4MT8QBB7JSP7HSYAZ7Y.description',
				ns: 'org-data',
				text: 'Since 1988, the Arlington Food Assistance Center remains dedicated to its simple but critical mission of obtaining and distributing groceries, directly and free of charge, to people living in Arlington, VA, who cannot afford to purchase enough food to meet their basic needs. AFAC is committed to maintaining a safe, supportive, and respectful space for all members of the community regardless of race, religion, immigration status, age, sexual orientation, ethnicity, first language, gender, or disability.',
			},
			serviceCategories: [
				{
					id: 'svct_01GW2HHEVFXW9YFMK4R95ZHBPV',
					tsKey: 'food.CATEGORYNAME',
					tsNs: 'services',
				},
			],
			orgLeader: [],
			orgFocus: [],
			locations: ['Arlington'],
			distance: 1.46,
			unit: 'mi',
			national: [],
		},
		{
			id: 'orgn_01GVH3V9EKZ9ZZMW9E5S51SB2B',
			name: 'Hogar Immigrant Services',
			slug: 'hogar-immigrant-services',
			description: {
				key: 'orgn_01GVH3V9EKZ9ZZMW9E5S51SB2B.description',
				ns: 'org-data',
				text: 'Hogar Immigrant Services is a program of Catholic Charities Diocese of Arlington which seeks to fulfill the Catholic Church\'s mission to "welcome the stranger" by providing high-quality, low-cost immigration legal services to individuals, regardless of their race, religion, nationality, sexuality, country of origin, or ability to pay.',
			},
			serviceCategories: [
				{
					id: 'svct_01GW2HHEVH75KPRYKD49EJHYXX',
					tsKey: 'legal.CATEGORYNAME',
					tsNs: 'services',
				},
			],
			orgLeader: [],
			orgFocus: [
				{
					category: {
						tag: 'service-focus',
					},
					id: 'attr_01GW2HHFVPTK9555WHJHDBDA2J',
					tsKey: 'srvfocus.immigrant-comm',
					icon: '️‍️‍🌎',
					iconBg: null,
					_count: {
						parents: 0,
					},
				},
			],
			locations: ['Alexandria'],
			distance: 3.22,
			unit: 'mi',
			national: [],
		},
		{
			id: 'orgn_01GVH3VABSTMFWTM40J8XTYEPX',
			name: 'Legal Aid Justice Center',
			slug: 'legal-aid-justice-center',
			description: {
				key: 'orgn_01GVH3VABSTMFWTM40J8XTYEPX.description',
				ns: 'org-data',
				text: "Legal Aid Justice Center's Access to Justice Partnership provides legal services to low-income clients in areas such as consumer protection, education, elder law, immigration, employment, and housing disputes.",
			},
			serviceCategories: [
				{
					id: 'svct_01GW2HHEVH75KPRYKD49EJHYXX',
					tsKey: 'legal.CATEGORYNAME',
					tsNs: 'services',
				},
			],
			orgLeader: [],
			orgFocus: [
				{
					category: {
						tag: 'service-focus',
					},
					id: 'attr_01GW2HHFVPTK9555WHJHDBDA2J',
					tsKey: 'srvfocus.immigrant-comm',
					icon: '️‍️‍🌎',
					iconBg: null,
					_count: {
						parents: 0,
					},
				},
			],
			locations: ['Falls Church', 'Richmond', 'Charlottesville', 'Petersburg'],
			distance: 3.82,
			unit: 'mi',
			national: [],
		},
		{
			id: 'orgn_01GVH3V61FAZQGQ1ZDGBXVD79V',
			name: 'African Communities Together',
			slug: 'african-communities-together',
			description: {
				key: 'orgn_01GVH3V61FAZQGQ1ZDGBXVD79V.description',
				ns: 'org-data',
				text: 'African Communities Together is an organization of African immigrants fighting for civil rights, opportunity, and a better life for their families here in the U.S. and worldwide. They connect African immigrants to critical services, help Africans develop as leaders, and organize communities around the issues that matter. ACT helps African immigrants find free or low-cost assistance with immigration, jobs, and other needs. Through the Monthly Membership Meetings, Leadership Committees, and training, ACT gives African immigrants the tools and information they need to become leaders on the issues that matter to them. ACT mobilizes African immigrant communities to speak out on the issues that affect their lives and the lives of their families.',
			},
			serviceCategories: [
				{
					id: 'svct_01GW2HHEVH75KPRYKD49EJHYXX',
					tsKey: 'legal.CATEGORYNAME',
					tsNs: 'services',
				},
				{
					id: 'svct_01GW2HHEVPFRQR07PTHMWJDDKS',
					tsKey: 'translation-and-interpretation.CATEGORYNAME',
					tsNs: 'services',
				},
				{
					id: 'svct_01GW2HHEVDX898ZT0QGM471WMV',
					tsKey: 'education-and-employment.CATEGORYNAME',
					tsNs: 'services',
				},
			],
			orgLeader: [
				{
					category: {
						tag: 'organization-leadership',
					},
					id: 'attr_01GW2HHFVN3JX2J7REFFT5NAMS',
					tsKey: 'orgleader.black-led',
					icon: '️‍️‍✊🏿',
					iconBg: '#C77E54',
					_count: {
						parents: 0,
					},
				},
				{
					category: {
						tag: 'organization-leadership',
					},
					id: 'attr_01GW2HHFVNHMF72WHVKRF6W4TA',
					tsKey: 'orgleader.immigrant-led',
					icon: '️‍️‍🌎',
					iconBg: '#79ADD7',
					_count: {
						parents: 0,
					},
				},
				{
					category: {
						tag: 'organization-leadership',
					},
					id: 'attr_01GW2HHFVNPKMHYK12DDRVC1VJ',
					tsKey: 'orgleader.bipoc-led',
					icon: '🤎',
					iconBg: '#F1DD7F',
					_count: {
						parents: 0,
					},
				},
			],
			orgFocus: [
				{
					category: {
						tag: 'service-focus',
					},
					id: 'attr_01GW2HHFVN72D7XEBZZJXCJQXQ',
					tsKey: 'srvfocus.bipoc-comm',
					icon: '️‍️‍✊🏿',
					iconBg: null,
					_count: {
						parents: 0,
					},
				},
				{
					category: {
						tag: 'service-focus',
					},
					id: 'attr_01GW2HHFVPTK9555WHJHDBDA2J',
					tsKey: 'srvfocus.immigrant-comm',
					icon: '️‍️‍🌎',
					iconBg: null,
					_count: {
						parents: 0,
					},
				},
			],
			locations: ['Arlington', 'Washington', 'New York'],
			distance: 4.42,
			unit: 'mi',
			national: [],
		},
		{
			id: 'orgn_01GVH3V8JWQQZ7W4VHTZJX8J3Q',
			name: 'PathForward',
			slug: 'pathforward',
			description: {
				key: 'orgn_01GVH3V8JWQQZ7W4VHTZJX8J3Q.description',
				ns: 'org-data',
				text: 'PathForward is a non-profit working to end homelessness in Arlington, Virginia. PathForward (formerly A-SPAN) transforms lives by delivering housing solutions and pathways to stability in Arlington County, VA.',
			},
			serviceCategories: [
				{
					id: 'svct_01GW2HHEVKVHTWSBY7PVWC5390',
					tsKey: 'medical.CATEGORYNAME',
					tsNs: 'services',
				},
				{
					id: 'svct_01GW2HHEVMEF7DMG9WHP0JM2ZZ',
					tsKey: 'mental-health.CATEGORYNAME',
					tsNs: 'services',
				},
				{
					id: 'svct_01GW2HHEVGD7CE9VKYVSZYYTPS',
					tsKey: 'hygiene-and-clothing.CATEGORYNAME',
					tsNs: 'services',
				},
				{
					id: 'svct_01GW2HHEVF8W7D67CH3NVSQYA6',
					tsKey: 'housing.CATEGORYNAME',
					tsNs: 'services',
				},
				{
					id: 'svct_01GW2HHEVFXW9YFMK4R95ZHBPV',
					tsKey: 'food.CATEGORYNAME',
					tsNs: 'services',
				},
			],
			orgLeader: [],
			orgFocus: [],
			locations: ['Arlington'],
			distance: 5.37,
			unit: 'mi',
			national: [],
		},
		{
			id: 'orgn_01GVH3V9HWXJMSE5R0F9QWV67J',
			name: 'Community of Hope',
			slug: 'community-of-hope',
			description: {
				key: 'orgn_01GVH3V9HWXJMSE5R0F9QWV67J.description',
				ns: 'org-data',
				text: "Community of Hope's mission is to improve health and end family homelessness to make Washington, DC more equitable. Their goals include ending homelessness for families in Washington, DC and improving health and eliminating inequities in health outcomes in under-resources communities in Washington, DC. They embrace the diversity of their community, welcome all voices and perspectives, and treat everyone with respect, compassion, and integrity.",
			},
			serviceCategories: [
				{
					id: 'svct_01GW2HHEVF8W7D67CH3NVSQYA6',
					tsKey: 'housing.CATEGORYNAME',
					tsNs: 'services',
				},
				{
					id: 'svct_01GW2HHEVKVHTWSBY7PVWC5390',
					tsKey: 'medical.CATEGORYNAME',
					tsNs: 'services',
				},
				{
					id: 'svct_01GW2HHEVMEF7DMG9WHP0JM2ZZ',
					tsKey: 'mental-health.CATEGORYNAME',
					tsNs: 'services',
				},
			],
			orgLeader: [],
			orgFocus: [],
			locations: ['Washington'],
			distance: 6.36,
			unit: 'mi',
			national: [],
		},
		{
			id: 'orgn_01GVH3V4KBTWXQ61TRMT5H33TA',
			name: 'CASA',
			slug: 'casa',
			description: {
				key: 'orgn_01GVH3V4KBTWXQ61TRMT5H33TA.description',
				ns: 'org-data',
				text: 'Since 1985, CASA has worked to assist Central American refugees fleeing wars and civil strife at home. They do this by providing employment placement; workforce development and training; health education; citizenship and legal services; and financial, language, and literacy training to Latino and immigrant communities in Maryland, Pennsylvania, and Virginia. CASA has formalized its commitment to including LGBTQ+ brothers, sisters, and siblings, united in the fight for justice. Its staff-led LGBT+ Advisory Committee creates a welcoming and inclusive organization for staff and community members by providing support, guidance and creating safe and brave spaces for individuals across the spectrums of gender and sexuality.',
			},
			serviceCategories: [
				{
					id: 'svct_01GW2HHEVH75KPRYKD49EJHYXX',
					tsKey: 'legal.CATEGORYNAME',
					tsNs: 'services',
				},
				{
					id: 'svct_01GW2HHEVDX898ZT0QGM471WMV',
					tsKey: 'education-and-employment.CATEGORYNAME',
					tsNs: 'services',
				},
				{
					id: 'svct_01GW2HHEVKVHTWSBY7PVWC5390',
					tsKey: 'medical.CATEGORYNAME',
					tsNs: 'services',
				},
				{
					id: 'svct_01GW2HHEVMEF7DMG9WHP0JM2ZZ',
					tsKey: 'mental-health.CATEGORYNAME',
					tsNs: 'services',
				},
			],
			orgLeader: [],
			orgFocus: [
				{
					category: {
						tag: 'service-focus',
					},
					id: 'attr_01GW2HHFVN72D7XEBZZJXCJQXQ',
					tsKey: 'srvfocus.bipoc-comm',
					icon: '️‍️‍✊🏿',
					iconBg: null,
					_count: {
						parents: 0,
					},
				},
				{
					category: {
						tag: 'service-focus',
					},
					id: 'attr_01GW2HHFVPTK9555WHJHDBDA2J',
					tsKey: 'srvfocus.immigrant-comm',
					icon: '️‍️‍🌎',
					iconBg: null,
					_count: {
						parents: 0,
					},
				},
				{
					category: {
						tag: 'service-focus',
					},
					id: 'attr_01GW2HHFVQ8AGBKBBZJWTHNP2F',
					tsKey: 'srvfocus.spanish-speakers',
					icon: '🗣️',
					iconBg: null,
					_count: {
						parents: 0,
					},
				},
			],
			locations: [
				'Falls Church',
				'Hyattsville',
				'Silver Spring',
				'Langley Park',
				'Woodbridge',
				'Rockville',
				'Baltimore',
				'York',
				'Lancaster',
			],
			distance: 7.16,
			unit: 'mi',
			national: [],
		},
		{
			id: 'orgn_01GVH3V43QAKQH440MP6TWWD0X',
			name: 'The George Washington University Immigration Clinic',
			slug: 'the-george-washington-university-immigration-clinic',
			description: {
				key: 'orgn_01GVH3V43QAKQH440MP6TWWD0X.description',
				ns: 'org-data',
				text: 'The George Washington University Immigration Clinic represents clients from around the world on immigration law matters, including removal proceedings and petitions for affirmative asylum. The clinic accepts removal cases scheduled in the Arlington Immigration Court and affirmative asylum cases, as well as deportation or removal proceedings involving cancellation of removal, temporary protected status, or criminal issues.',
			},
			serviceCategories: [
				{
					id: 'svct_01GW2HHEVH75KPRYKD49EJHYXX',
					tsKey: 'legal.CATEGORYNAME',
					tsNs: 'services',
				},
			],
			orgLeader: [],
			orgFocus: [
				{
					category: {
						tag: 'service-focus',
					},
					id: 'attr_01GW2HHFVPTK9555WHJHDBDA2J',
					tsKey: 'srvfocus.immigrant-comm',
					icon: '️‍️‍🌎',
					iconBg: null,
					_count: {
						parents: 0,
					},
				},
			],
			locations: ['Washington'],
			distance: 7.21,
			unit: 'mi',
			national: [],
		},
		{
			id: 'orgn_01GVH3V43VTXXF9FET8M5J2GNA',
			name: 'Ayuda',
			slug: 'ayuda',
			description: {
				key: 'orgn_01GVH3V43VTXXF9FET8M5J2GNA.description',
				ns: 'org-data',
				text: 'Ayuda advocates for and defends the legal and human rights of low-income immigrants living in Washington, DC, Maryland, and Virginia. Ayuda provides legal, social, and language services to help low-income immigrants access justice and transform their lives. Ayuda’s expert and dedicated professionals help immigrants from anywhere in the world navigate the immigration and justice systems and access the social safety net. Their comprehensive and welcoming approach breaks down barriers, helps those in need, and makes the community stronger.',
			},
			serviceCategories: [
				{
					id: 'svct_01GW2HHEVMEF7DMG9WHP0JM2ZZ',
					tsKey: 'mental-health.CATEGORYNAME',
					tsNs: 'services',
				},
				{
					id: 'svct_01GW2HHEVH75KPRYKD49EJHYXX',
					tsKey: 'legal.CATEGORYNAME',
					tsNs: 'services',
				},
				{
					id: 'svct_01GW2HHEVPFRQR07PTHMWJDDKS',
					tsKey: 'translation-and-interpretation.CATEGORYNAME',
					tsNs: 'services',
				},
			],
			orgLeader: [],
			orgFocus: [
				{
					category: {
						tag: 'service-focus',
					},
					id: 'attr_01GW2HHFVPTK9555WHJHDBDA2J',
					tsKey: 'srvfocus.immigrant-comm',
					icon: '️‍️‍🌎',
					iconBg: null,
					_count: {
						parents: 0,
					},
				},
				{
					category: {
						tag: 'service-focus',
					},
					id: 'attr_01GW2HHFVQ8AGBKBBZJWTHNP2F',
					tsKey: 'srvfocus.spanish-speakers',
					icon: '🗣️',
					iconBg: null,
					_count: {
						parents: 0,
					},
				},
			],
			locations: ['Washington', 'Fairfax', 'Silver Spring'],
			distance: 7.44,
			unit: 'mi',
			national: [],
		},
		{
			id: 'orgn_01GVH3VAFY3EF3NZDMZDZJN0X1',
			name: 'Just Neighbors',
			slug: 'just-neighbors-n0x1',
			description: {
				key: 'orgn_01GVH3VAFY3EF3NZDMZDZJN0X1.description',
				ns: 'org-data',
				text: 'Just Neighbors is a nonprofit 501(c)(3) tax-exempt organization dedicated to serving and supporting the immigrant community of Washington, D.C., Maryland, and Virginia. They foster mutual understanding between immigrants and the larger community in which they live.\nLow-income immigrants and refugees often face many hurdles, everything from putting food on the table to understanding English. Just Neighbors knows that immigrants and refugees are striving to achieve their own version of the American Dream. That’s why Just Neighbors offers compassionate immigration legal services. During appointments, attorneys will offer trustworthy advice and assistance with individual immigration situation. Just Neighbors strives to be an inclusive, antiracist organization that fosters an environment where everyone belongs. Just Neighbors is Safe Zone trained. Safe Zone trainings are opportunities to learn about LGBTQ+ identities, gender and sexuality, and examine prejudice, assumptions, and privilege.',
			},
			serviceCategories: [
				{
					id: 'svct_01GW2HHEVH75KPRYKD49EJHYXX',
					tsKey: 'legal.CATEGORYNAME',
					tsNs: 'services',
				},
			],
			orgLeader: [],
			orgFocus: [
				{
					category: {
						tag: 'service-focus',
					},
					id: 'attr_01GW2HHFVPTK9555WHJHDBDA2J',
					tsKey: 'srvfocus.immigrant-comm',
					icon: '️‍️‍🌎',
					iconBg: null,
					_count: {
						parents: 0,
					},
				},
				{
					category: {
						tag: 'service-focus',
					},
					id: 'attr_01GW2HHFVQ8AGBKBBZJWTHNP2F',
					tsKey: 'srvfocus.spanish-speakers',
					icon: '🗣️',
					iconBg: null,
					_count: {
						parents: 0,
					},
				},
			],
			locations: ['Annandale', 'Rockville', 'Warrenton'],
			distance: 7.55,
			unit: 'mi',
			national: [],
		},
	],
	resultCount: 98,
} satisfies ApiOutput['organization']['searchDistance']

export const searchResultLongTitle = {
	id: 'orgn_01GVH3V408N0YS7CDYAH3F2BMH',
	name: 'Whitman-Walker Health With Extra Long Title to Test Text Wrapping',
	slug: 'whitman-walker-health',
	description: {
		key: 'whitman-walker-health.description',
		ns: 'org-data',
		text: "Whitman-Walker Health's mission is to offer affirming community-based health and wellness services to all with a special expertise in LGBTQ and HIV care. They empower all persons to live healthy, love openly, and achieve equality and inclusion. Through multiple locations throughout DC, they provide stigma-free care to anyone who walks through our doors. They are proud and honored to be a place where the gay, lesbian, bisexual, transgender and queer communities, as well to those living with or affected by HIV feel supported, welcomed and respected. They strive to be a place where they see the person first; a healthcare home where you will be treated with the dignity, respect and love.",
	},
	serviceCategories: [
		{
			id: 'svct_01GW2HHEVKVHTWSBY7PVWC5390',
			tsKey: 'medical.CATEGORYNAME',
			tsNs: 'services',
		},
		{
			id: 'svct_01GW2HHEVH75KPRYKD49EJHYXX',
			tsKey: 'legal.CATEGORYNAME',
			tsNs: 'services',
		},
		{
			id: 'svct_01GW2HHEVMEF7DMG9WHP0JM2ZZ',
			tsKey: 'mental-health.CATEGORYNAME',
			tsNs: 'services',
		},
		{
			id: 'svct_01GW2HHEVCXGK9GPK6SAZ2Q7E3',
			tsKey: 'community-support.CATEGORYNAME',
			tsNs: 'services',
		},
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
			_count: {
				parents: 0,
			},
		},
	],
	orgFocus: [
		{
			category: {
				tag: 'service-focus',
			},
			id: 'attr_01GW2HHFVPSYBCYF37B44WP6CZ',
			tsKey: 'srvfocus.trans-comm',
			icon: '🏳️‍⚧️',
			iconBg: null,
			_count: {
				parents: 0,
			},
		},
		{
			category: {
				tag: 'service-focus',
			},
			id: 'attr_01GW2HHFVPTK9555WHJHDBDA2J',
			tsKey: 'srvfocus.immigrant-comm',
			icon: '️‍️‍🌎',
			iconBg: null,
			_count: {
				parents: 0,
			},
		},
		{
			category: {
				tag: 'service-focus',
			},
			id: 'attr_01GW2HHFVQ8AGBKBBZJWTHNP2F',
			tsKey: 'srvfocus.spanish-speakers',
			icon: '🗣️',
			iconBg: null,
			_count: {
				parents: 0,
			},
		},
		{
			category: {
				tag: 'service-focus',
			},
			id: 'attr_01GW2HHFVQCZPA3Z5GW6J3MQHW',
			tsKey: 'srvfocus.lgbtq-youth-focus',
			icon: '🌱',
			iconBg: null,
			_count: {
				parents: 0,
			},
		},
		{
			category: {
				tag: 'service-focus',
			},
			id: 'attr_01GW2HHFVRMQFJ9AMA633SQQGV',
			tsKey: 'srvfocus.hiv-comm',
			icon: '💛',
			iconBg: null,
			_count: {
				parents: 0,
			},
		},
	],
	locations: ['Washington'],
	distance: 8.52,
	unit: 'mi',
	national: [],
} satisfies NonNullable<ApiOutput['organization']['searchDistance']>['orgs'][number]
