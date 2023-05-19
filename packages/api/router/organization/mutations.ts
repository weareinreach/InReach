import { handleError } from '~api/lib/errorHandler'
import { defineRouter, permissionedProcedure, protectedProcedure } from '~api/lib/trpc'
import {
	AttachOrgAttribute,
	type CreateOrgSuggestionInput,
	CreateOrgSuggestionSchema,
	type CreateQuickOrgInput,
	CreateQuickOrgSchema,
} from '~api/schemas/create/organization'

export const mutations = defineRouter({
	createNewQuick: permissionedProcedure('createNewOrgQuick')
		.input(CreateQuickOrgSchema().inputSchema)
		.mutation(async ({ ctx, input }) => {
			try {
				const inputData = {
					actorId: ctx.session.user.id,
					operation: 'CREATE',
					data: input,
				} satisfies CreateQuickOrgInput

				const record = CreateQuickOrgSchema().dataParser.parse(inputData)

				const result = await ctx.prisma.organization.create(record)

				return result
			} catch (error) {
				handleError(error)
			}
		}),
	createNewSuggestion: protectedProcedure
		.input(CreateOrgSuggestionSchema().inputSchema)
		.mutation(async ({ ctx, input }) => {
			try {
				const inputData = {
					actorId: ctx.session.user.id,
					operation: 'CREATE',
					data: input,
				} satisfies CreateOrgSuggestionInput

				const record = CreateOrgSuggestionSchema().dataParser.parse(inputData)
				const result = await ctx.prisma.suggestion.create(record)
				return result
			} catch (error) {
				handleError(error)
			}
		}),
	attachAttribute: permissionedProcedure('attachOrgAttributes')
		.input(AttachOrgAttribute().inputSchema)
		.mutation(async ({ ctx, input }) => {
			const inputData = { actorId: ctx.session.user.id, operation: 'LINK', data: input }
			const { translationKey, freeText, attributeSupplement, organizationAttribute, auditLogs } =
				AttachOrgAttribute().dataParser.parse(inputData)

			const result = await ctx.prisma.$transaction(async (tx) => {
				const tKey = translationKey ? await tx.translationKey.create(translationKey) : undefined
				const fText = freeText ? await tx.freeText.create(freeText) : undefined
				const aSupp = attributeSupplement
					? await tx.attributeSupplement.create(attributeSupplement)
					: undefined
				const attrLink = await tx.organizationAttribute.create(organizationAttribute)
				const logs = await tx.auditLog.createMany({ data: auditLogs, skipDuplicates: true })
				return {
					translationKey: tKey,
					freeText: fText,
					attributeSupplement: aSupp,
					organizationAttribute: attrLink,
					auditLog: logs,
				}
			})
			return result
		}),
})
