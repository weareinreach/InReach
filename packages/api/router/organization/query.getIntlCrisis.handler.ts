import { z } from 'zod'

import { prisma } from '@weareinreach/db'
import { superjson, type SuperJSONResult } from '@weareinreach/util/transformer'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TGetIntlCrisisSchema } from './query.getIntlCrisis.schema'

const isSuperJSON = (input: unknown): input is SuperJSONResult =>
	typeof input === 'object' && input !== null && Object.hasOwn(input, 'json')

const AccessInstructionSchema = z.object({ access_type: z.string(), access_value: z.string() })

const getIntlCrisis = async ({ input }: TRPCHandlerParams<TGetIntlCrisisSchema>) => {
	let countryFilter
	if (input.cca2 === 'ZZ' || !input.cca2) {
		// If the country code is 'ZZ' or not specified, filter for international resources
		countryFilter = { country: { cca2: { notIn: ['US', 'CA', 'MX'] } } }
	} else {
		// Otherwise, filter for the specified country
		countryFilter = { country: { cca2: input.cca2 } }
	}

	console.log(countryFilter)

	const orgs = await prisma.organization.findMany({
		where: {
			serviceAreas: {
				active: true,
				countries: {
					some: countryFilter,
				},
			},
			crisisResource: true,
			published: true,
			deleted: false,
		},
		select: {
			id: true,
			name: true,
			description: { select: { tsKey: { select: { key: true, text: true } } } },
			attributes: {
				where: {
					active: true,
					attribute: { tag: 'other-describe', active: true },
				},
				select: {
					attribute: { select: { tag: true } },
					text: { select: { tsKey: { select: { key: true, text: true } } } },
				},
			},
			services: {
				select: {
					attributes: {
						where: {
							attribute: { categories: { some: { category: { tag: 'service-access-instructions' } } } },
						},
						select: {
							attribute: { select: { tag: true } },
							data: true,
						},
					},
					services: {
						where: { active: true, tag: { active: true } },
						select: {
							tag: { select: { tsKey: true, tsNs: true } },
						},
					},
				},
			},
		},
		orderBy: {
			crisisResourceSort: 'asc',
		},
	})

	// Log the number of organizations found
	console.log(`Prisma query found ${orgs.length} organizations.`)

	// Log the names of each organization
	orgs.forEach((org, index) => {
		console.log(`${index + 1}: ${org.name}`)
	})

	const formattedData = orgs.map(({ id, name, description, attributes, services }) => {
		const serviceTags: Record<'tsKey' | 'tsNs', string>[] = []
		const accessInstructions: Record<'tag' | 'access_type' | 'access_value', string>[] = []

		for (const { attributes: serviceAttributes, services: service } of services) {
			for (const { tag } of service) {
				serviceTags.push(tag)
			}
			for (const { attribute, data } of serviceAttributes) {
				const parsedData = AccessInstructionSchema.parse(
					isSuperJSON(data)
						? superjson.deserialize<{ access_type: string; access_value: string }>(data)
						: data
				)
				accessInstructions.push({ tag: attribute.tag, ...parsedData })
			}
		}

		return {
			id,
			name,
			accessInstructions,
			description: { ...description?.tsKey },
			targetPop: attributes
				.map(({ attribute, text }) => ({
					tag: attribute.tag,
					text: text?.tsKey?.text,
					tsKey: text?.tsKey?.key,
				}))
				.at(0),
			services: serviceTags,
		}
	})

	return formattedData
}
export default getIntlCrisis
