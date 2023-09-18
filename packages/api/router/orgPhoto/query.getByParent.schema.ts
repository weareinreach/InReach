import { z } from 'zod'

import { prefixedId } from '~api/schemas/idPrefix'

export const ZGetByParentSchema = z.union([prefixedId('organization'), prefixedId('orgLocation')])
export type TGetByParentSchema = z.infer<typeof ZGetByParentSchema>
