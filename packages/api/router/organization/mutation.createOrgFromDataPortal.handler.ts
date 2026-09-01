import { SourceType } from '@weareinreach/db/enums'
import { type TRPCHandlerParams } from '~api/types/handler'

import { createOrgSuggestion } from './lib/createOrgSuggestion'
import { type TCreateOrgFromDataPortalSchema } from './mutation.createOrgFromDataPortal.schema'

const createOrgFromDataPortal = async ({
	ctx,
	input,
}: TRPCHandlerParams<TCreateOrgFromDataPortalSchema, 'protected'>) =>
	createOrgSuggestion({
		ctx,
		input,
		sourceValue: 'data-portal',
		sourceType: SourceType.SYSTEM,
		description: input.description,
	})

export default createOrgFromDataPortal
