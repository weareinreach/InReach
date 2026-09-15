import { z } from 'zod'

import { emptyStringToNull, prefixedId } from '~api/schemas/idPrefix'

// Users overwhelmingly type URLs without a scheme (e.g. "www.example.org") - rather than reject
// that, treat it as shorthand for https:// and fill it in before validating.
const addSchemeIfMissing = (value: unknown) =>
	typeof value === 'string' && value !== '' && !/^https?:\/\//i.test(value) ? `https://${value}` : value

const base = z
	.object({
		id: prefixedId('orgWebsite'),
		url: z.preprocess(
			addSchemeIfMissing,
			z.string().url('Invalid URL. Must start with either "https://" or "http://"')
		),
		description: z.string().nullable(),
		isPrimary: z.boolean(),
		published: z.boolean(),
		deleted: z.boolean(),
		organizationId: prefixedId('organization'),
		orgLocationId: z.preprocess(emptyStringToNull, prefixedId('orgLocation').nullable()),
		orgLocationOnly: z.boolean(),
	})
	.partial()

const create = z
	.object({
		operation: z.literal('create'),
	})
	.merge(base.required({ url: true, organizationId: true }))
const update = z
	.object({
		operation: z.literal('update'),
	})
	.merge(base.required({ id: true }))

export type Create = z.infer<typeof create>
export type Update = z.infer<typeof update>

export const ZUpsertSchema = z.discriminatedUnion('operation', [create, update])
export type TUpsertSchema = z.infer<typeof ZUpsertSchema>
