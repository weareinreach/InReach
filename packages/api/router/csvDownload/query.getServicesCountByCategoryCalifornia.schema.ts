import { z } from 'zod'

export const ZGetServicesCountByCategoryCaliforniaSchema = z.void()

export type TGetServicesCountByCategoryCaliforniaSchema = z.infer<
	typeof ZGetServicesCountByCategoryCaliforniaSchema
>
