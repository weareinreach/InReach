import { z } from 'zod'

const isURL = (string: string) => z.string().url().safeParse(string).success

const email = z.object({
	access_type: z.literal('email'),
	access_value: z.string().email(),
	instructions: z.string(),
})
const url = z.object({
	access_type: z.enum(['file', 'link']),
	access_value: z.string().url(),
	instructions: z.string(),
})
const other = z.object({
	access_type: z.enum(['phone', 'other', 'location', 'publicTransit']),
	access_value: z.string(),
	instructions: z.string(),
})

export const accessInstructions = z
	.discriminatedUnion('access_type', [email, url, other])
	.transform((data) => {
		if (data.access_type === 'other' && isURL(data.access_value)) {
			const { access_value, instructions } = data
			const access_type = 'link' as const
			return {
				access_type,
				access_value,
				instructions,
			}
		}
		return data
	})
