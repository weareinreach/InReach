import { Button, Group, NativeSelect, Stack } from '@mantine/core'
import {
	MantineReactTable,
	type MRT_ColumnDef,
	MRT_GlobalFilterTextInput,
	type MRT_Icons,
	MRT_TablePagination,
	useMantineReactTable,
} from 'mantine-react-table'

import { Icon } from '~ui/icon'

type Person = {
	name: string
	email: string
	appUserType: string
	role: string
	updatedAt: string
	createdAt: string
}

type ManagementTableProps = {
	data: Person[]
}

const columns: MRT_ColumnDef<Person>[] = [
	{
		accessorKey: 'name',
		header: 'Name',
	},
	{
		accessorKey: 'email',
		header: 'Email',
	},
	{
		accessorKey: 'appUserType',
		header: 'App User Type',
	},
	{ accessorKey: 'role', header: 'Back-end user type' },
	{
		accessorKey: 'updatedAt',
		header: 'Last updated',
	},
	{
		accessorKey: 'createdAt',
		header: 'Created At',
	},
]

const customIcons: Partial<MRT_Icons> = {
	//TODO: Fill in icons
}

export const ManagementTable = (props: ManagementTableProps) => {
	const table = useMantineReactTable<Person>({
		columns,
		data: props.data,
		enableGlobalFilter: true,
		enableFilterMatchHighlighting: false,
		positionGlobalFilter: 'left',
		enableRowSelection: true,
		mantineSearchTextInputProps: {
			placeholder: 'Enter Name', //label?
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
					size='xs'
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
							marginTop: '28px',
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
