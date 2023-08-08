import { prisma } from '@weareinreach/db'
import { handleError } from '~api/lib/errorHandler'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TSubmitSurveySchema } from './mutation.submitSurvey.schema'

export const submitSurvey = async ({ input }: TRPCHandlerParams<TSubmitSurveySchema>) => {
	try {
		const survey = await prisma.userSurvey.create(input)
		return survey.id
	} catch (error) {
		handleError(error)
	}
}
