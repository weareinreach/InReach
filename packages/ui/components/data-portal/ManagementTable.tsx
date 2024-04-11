import { Button, Group, NativeSelect, Stack, Text } from '@mantine/core'
import {
	MantineReactTable,
	type MRT_ColumnDef,
	MRT_GlobalFilterTextInput,
	type MRT_Icons,
	MRT_TablePagination,
	useMantineReactTable,
} from 'mantine-react-table'
import { useMemo } from 'react'

import { type ApiOutput } from '@weareinreach/api'
import { Icon } from '~ui/icon'
import { trpc as api } from '~ui/lib/trpcClient'

const customIcons: Partial<MRT_Icons> = {
	IconSortAscending: () => <Icon icon={'carbon:chevron-up'} color='black' />,
	IconSortDescending: () => <Icon icon={'carbon:chevron-down'} color='black' />,
}

export const ManagementTable = () => {
	const { data: userData } = api.user.forUserTable.useQuery()

	const columns = useMemo<MRT_ColumnDef<UserDataRecord>[]>(
		() => [
			{
				accessorKey: 'name',
				header: 'Name',
			},
			{
				accessorKey: 'email',
				header: 'Email',
			},
			{
				accessorKey: 'emailVerified',
				header: 'Email Verified',
				Cell: ({ cell }) => {
					const cellValue = cell.getValue()
					if (cellValue instanceof Date) {
						return cellValue.toISOString()
					}
					return null
				},
			},
			{
				accessorKey: 'updatedAt',
				header: 'Last updated',
				Cell: ({ cell }) => {
					return cell.getValue<Date>().toISOString()
				},
			},
			{
				accessorKey: 'createdAt',
				header: 'Created At',
				Cell: ({ cell }) => {
					return cell.getValue<Date>().toISOString()
				},
			},
			{
				accessorKey: 'active',
				header: 'Active',
			},
		],
		[]
	)

	const table = useMantineReactTable({
		columns,
		data: userData ?? [],
		icons: customIcons,
		enableGlobalFilter: true,
		enableFilterMatchHighlighting: false,
		positionGlobalFilter: 'left',
		enableRowSelection: true,
		mantineSearchTextInputProps: {
			placeholder: 'Enter Name',
			sx: { minWidth: '734px', height: '48px' },
		},
		initialState: {
			showGlobalFilter: true,
		},
		enableTopToolbar: false,
		enableBottomToolbar: false,
		enablePagination: true,
		mantinePaginationProps: {
			withEdges: false,
			siblings: 0,
			showRowsPerPage: false,
		},
		paginationDisplayMode: 'pages',
		layoutMode: 'semantic',
	})

	return (
		<Stack>
			<Text size='16px' fw={500} style={{ marginBottom: '-1rem' }}>
				Total: {userData?.length ?? 0}
			</Text>
			<Group
				noWrap={true}
				position='left'
				spacing={'16px'}
				style={{
					marginBottom: '4px',
				}}
			>
				<MRT_GlobalFilterTextInput table={table} />
				<NativeSelect
					rightSection={<Icon icon='carbon:chevron-down' />}
					data={['Data Entry Teams']}
					styles={{
						root: {
							width: '208px',
							height: '48px',
						},
						input: { paddingLeft: '16px', paddingRight: '16px', paddingTop: '12px', paddingBottom: '12px' },
					}}
				/>
				<Button
					styles={{
						root: {
							backgroundColor: 'inherit',
							border: 'none',
							width: '48px',
							height: '48px',
							padding: '12px',
							marginTop: '10px',
						},
						label: { color: 'black' },
					}}
				>
					<Icon icon='carbon:overflow-menu-horizontal' />
				</Button>
			</Group>
			<Stack>
				<MantineReactTable table={table} />
				<MRT_TablePagination table={table} />
			</Stack>
		</Stack>
	)
}

type UserDataRecord = NonNullable<ApiOutput['user']['forUserTable']>[number]
