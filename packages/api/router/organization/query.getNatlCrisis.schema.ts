import { z } from 'zod'

// Uppercased at the boundary, same as ZGetIntlCrisisSchema (#2067): search URLs carry a lowercase country
// code (`/search/us/...`) and `Country.cca2` is stored uppercase, so `'us'` silently matched no crisis lines
// and the search page never showed them.
export const ZGetNatlCrisisSchema = z.object({ cca2: z.string().length(2).toUpperCase() })
export type TGetNatlCrisisSchema = z.infer<typeof ZGetNatlCrisisSchema>
