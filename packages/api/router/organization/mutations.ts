import { handleError } from '~api/lib'
import { defineRouter, permissionedProcedure, protectedProcedure } from '~api/lib/trpc'
import {
	type CreateQuickOrgInput,
	CreateQuickOrgSchema,
	CreateOrgSuggestionSchema,
	type CreateOrgSuggestionInput,
} from '~api/schemas/create/organization'

export const mutations = defineRouter({
	createNewQuick: permissionedProcedure
		.meta({ hasPerm: 'createOrg' })
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
})
