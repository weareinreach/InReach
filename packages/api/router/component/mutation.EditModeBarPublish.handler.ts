import { getAuditedClient } from '@weareinreach/db'
import { ORG_UNPUBLISHED_REASON_LABELS } from '@weareinreach/db/enums/labels'
import { handleError } from '~api/lib/errorHandler'
import { type TRPCHandlerParams } from '~api/types/handler'

import { type TEditModeBarPublishSchema } from './mutation.EditModeBarPublish.schema'

const EditModeBarPublish = async ({
	ctx,
	input,
}: TRPCHandlerParams<TEditModeBarPublishSchema, 'protected'>) => {
	try {
		const prisma = getAuditedClient(ctx.actorId)
		const { published, orgLocationId, orgServiceId, slug } = input
		switch (true) {
			case !!slug: {
				// `unpublishedReason`/`note` only exist on this (Organization) branch of the schema's union -
				// TS can't narrow that from the `!!slug` check alone, so re-destructure from `input` here.
				const { unpublishedReason, note } = input as Extract<TEditModeBarPublishSchema, { slug: string }>
				const result = await prisma.$transaction(async (tx) => {
					const updated = await tx.organization.update({
						where: { slug },
						// Clearing the reason on publish is deliberate - a stale reason left behind on a
						// currently-published org would be actively misleading if it's unpublished again later
						// before anyone gets around to setting a fresh one.
						data: { published, unpublishedReason: published ? null : unpublishedReason },
						select: { id: true, published: true },
					})
					// Mirrors packages/api/router/report/mutation.update.handler.ts: always leave a readable
					// breadcrumb in Internal Notes, using the user's text if given or an auto-generated
					// fallback if not - satisfies "generic audit trail is enough" with something a human can
					// actually read, not just a raw AuditTrail diff.
					const fallbackText = published
						? 'Status updated to Published'
						: `Status updated to ${unpublishedReason ? ORG_UNPUBLISHED_REASON_LABELS[unpublishedReason] : 'Unpublished'}`
					await tx.internalNote.create({
						data: {
							text: note?.trim() || fallbackText,
							organization: { connect: { id: updated.id } },
							user: { connect: { id: ctx.actorId } },
						},
					})
					return { published: updated.published }
				})
				return result
			}
			case !!orgLocationId: {
				const result = await prisma.orgLocation.update({
					where: { id: orgLocationId },
					data: { published },
					select: { published: true },
				})
				return result
			}
			case !!orgServiceId: {
				const result = await prisma.orgService.update({
					where: { id: orgServiceId },
					data: { published },
					select: { published: true },
				})
				return result
			}
			default: {
				throw new Error('Invalid input')
			}
		}
	} catch (error) {
		return handleError(error)
	}
}
export default EditModeBarPublish
