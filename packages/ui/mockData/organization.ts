import { faker } from '@faker-js/faker'
import { type HttpHandler } from 'msw'

import { type ApiOutput } from '@weareinreach/api'
import { getTRPCMock, type MockHandlerObject } from '~ui/lib/getTrpcMock'

const existingOrg = (input: string): ApiOutput['organization']['checkForExisting'] => {
	const name = 'Existing Organization'
	const regex = new RegExp(`.*${input}.*`, 'gi')
	if (regex.test(name)) {
		return {
			name,
			published: true,
			slug: 'existing-org',
		}
	}
	return null
}
export const organization = {
	getIdFromSlug: getTRPCMock({
		path: ['organization', 'getIdFromSlug'],
		response: { id: 'orgn_MOCKED00000ID999999' },
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
					lastVerified: faker.helpers.maybe(() => lastVerified, { probability: 0.9 }) ?? null,
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
	suggestionOptions: getTRPCMock({
		path: ['organization', 'suggestionOptions'],
		response: async () => {
			const { default: data } = await import('./json/organization.suggestionOptions.json')
			return data
		},
	}),
	createNewSuggestion: getTRPCMock({
		path: ['organization', 'createNewSuggestion'],
		type: 'mutation',
		response: { id: 'sugg_LKSDJFIOW156AWER15' },
	}),
	generateSlug: getTRPCMock({
		path: ['organization', 'generateSlug'],
		response: 'this-is-a-generated-slug',
	}),
	checkForExisting: getTRPCMock({
		path: ['organization', 'checkForExisting'],
		response: (input) => existingOrg(input),
	}),
	searchName: getTRPCMock({
		path: ['organization', 'searchName'],
		response: async (input) => {
			const { default: data } = await import('./json/organization.searchName.json')
			const searchRegex = new RegExp(`.*${input.search}.*`, 'i')
			const results = data.filter(({ label }) => searchRegex.test(label))
			return results
		},
	}),
	getIntlCrisis: getTRPCMock({
		path: ['organization', 'getIntlCrisis'],
		response: async () => {
			const { default: data } = await import('./json/organization.getIntlCrisis.json')
			return data
		},
	}),
	getNatlCrisis: getTRPCMock({
		path: ['organization', 'getNatlCrisis'],
		response: async () => {
			const { default: data } = await import('./json/organization.getNatlCrisis.json')
			return data
		},
	}),
	searchDistance: getTRPCMock({
		path: ['organization', 'searchDistance'],
		response: async () => {
			const { default: data } = await import('./json/organization.searchDistance.json')
			return data as ApiOutput['organization']['searchDistance']
		},
	}),
	searchDistanceLongTitle: getTRPCMock({
		path: ['organization', 'searchDistance'],
		response: async () => {
			const { default: data } = await import('./json/organization.searchDistanceLongTitle.json')
			return data as ApiOutput['organization']['searchDistance']
		},
	}),
} satisfies MockHandlerObject<'organization'> & { searchDistanceLongTitle: HttpHandler }
