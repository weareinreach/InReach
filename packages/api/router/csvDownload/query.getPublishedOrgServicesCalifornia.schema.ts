import { z } from 'zod'

export const ZGetPublishedOrgServicesCaliforniaSchema = z.void()

export type TGetPublishedOrgServicesCaliforniaSchema = z.infer<
	typeof ZGetPublishedOrgServicesCaliforniaSchema
>
