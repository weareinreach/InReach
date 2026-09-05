import { SourceType } from '@weareinreach/db/enums'
import { type TRPCHandlerParams } from '~api/types/handler'

import { createOrgSuggestion } from './lib/createOrgSuggestion'
import { type TCreateNewSuggestionSchema } from './mutation.createNewSuggestion.schema'

const createNewSuggestion = async ({
	ctx,
	input,
}: TRPCHandlerParams<TCreateNewSuggestionSchema, 'protected'>) =>
	createOrgSuggestion({ ctx, input, sourceValue: 'suggestion', sourceType: SourceType.USER })

export default createNewSuggestion
