import { Drawer, Pagination, rem, Stack, Table, Text, Title } from '@mantine/core'
import { useState } from 'react'

import { trpc as api } from '~ui/lib/trpcClient'
import { ModalTitle } from '~ui/modals/ModalTitle'

import classes from './OrgUrlExceptionNotesDrawer.module.css'

/**
 * Activity log for a single base-URL exception - who created/edited/deleted/restored it and what changed,
 * each time. Reuses the `drawerTitleWrapper` CSS fix from `OrgUrlExceptionNotesDrawer` (same underlying
 * ModalTitle-inside-a-Drawer truncation issue applies here identically).
 */
export const OrgUrlExceptionAuditDrawer = ({
	opened,
	onClose,
	exceptionId,
	baseUrl,
}: {
	opened: boolean
	onClose: () => void
	exceptionId: string
	baseUrl: string
}) => {
	const [page, setPage] = useState(1)
	const pageSize = 20

	const { data, isLoading } = api.orgUrlDuplicateException.auditLog.useQuery(
		{ id: exceptionId, page, pageSize },
		{ enabled: opened }
	)

	const entries = data?.results ?? []
	const totalPages = Math.ceil((data?.total ?? 0) / pageSize)

	return (
		<Drawer
			opened={opened}
			onClose={onClose}
			position='bottom'
			size='75vh'
			padding='md'
			withCloseButton={false}
			title={<ModalTitle breadcrumb={{ option: 'close', onClick: onClose }} />}
			classNames={{ title: classes.drawerTitleWrapper }}
		>
			<Stack align='center' pt={rem(24)}>
				<Title order={3}>Activity Log</Title>
				<Text size='sm' c='dimmed'>
					{baseUrl}
				</Text>
			</Stack>
			{isLoading ? (
				<Text ta='center' mt='md'>
					Loading activity...
				</Text>
			) : entries.length === 0 ? (
				<Text ta='center' mt='md'>
					No activity recorded yet.
				</Text>
			) : (
				<Table striped mt='md'>
					<thead>
						<tr>
							<th>Time</th>
							<th>User</th>
							<th>Action</th>
							<th>Details</th>
						</tr>
					</thead>
					<tbody>
						{entries.map((entry) => (
							<tr key={entry.id}>
								<td>
									<Text size='sm'>{new Date(entry.timestamp).toLocaleString()}</Text>
								</td>
								<td>
									<Text size='sm'>{entry.actorName}</Text>
								</td>
								<td>
									<Text size='sm'>{entry.operation}</Text>
								</td>
								<td>
									{entry.summary.map((line) => (
										<Text size='sm' key={line}>
											{line}
										</Text>
									))}
								</td>
							</tr>
						))}
					</tbody>
				</Table>
			)}
			{totalPages > 1 && (
				<Stack align='center' mt='md'>
					<Pagination total={totalPages} value={page} onChange={setPage} />
				</Stack>
			)}
		</Drawer>
	)
}
