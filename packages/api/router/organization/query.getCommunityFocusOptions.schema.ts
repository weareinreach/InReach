import { z } from 'zod'

export const ZGetCommunityFocusOptionsSchema = z.void()

export type TGetCommunityFocusOptionsSchema = z.infer<typeof ZGetCommunityFocusOptionsSchema>
