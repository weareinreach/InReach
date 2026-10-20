import { z } from 'zod'

export const ZDecideSchema = z.object({
	type: z.enum(['phone', 'email', 'website', 'socialMedia']),
	id: z.string(),
	/**
	 * - `orgAndLocations`: the organization's - shown on its page and on the locations it's listed at
	 * - `locationsOnly`: the location's own - shown on those locations only
	 * - `orgOnly`: the organization's only - shown on its page, taken off those locations
	 */
	choice: z.enum(['orgAndLocations', 'locationsOnly', 'orgOnly']),
})
export type TDecideSchema = z.infer<typeof ZDecideSchema>
