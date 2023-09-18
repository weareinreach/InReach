import superjson from 'superjson'
import { type SuperJSONResult } from 'superjson/dist/types'
import { z } from 'zod'

import { prisma } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TGetIntlCrisisSchema } from './query.getIntlCrisis.schema'

const isSuperJSON = (input: unknown): input is SuperJSONResult =>
	typeof input === 'object' && input !== null && Object.hasOwn(input, 'json')

const AccessInstructionSchema = z.object({ access_type: z.string(), access_value: z.string() })

export const getIntlCrisis = async ({ input }: TRPCHandlerParams<TGetIntlCrisisSchema>) => {
	const orgs = await prisma.organization.findMany({
		where: {
			serviceAreas: { active: true, countries: { some: { country: { cca2: input.cca2 } } } },
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
					supplement: { select: { text: { select: { tsKey: { select: { key: true, text: true } } } } } },
				},
			},
			services: {
				select: {
					accessDetails: {
						where: {
							active: true,
							attribute: { active: true },
						},
						select: {
							attribute: { select: { tag: true } },
							supplement: {
								select: { data: true },
							},
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

	const formattedData = orgs.map(({ id, name, description, attributes, services }) => {
		const serviceTags: Record<'tsKey' | 'tsNs', string>[] = []
		const accessInstructions: Record<'tag' | 'access_type' | 'access_value', string>[] = []

		for (const { accessDetails, services: service } of services) {
			for (const { tag } of service) {
				serviceTags.push(tag)
			}
			for (const { attribute, supplement } of accessDetails) {
				for (const { data } of supplement) {
					const parsedData = AccessInstructionSchema.parse(
						isSuperJSON(data)
							? superjson.deserialize<{ access_type: string; access_value: string }>(data)
							: data
					)
					accessInstructions.push({ tag: attribute.tag, ...parsedData })
				}
			}
		}

		return {
			id,
			name,
			description: { ...description?.tsKey },
			targetPop: attributes
				.map(({ attribute, supplement }) => ({
					tag: attribute.tag,
					text: supplement.at(0)?.text?.tsKey.text,
					tsKey: supplement.at(0)?.text?.tsKey.key,
				}))
				.at(0),
			services: serviceTags,
			accessInstructions,
		}
	})

	return formattedData
}
