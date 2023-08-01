import superjson from 'superjson'
import { type SuperJSONResult } from 'superjson/dist/types'
import { z } from 'zod'

import { prisma, type Prisma } from '@weareinreach/db'
import { accessInstructions } from '@weareinreach/db/zod_util/attributeSupplement'
import { handleError } from '~api/lib/errorHandler'
import { isPublic } from '~api/schemas/selects/common'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TGetNatlCrisisSchema } from './query.getNatlCrisis.schema'

const isSuperJSON = (input: unknown): input is SuperJSONResult =>
	typeof input === 'object' && input !== null && Object.hasOwn(input, 'json')

const AccessInstructionSchema = accessInstructions.getAll()

export const getNatlCrisis = async ({ input }: TRPCHandlerParams<TGetNatlCrisisSchema>) => {
	try {
		const orgs = await prisma.organization.findMany({
			where: {
				services: {
					some: {
						crisisSupportOnly: true,
						serviceAreas: { active: true, countries: { some: { country: { cca2: input.cca2 } } } },
					},
				},
				// serviceAreas: { active: true, countries: { some: { country: { cca2: input.cca2 } } } },
				// crisisResource: true,
				published: true,
				deleted: false,
			},
			select: {
				id: true,
				name: true,
				services: {
					where: {
						crisisSupportOnly: true,
						serviceAreas: { active: true, countries: { some: { country: { cca2: input.cca2 } } } },
						...isPublic,
					},
					select: {
						description: {
							select: {
								tsKey: {
									select: {
										text: true,
										key: true,
									},
								},
							},
						},
						accessDetails: {
							where: {
								active: true,
								attribute: { active: true },
							},
							select: {
								attribute: { select: { tag: true } },
								supplement: {
									select: { data: true, text: { select: { tsKey: { select: { key: true, text: true } } } } },
								},
							},
						},
						attributes: {
							where: { active: true },
							select: {
								attribute: {
									select: {
										icon: true,
										tsKey: true,
									},
								},
							},
						},
					},
				},
			},
			orderBy: {
				crisisResourceSort: 'asc',
			},
		})

		const formattedData = orgs.map(({ id, name, services }) => {
			const attributeTags: (Record<'tsKey', string> & { icon: string | null })[] = []
			const accessInstructions: Record<string, string | null | undefined>[] = []
			let descriptionText: Record<'key' | 'text', string> | null = null
			for (const { accessDetails, attributes, description } of services) {
				if (description) descriptionText = description.tsKey
				for (const { attribute } of attributes) {
					attributeTags.push(attribute)
				}
				for (const { attribute, supplement } of accessDetails) {
					for (const { data, text } of supplement) {
						const parsedData = AccessInstructionSchema.parse(
							isSuperJSON(data)
								? superjson.deserialize<{ access_type: string; access_value: string }>(data)
								: data
						)
						accessInstructions.push({ tag: attribute.tag, ...parsedData, ...text?.tsKey })
					}
				}
			}

			return {
				id,
				name,
				description: descriptionText,
				community: attributeTags.at(0),
				accessInstructions,
			}
		})

		return formattedData
	} catch (error) {
		handleError(error)
	}
}
