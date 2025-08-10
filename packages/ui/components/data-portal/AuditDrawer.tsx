import {
	Button,
	createStyles,
	Drawer,
	Group,
	Loader,
	Pagination,
	rem,
	Stack,
	Table,
	Text,
	Title,
} from '@mantine/core'
import { useMemo, useState } from 'react'

import { trpc as api } from '~ui/lib/trpcClient'
import { ModalTitle } from '~ui/modals/ModalTitle'

const useStyles = createStyles(() => ({
	drawerTitleWrapper: {
		maxWidth: '100% !important',

		[`& div.mantine-Group-root > div:first-of-type`]: {
			maxWidth: '100% !important',
		},
	},
	scrollableTable: {
		marginTop: rem(24),
		maxHeight: 'calc(100vh - 200px)',
		overflow: 'auto',
	},
}))

export const AuditDrawer = ({
	opened,
	onClose,
	recordId,
	name,
}: {
	opened: boolean
	onClose: () => void
	recordId: string
	name: string
}) => {
	const { classes } = useStyles()
	const [page, setPage] = useState(1)
	const pageSize = 20
	const [showAdminDetails, setShowAdminDetails] = useState(false)

	const drawerTitle = useMemo(
		() => <ModalTitle breadcrumb={{ option: 'close', onClick: onClose }} />,
		[onClose]
	)

	// Use the tRPC hook to fetch the audit trail data, including pagination parameters.
	const { data, isLoading, error } = api.auditTrail.getAllForOrg.useQuery(
		{ slug: recordId, page, pageSize },
		{
			enabled: !!recordId && opened,
		}
	)

	// Use the data from the API response to get the total count and results.
	const auditTrail = data?.results
	const totalCount = data?.totalCount || 0
	const totalPages = Math.ceil(totalCount / pageSize)
	const colSpanValue = showAdminDetails ? 6 : 5

	// New named function to toggle admin details
	const toggleAdminDetails = () => {
		setShowAdminDetails(!showAdminDetails)
	}

	// Refactored logic to render table rows or the "no data" message
	const tableContent =
		auditTrail && auditTrail.length > 0 ? (
			auditTrail.map((item) => (
				<tr key={item.id}>
					<td>{new Date(item.timestamp).toLocaleString()}</td>
					<td>{item.user?.name}</td>
					<td>{item.table}</td>
					<td>{item.operation}</td>
					<td>
						{item.summary.map((summaryItem) => (
							// Changed key from index to summaryItem for stability
							<div key={summaryItem}>{summaryItem}</div>
						))}
					</td>
					{showAdminDetails && (
						<td>
							{Object.entries(item.details).map(([key, value]) => (
								<div key={key}>
									<strong>{key}:</strong> {value as string}
								</div>
							))}
						</td>
					)}
				</tr>
			))
		) : (
			<tr>
				<td colSpan={colSpanValue} style={{ textAlign: 'center' }}>
					No audit data available
				</td>
			</tr>
		)

	// Use if/else if/else to extract the nested ternary logic
	let mainContent
	if (isLoading) {
		mainContent = <Loader style={{ margin: 'auto', display: 'block' }} />
	} else if (error) {
		mainContent = (
			<Text color='red' style={{ textAlign: 'center' }}>
				Error loading audit trail data.
			</Text>
		)
	} else {
		mainContent = (
			<>
				<Stack style={{ textAlign: 'center', paddingTop: rem(40) }}>
					<Title>Activity Log</Title>
					<Text>{name}</Text>
					<Text>{recordId}</Text>
				</Stack>
				<Group position='right' mb='md'>
					<Button size='xs' color='green' onClick={toggleAdminDetails}>
						{showAdminDetails ? 'Hide Admin Details' : 'Show Admin Details'}
					</Button>
				</Group>
				<div className={classes.scrollableTable}>
					<Table striped style={{ borderCollapse: 'separate', borderSpacing: 0, width: '100%' }}>
						<thead style={{ background: '#e0e0e0', borderRadius: '10px', overflow: 'hidden' }}>
							<tr>
								<th>Time</th>
								<th>User</th>
								<th>Table</th>
								<th>Activity</th>
								<th>Updated fields</th>
								{showAdminDetails && <th>Admin details</th>}{' '}
							</tr>
						</thead>
						<tbody>{tableContent}</tbody>
					</Table>
				</div>
			</>
		)
	}

	return (
		<Drawer
			opened={opened}
			onClose={onClose}
			position='bottom'
			size='95vh'
			padding='md'
			withCloseButton={false}
			title={drawerTitle}
			classNames={{
				title: classes.drawerTitleWrapper,
			}}
		>
			<div style={{ overflowX: 'auto', marginBottom: rem(32) }}>{mainContent}</div>

			<div style={{ display: 'flex', justifyContent: 'center', marginTop: rem(16) }}>
				<Pagination total={totalPages} value={page} onChange={setPage} />
			</div>
		</Drawer>
	)
}
