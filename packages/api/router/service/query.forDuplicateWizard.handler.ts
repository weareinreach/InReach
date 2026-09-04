import { prisma } from '@weareinreach/db'
import { handleError } from '~api/lib/errorHandler'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TForDuplicateWizardSchema } from './query.forDuplicateWizard.schema'

const forDuplicateWizard = async ({ input }: TRPCHandlerParams<TForDuplicateWizardSchema>) => {
	try {
		const result = await prisma.orgService.findUniqueOrThrow({
			where: { id: input },
			select: {
				serviceName: { select: { tsKey: { select: { text: true } } } },
				locations: {
					where: { active: true },
					select: { location: { select: { id: true, name: true } } },
				},
			},
		})

		return {
			name: result.serviceName?.tsKey.text ?? '',
			locations: result.locations.map(({ location }) => location),
		}
	} catch (err) {
		return handleError(err)
	}
}
export default forDuplicateWizard
