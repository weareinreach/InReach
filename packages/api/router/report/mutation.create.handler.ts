import { getAuditedClient } from '@weareinreach/db'
import { ReportIssueType } from '@weareinreach/db/enums'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TCreateSchema } from './mutation.create.schema'

const issueTypeMap: Record<TCreateSchema['issueType'], ReportIssueType> = {
	'closed-inactive': ReportIssueType.CLOSED_INACTIVE,
	'incorrect-info': ReportIssueType.INCORRECT_INFO,
	'translation-quality': ReportIssueType.TRANSLATION_QUALITY,
	'something-else': ReportIssueType.SOMETHING_ELSE,
}

/**
 * Type guard to safely check for actorId in the context without using 'any'. This allows us to access
 * authentication data in a public procedure if it exists.
 */
function hasActorId(ctx: unknown): ctx is { actorId: string } {
	return (
		!!ctx &&
		typeof ctx === 'object' &&
		'actorId' in ctx &&
		typeof (ctx as Record<string, unknown>).actorId === 'string' &&
		!!(ctx as Record<string, unknown>).actorId &&
		(ctx as Record<string, unknown>).actorId !== 'undefined' &&
		(ctx as Record<string, unknown>).actorId !== 'null'
	)
}

const create = async ({ ctx, input }: TRPCHandlerParams<TCreateSchema, 'public'>) => {
	/**
	 * Reports can be submitted anonymously. Fallback to a prefixed, zeroed placeholder for the audited client
	 * if no actor is present. This matches the 'user_' prefix + 26-char ULID format.
	 */
	const actorId = hasActorId(ctx) ? ctx.actorId : 'user_00000000000000000000000000'

	const prisma = getAuditedClient(actorId)
	const { orgId, orgName, serviceId, serviceName, issueType, userNote, incorrectInfoFields, language, user } =
		input

	const result = await prisma.report.create({
		data: {
			organization: {
				connect: { id: orgId },
			},
			orgNameSnapshot: orgName,
			service: serviceId
				? {
						connect: { id: serviceId },
					}
				: undefined,
			serviceNameSnapshot: serviceName,
			issueType: issueTypeMap[issueType],
			incorrectFields: incorrectInfoFields || [],
			language: language ? { connect: { localeCode: language } } : undefined,
			userNote,
			reportedBy: hasActorId(ctx) ? { connect: { id: ctx.actorId } } : undefined,
			userEmail: user?.email || undefined,
			userName: user?.name || undefined,
		},
	})

	return result
}

export default create
