import { faker } from '@faker-js/faker'

import { type ApiOutput } from '@weareinreach/api'
import { getTRPCMock } from '~ui/lib/getTrpcMock'

export const organizationData = {
	getIdFromSlug: { id: 'orgn_MOCKED00000ID999999' },
	getIntlCrisis: [
		{
			id: 'orgn_01H64P2CHAE2CFWD7EF5HWAEAZ',
			name: 'Rainbow Railroad',
			description: {
				key: 'orgn_01H64P2CHAE2CFWD7EF5HWAEAZ.description',
				text: "Rainbow Railroad is a Canadian-based nonprofit helping LGBT people escape to safer countries. While they have worked with LGBT people from other countries before, Rainbow Railroad's priority is people in countries with state-sponsored violence against the LGBT community.",
			},
			targetPop: {
				tag: 'other-describe',
				text: 'People in countries with state-sponsored violence against the LGBT community.',
				tsKey: 'orgn_01H64P2CHAE2CFWD7EF5HWAEAZ.attribute.atts_01H64PK2TKMRTVGAPV3HYZ1017',
			},
			services: [
				{
					tsKey: 'international-support.resettlement-assistance',
					tsNs: 'services',
				},
			],
			accessInstructions: [
				{
					tag: 'accesslink',
					access_type: 'link',
					access_value: 'https://www.rainbowrailroad.org/request-help',
				},
			],
		},
		{
			id: 'orgn_01H64R1VP03AYSEA6GBNA9PDBZ',
			name: "Trevor Project's TrevorSpace",
			description: {
				key: 'orgn_01H64R1VP03AYSEA6GBNA9PDBZ.description',
				text: "The Trevor Project's TrevorSpace is an affirming international community for LGBTQ young people ages 13-24. No matter where you live, you can access www.TrevorSpace.org, a safe and secure social networking site for LGBTQ young people and their allies. The Trevor Project makes sure that the only people allowed on the site are ages 13 to 24, and no hate-speech, discrimination, or bullying of any kind are allowed.",
			},
			targetPop: {
				tag: 'other-describe',
				text: 'LGBTQ young people ages 13 to 24.',
				tsKey: 'orgn_01H64R1VP03AYSEA6GBNA9PDBZ.attribute.atts_01H64R1VP03S77QQ7DVK8SV8GZ',
			},
			services: [
				{
					tsKey: 'international-support.mental-health',
					tsNs: 'services',
				},
			],
			accessInstructions: [
				{
					tag: 'accesslink',
					access_type: 'link',
					access_value: 'https://www.trevorspace.org',
				},
			],
		},
		{
			id: 'orgn_01H64R9AJBT38SDZXP2MYRR5TW',
			name: 'Ahwaa',
			description: {
				key: 'orgn_01H64R9AJBT38SDZXP2MYRR5TW.description',
				text: 'Ahwaa is an open space to discuss LGBTQ issues in the Middle East. Discussion topics include: sexuality, identity, society, religion, family, relationships and culture. Ahwaa is now the largest LGBTQ community site in the Arab world.',
			},
			targetPop: {
				tag: 'other-describe',
				text: 'Arab LGBTQ community.',
				tsKey: 'orgn_01H64R9AJBT38SDZXP2MYRR5TW.attribute.atts_01H64R9AJBDFGWH3RC17Q9604N',
			},
			services: [
				{
					tsKey: 'international-support.mental-health',
					tsNs: 'services',
				},
			],
			accessInstructions: [
				{
					tag: 'accesslink',
					access_type: 'link',
					access_value: 'https://www.ahwaa.org',
				},
			],
		},
		{
			id: 'orgn_01H64RC712WNQ97VZMG5DKWX60',
			name: 'International Railroad for Queer Refugees (IRQR)',
			description: {
				key: 'orgn_01H64RC712WNQ97VZMG5DKWX60.description',
				text: "International Railroad for Queer Refugees (IRQR)'s mission is to relieve poverty for LGBT refugees living in Turkey by providing the basic necessities of life; and to relieve poverty by sponsoring, providing financial and resettlement assistance to LGBT refugees in Turkey who have fled because of persecution for their sexual orientation or gender identity.",
			},
			targetPop: {
				tag: 'other-describe',
				text: 'LGBT refugees living in Turkey until they are resettled in a safe country.',
				tsKey: 'orgn_01H64RC712WNQ97VZMG5DKWX60.attribute.atts_01H64RC712SZGKJQHVAQ55SXVK',
			},
			services: [
				{
					tsKey: 'international-support.resettlement-assistance',
					tsNs: 'services',
				},
				{
					tsKey: 'international-support.financial-assistance',
					tsNs: 'services',
				},
			],
			accessInstructions: [
				{
					tag: 'accesslink',
					access_type: 'link',
					access_value: 'https://www.irqr.net',
				},
				{
					tag: 'accessemail',
					access_type: 'email',
					access_value: 'info@irq.ca',
				},
				{
					tag: 'accessphone',
					access_type: 'phone',
					access_value: '4169857456',
				},
			],
		},
		{
			id: 'orgn_01H64RHG49SQC6QWBA1CGJ2QTZ',
			name: 'Trans Asylias',
			description: {
				key: 'orgn_01H64RHG49SQC6QWBA1CGJ2QTZ.description',
				text: 'Trans Asylias is a non-profit organization created in 2021 with the purpose to help transgender and non-binary asylum seekers escape from their home countries where they face persecution and resettle in safer countries.',
			},
			targetPop: {
				tag: 'other-describe',
				text: 'Transgender and non-binary asylum seekers.',
				tsKey: 'orgn_01H64RHG49SQC6QWBA1CGJ2QTZ.attribute.atts_01H64RHG49FXZZ1GG84S124C56',
			},
			services: [
				{
					tsKey: 'international-support.resettlement-assistance',
					tsNs: 'services',
				},
			],
			accessInstructions: [
				{
					tag: 'accesslink',
					access_type: 'link',
					access_value: 'https://www.transasylias.org',
				},
			],
		},
	],
	getNatlCrisis: [
		{
			id: 'orgn_01H29CX1TRDGZZ73ETGHRN910M',
			name: '988 Suicide and Crisis Lifeline',
			description: {
				text: "If you're thinking about suicide, are worried about a friend or loved one, or would like emotional support, the Lifeline network is available 24/7 across the United States.",
				key: 'orgn_01H29CX1TRDGZZ73ETGHRN910M.osvc_01H6PKD58K02BF1H6F1THZN3PZ.description',
			},
			community: {
				icon: '🏳️‍🌈',
				tsKey: 'crisis-support-community.general-lgbtq',
			},
			accessInstructions: [
				{
					tag: 'accessphone',
					access_type: 'phone',
					access_value: '988',
					key: 'orgn_01H29CX1TRDGZZ73ETGHRN910M.attribute.atts_01H6PKZ9ZRRBVNN3E76NAQ2F0F',
					text: 'hotline for english speakers (24/7)',
				},
				{
					tag: 'accesssms',
					access_type: 'sms',
					access_value: '988',
					key: 'orgn_01H29CX1TRDGZZ73ETGHRN910M.attribute.atts_01H6PKZ9ZSCZZFK8DH7T2774BS',
					text: 'sms for english speakers (24/7)',
				},
				{
					tag: 'accessphone',
					access_type: 'phone',
					access_value: '8886289454',
					key: 'orgn_01H29CX1TRDGZZ73ETGHRN910M.attribute.atts_01H6PKZ9ZS4K3AD435F367CHJP',
					text: 'hotline spanish speakers (en español) (24/7)',
				},
			],
		},
		{
			id: 'orgn_01GVH3V4BHVEYSTF9AY2RYCMP5',
			name: 'Trans Lifeline',
			description: {
				text: "Trans Lifeline's Hotline is a peer support phone service run by trans people for trans and questioning people. Call them if you need someone trans to talk to, even if you're not in crisis or if you're not sure you're trans.",
				key: 'orgn_01GVH3V4BHVEYSTF9AY2RYCMP5.osvc_01H6PKD58M5HT9MEANJKKR304Q.description',
			},
			community: {
				icon: '🏳️‍⚧️',
				tsKey: 'srvfocus.trans-comm',
			},
			accessInstructions: [
				{
					tag: 'accessphone',
					access_type: 'phone',
					access_value: '8775658860',
					key: 'orgn_01GVH3V4BHVEYSTF9AY2RYCMP5.attribute.atts_01H6PNCHJCWE8PHEJPZHP2VBXM',
					text: 'hotline (24/7)',
				},
			],
		},
		{
			id: 'orgn_01H6PQ07W414JAWCEN619FQ77W',
			name: 'Kids Help Phone',
			description: {
				text: "Kids Help Phone is Canada's only 24/7 e-mental health service offering free, confidential support to young people in English and French. Kids Help Phone is here for 2SLGBTQ+ youth from coast to coast to coast 365 days a year.",
				key: 'orgn_01H6PQ07W414JAWCEN619FQ77W.osvc_01H6PQ75E8THP2ZK08RHHB6X02.description',
			},
			community: {
				icon: '🌱',
				tsKey: 'srvfocus.lgbtq-youth-focus',
			},
			accessInstructions: [
				{
					tag: 'accesssms',
					access_type: 'sms',
					sms_body: 'CONNECT',
					access_value: '686868',
					key: 'orgn_01H6PQ07W414JAWCEN619FQ77W.attribute.atts_01H6PQ7YC72VJ3HRS6NVMF9NQE',
					text: 'sms in canada (24/7)',
				},
			],
		},
		{
			id: 'orgn_01GVH3V3SYFJEYC2Y8QZ28V9FQ',
			name: 'The Trevor Project',
			description: {
				text: "The Trevor Project provides information and support to LGBTQ+ youth 24/7, every day of the year, throughout Mexico. Services are 100% free and confidential. Contact the Trevor Project's trained crisis counselors in Mexico 24/7 via the information below.",
				key: 'orgn_01GVH3V3SYFJEYC2Y8QZ28V9FQ.osvc_01H6PQGS55V1ERST7E0KJB98Q3.description',
			},
			community: {
				icon: '🌱',
				tsKey: 'srvfocus.lgbtq-youth-focus',
			},
			accessInstructions: [
				{
					tag: 'accesslink',
					access_type: 'link',
					access_value: 'https://thetrevorproject.mx/Ayuda',
					key: 'orgn_01GVH3V3SYFJEYC2Y8QZ28V9FQ.attribute.atts_01H6PQPFNXWXPDCEA8NDNF81B7',
					text: 'online chat (24/7)',
				},
				{
					tag: 'accesssms',
					access_type: 'sms',
					sms_body: 'Comenzar',
					access_value: '67676',
					key: 'orgn_01GVH3V3SYFJEYC2Y8QZ28V9FQ.attribute.atts_01H6PQRQ184NRH6N7TZSDX91GV',
					text: 'sms in mexico (24/7)',
				},
				{
					tag: 'accesswhatsapp',
					access_type: 'whatsapp',
					access_value: '+5592253337',
					key: 'orgn_01GVH3V3SYFJEYC2Y8QZ28V9FQ.attribute.atts_01H6PQHNWS0AH8AD8FD33ZWHX5',
					text: 'whatsapp in mexico (24/7)',
				},
			],
		},
	],
} satisfies Data
export const organization = {
	getIdFromSlug: getTRPCMock({
		path: ['organization', 'getIdFromSlug'],
		response: organizationData.getIdFromSlug,
	}),
	forOrganizationTable: getTRPCMock({
		path: ['organization', 'forOrganizationTable'],
		response: () => {
			const totalRecords = 1000
			faker.seed(1024)
			const data: ApiOutput['organization']['forOrganizationTable'] = []

			for (let index = 0; index < totalRecords; index++) {
				const lastVerified = faker.date.past()
				const updatedAt = faker.date.past({ refDate: lastVerified })
				const createdAt = faker.date.past({ refDate: updatedAt })
				const locations: NonNullable<ApiOutput['organization']['forOrganizationTable']>[number]['locations'] =
					[]

				const totalLocations = faker.number.int({ min: 0, max: 7 })

				for (let locIdx = 0; locIdx < totalLocations; locIdx++) {
					const updatedAt = faker.date.past({ refDate: lastVerified })
					const createdAt = faker.date.past({ refDate: updatedAt })
					locations.push({
						id: `oloc_${faker.string.alphanumeric({ length: 26, casing: 'upper' })}`,
						name: `${faker.location.street()} location`,
						updatedAt,
						createdAt,
						published: faker.datatype.boolean(0.9),
						deleted: faker.datatype.boolean(0.05),
					})
				}

				data.push({
					id: `orgn_${faker.string.alphanumeric({ length: 26, casing: 'upper' })}`,
					name: faker.company.name(),
					slug: faker.lorem.slug(3),
					lastVerified,
					updatedAt,
					createdAt,
					published: faker.datatype.boolean(0.9),
					deleted: faker.datatype.boolean(0.05),
					locations,
				})
			}
			return data
		},
	}),
}

type Data = Partial<{
	[K in keyof ApiOutput['organization']]: ApiOutput['organization'][K]
}>
