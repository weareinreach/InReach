import { type z } from 'zod'

import { prefixedId } from '~api/schemas/idPrefix'

export const ZForDuplicateWizardSchema = prefixedId('orgService')
export type TForDuplicateWizardSchema = z.infer<typeof ZForDuplicateWizardSchema>
