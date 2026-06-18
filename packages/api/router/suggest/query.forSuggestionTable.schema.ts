import { z } from 'zod'

export const ZForSuggestionTableSchema = z.void()
export type TForSuggestionTableSchema = z.infer<typeof ZForSuggestionTableSchema>
