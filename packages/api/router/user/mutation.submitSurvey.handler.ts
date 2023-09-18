import { prisma } from '@weareinreach/db'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TSubmitSurveySchema } from './mutation.submitSurvey.schema'

export const submitSurvey = async ({ input }: TRPCHandlerParams<TSubmitSurveySchema>) => {
	const survey = await prisma.userSurvey.create(input)
	return survey.id
}
