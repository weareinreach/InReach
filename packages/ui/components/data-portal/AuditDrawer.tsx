import { Drawer, Loader, Pagination, Stack, Table, Text, Title } from '@mantine/core'
import { useEffect, useMemo, useState } from 'react'

import { ModalTitle } from '~ui/modals/ModalTitle'
import { Button } from '~ui/components/core/Button'


import { trpc } from '~api/trpc'

interface AuditDrawerProps {
	opened: boolean
	onClose: () => void
	recordId: string
}

interface AuditLogItem {
	id: string
	timestamp: string
	actorId: string
	operation: string
	diff: Record<string, any> // You may adjust this type if needed based on the actual structure of `diff`
}

export const AuditDrawer: React.FC<AuditDrawerProps> = ({ opened, onClose, recordId }) => {
	const [data, setData] = useState<AuditLogItem[]>([])
	const [loading, setLoading] = useState(false)
	const [page, setPage] = useState(1)
	const [totalPages, setTotalPages] = useState(10)

	const drawerTitle = useMemo(
		() => <ModalTitle breadcrumb={{ option: 'close', onClick: onClose }} maxWidth='100%' />,
		[onClose]
	)

	// Fetch data only when drawer is open or page changes
	useEffect(() => {
		if (!opened || !recordId) return

		// const fetchData = async () => {
		// 	setLoading(true)

		// 	try {
		// 		// Call the trpc API
		// 		const response = await trpc.system.auditLogByRecordId.query({
		// 			recordId: [recordId], // Ensure it's an array
		// 			skip: (page - 1) * 10,
		// 			take: 10,
		// 			sort: 'new',
		// 		})

		// 		setData(response || [])
		// 		// If the response has pagination info, set totalPages here
		// 		setTotalPages(Math.ceil(response.length / 10)) // Adjust pagination based on response length
		// 	} catch (error) {
		// 		console.error('Error fetching audit data:', error)
		// 	}

		// 	setLoading(false)
		// }

		const fetchData = async () => {
			setLoading(true)

			try {
				// Placeholder response instead of API call
				const response = [
					{
						id: '1',
						timestamp: new Date().toISOString(),
						actorId: 'user123',
						operation: 'UPDATE',
						diff: { field1: 'oldValue → newValue' },
					},
					{
						id: '2',
						timestamp: new Date().toISOString(),
						actorId: 'user456',
						operation: 'INSERT',
						diff: { field2: 'null → someValue' },
					},
				]

				setData(response)
				setTotalPages(1)
			} catch (error) {
				console.error('Error fetching audit data:', error)
			}

			setLoading(false)
		}

		fetchData()
	}, [opened, page, recordId])

	return (
		<Drawer
			opened={opened}
			onClose={onClose}
			position='bottom'
			size='95vh'
			padding='md'
			withCloseButton={false}
			title={drawerTitle}
		>
			{/* Body */}
			<div style={{ overflowX: 'auto', marginBottom: '2rem' }}>
				{loading ? (
					<Loader />
				) : (
					<>
						<Stack style={{ textAlign: 'center' }}>
							<Title>Activity Log</Title>
							<Text>Organization Name</Text>
							<Text>Placeholder Data</Text>
						</Stack>
						<Table style={{ borderCollapse: 'separate', borderSpacing: 0, width: '100%' }}>
							<thead style={{ background: '#e0e0e0', borderRadius: '10px', overflow: 'hidden' }}>
								<tr>
									<th>Time</th>
									<th>User</th>
									<th>Activity</th>
									<th>Updated fields</th>
								</tr>
							</thead>
							<tbody>
								{data.length > 0 ? (
									data.map((item) => (
										<tr key={item.id}>
											<td>{item.timestamp}</td>
											<td>{item.actorId}</td>
											<td>{item.operation}</td>
											<td>{JSON.stringify(item.diff)}</td>
										</tr>
									))
								) : (
									<tr>
										<td colSpan={4} style={{ textAlign: 'center' }}>
											No audit data available
										</td>
									</tr>
								)}
							</tbody>
						</Table>
					</>
				)}
			</div>

			{/* Pagination Controls */}
			<div
				style={{
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center',
					padding: '1rem 0',
					borderTop: '1px solid #ddd',
				}}
			>
				<Pagination total={totalPages} page={page} onChange={setPage} siblings={1} />
				<div>
					<Button variant='subtle' disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
						Prev
					</Button>
					<Button variant='subtle' disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>
						Next
					</Button>
				</div>
			</div>
		</Drawer>
	)
}
