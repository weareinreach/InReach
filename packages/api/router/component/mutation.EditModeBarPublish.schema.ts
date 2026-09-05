import { z } from 'zod'

import { OrgUnpublishedReason } from '@weareinreach/db/enums'
import { prefixedId } from '~api/schemas/idPrefix'

// `unpublishedReason`/`note` only apply to the Organization (slug) branch - OrgLocation/OrgService
// don't have this field, so publishing/unpublishing them stays a plain instant toggle. Required (via
// refine, not just optional) when unpublishing an org, so a null-reason unpublish can't happen even
// via a client bug that bypasses the UI's own popover.
const ZOrgPublishSchema = z
	.object({
		slug: z.string(),
		orgLocationId: z.never().optional(),
		orgServiceId: z.never().optional(),
		published: z.boolean(),
		unpublishedReason: z.nativeEnum(OrgUnpublishedReason).optional(),
		note: z.string().optional(),
	})
	.refine((data) => data.published || !!data.unpublishedReason, {
		message: 'A reason is required when unpublishing an organization.',
		path: ['unpublishedReason'],
	})

export const ZEditModeBarPublishSchema = z.union([
	ZOrgPublishSchema,
	z.object({
		orgLocationId: prefixedId('orgLocation'),
		slug: z.never().optional(),
		orgServiceId: z.never().optional(),
		published: z.boolean(),
	}),
	z.object({
		orgServiceId: prefixedId('orgService'),
		orgLocationId: z.never().optional(),
		slug: z.never().optional(),
		published: z.boolean(),
	}),
])
export type TEditModeBarPublishSchema = z.infer<typeof ZEditModeBarPublishSchema>
