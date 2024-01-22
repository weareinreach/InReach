import { crowdinApi, getStringIdByKey, projectId } from '@weareinreach/crowdin/api'
import {
	generateFreeText,
	generateId,
	generateUniqueSlug,
	getAuditedClient,
	type Prisma,
} from '@weareinreach/db'
import { isVercelProd } from '@weareinreach/env'
import { createLoggerInstance } from '@weareinreach/util/logger'
import { handleError } from '~api/lib/errorHandler'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TUpdateBasicSchema } from './mutation.updateBasic.schema'

const logger = createLoggerInstance('api - organization.updateBasic')
export const updateBasic = async ({ ctx, input }: TRPCHandlerParams<TUpdateBasicSchema, 'protected'>) => {
	try {
		const prisma = getAuditedClient(ctx.actorId)
		const data: Prisma.OrganizationUpdateInput = {}
		const existing = await prisma.organization.findUniqueOrThrow({
			where: { id: input.id },
			select: { slug: true, description: { select: { tsKey: { select: { crowdinId: true, key: true } } } } },
		})

		if (input.name) {
			const newSlug = await generateUniqueSlug({ name: input.name, id: input.id })
			data.name = input.name
			data.slug = newSlug
			data.oldSlugs = { create: { from: existing.slug, to: newSlug, id: generateId('slugRedirect') } }
		}
		if (input.description) {
			// TODO: [IN-920] Handle new string creation in Crowdin
			const newText = generateFreeText({ orgId: input.id, type: 'orgDesc', text: input.description })
			data.description = {
				upsert: {
					update: { tsKey: { update: { text: input.description } } },
					create: { id: newText.freeText.id, tsKey: { create: newText.translationKey } },
				},
			}
		}
		const update = await prisma.organization.update({
			where: { id: input.id },
			data,
		})
		if (update && input.description && existing.description) {
			const stringId =
				existing.description.tsKey.crowdinId ||
				(await getStringIdByKey(existing.description?.tsKey.key, true))
			if (stringId) {
				if (isVercelProd) {
					await crowdinApi.sourceStringsApi.editString(projectId, stringId, [
						{ op: 'replace', path: '/text', value: input.description },
					])
				} else {
					logger.info(
						`\n==========\nSkipping Crowdin Update - Not production environment.\nCrowdin String ID: ${stringId}. Updated Description: ${input.description}\n==========`
					)
				}
			}
		}
		return update
	} catch (error) {
		handleError(error)
	}
}
