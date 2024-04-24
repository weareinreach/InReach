import { prisma } from '@weareinreach/db'
import { accessInstructions } from '@weareinreach/db/zod_util/attributeSupplement'
import { superjson, type SuperJSONResult } from '@weareinreach/util/transformer'
import { isPublic } from '~api/schemas/selects/common'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TGetNatlCrisisSchema } from './query.getNatlCrisis.schema'

const isSuperJSON = (input: unknown): input is SuperJSONResult =>
	typeof input === 'object' && input !== null && Object.hasOwn(input, 'json')

const AccessInstructionSchema = accessInstructions.getAll()

const getNatlCrisis = async ({ input }: TRPCHandlerParams<TGetNatlCrisisSchema>) => {
	const orgs = await prisma.organization.findMany({
		where: {
			services: {
				some: {
					crisisSupportOnly: true,
					serviceAreas: { active: true, countries: { some: { country: { cca2: input.cca2 } } } },
				},
			},
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
					attributes: {
						where: { active: true },
						select: {
							data: true,
							text: { select: { tsKey: { select: { key: true, text: true } } } },
							attribute: {
								select: {
									icon: true,
									tsKey: true,
									tag: true,
									categories: {
										select: { category: { select: { tag: true } } },
									},
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
		const formattedAccessInstructions: Record<string, string | null | undefined>[] = []
		let descriptionText: Record<'key' | 'text', string> | null = null
		for (const { attributes, description } of services) {
			if (description) {
				descriptionText = description.tsKey
			}
			for (const { attribute, data, text } of attributes) {
				if (attribute.categories.find(({ category }) => category.tag === 'service-access-instructions')) {
					const parsedData = AccessInstructionSchema.parse(
						isSuperJSON(data)
							? superjson.deserialize<{ access_type: string; access_value: string }>(data)
							: data
					)
					formattedAccessInstructions.push({ tag: attribute.tag, ...parsedData, ...text?.tsKey })
				} else {
					const { tsKey, icon } = attribute
					attributeTags.push({ tsKey, icon })
				}
			}
		}

		return {
			id,
			name,
			accessInstructions: formattedAccessInstructions,
			description: descriptionText,
			community: attributeTags.at(0),
		}
	})

	return formattedData
}
export default getNatlCrisis
