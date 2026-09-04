import { OrgUnpublishedReason } from './index'

export const ORG_UNPUBLISHED_REASON_LABELS: Record<OrgUnpublishedReason, string> = {
	[OrgUnpublishedReason.NEW]: 'New',
	[OrgUnpublishedReason.IN_PROGRESS]: 'In progress',
	[OrgUnpublishedReason.WAITING]: 'Waiting to hear back',
	[OrgUnpublishedReason.INACTIVE]: 'Inactive',
	[OrgUnpublishedReason.UNAFFIRMING]: 'Unaffirming',
	[OrgUnpublishedReason.UNRESPONSIVE]: 'Unresponsive',
}
