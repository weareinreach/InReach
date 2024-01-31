import { type Prisma } from '@weareinreach/db'
import { accessInstructions } from '@weareinreach/db/zod_util/attributeSupplement'
import { isSuperJSONResult, superjson } from '@weareinreach/util/transformer'

const AccessSchema = accessInstructions.getAll()
export const formatAccessDetails = {
	prismaSelect: (showAll?: boolean) =>
		({
			...(showAll
				? {}
				: ({
						where: {
							active: true,
							attribute: { active: true },
						},
					} as const)),
			select: {
				attribute: {
					select: {
						id: true,
						// tsKey: true,
						// tsNs: true
					},
				},
				supplement: {
					select: {
						id: true,
						data: true,
						text: { select: { tsKey: { select: { key: true, text: true, ns: true } } } },
					},
					...(showAll ? {} : { where: { active: true } }),
				},
			},
		}) as const,
	process: (data: AccessDetailData) => {
		return data.flatMap(({ attribute, supplement }) => {
			const { id: attrId, ...attrib } = attribute
			if (supplement.length) {
				return supplement.map(({ id: suppId, data, text, ...supp }) => {
					const parsedData = AccessSchema.safeParse(
						isSuperJSONResult(data) ? superjson.deserialize(data) : data
					)
					return {
						attrId,
						...attrib,
						suppId,
						data: parsedData.success ? parsedData.data : null,
						text: text?.tsKey ?? null,
						...supp,
					}
				})
			}
			return { attrId, suppId: '', data: null, text: null, ...attrib }
		})
	},
}

type AccessDetailData = {
	attribute: {
		id: string
		// tsKey: string
		// tsNs: string
	}
	supplement: {
		id: string
		data: Prisma.JsonValue
		text: {
			tsKey: {
				text: string
				key: string
				ns: string
			}
		} | null
	}[]
}[]
