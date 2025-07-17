import { Button, Group, Modal, NativeSelect, Stack, Switch, Text } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import {
	MantineReactTable,
	type MRT_ColumnDef,
	MRT_GlobalFilterTextInput,
	type MRT_Icons,
	MRT_TablePagination,
	useMantineReactTable,
} from 'mantine-react-table'
import { useTranslation } from 'next-i18next'
import { useCallback, useMemo } from 'react'

import { type ApiOutput } from '@weareinreach/api'
import { Link } from '~ui/components/core/Link'
import { Icon } from '~ui/icon'
import { trpc as api } from '~ui/lib/trpcClient'

const customIcons: Partial<MRT_Icons> = {
	IconSortAscending: () => <Icon icon={'carbon:chevron-up'} color='black' />,
	IconSortDescending: () => <Icon icon={'carbon:chevron-down'} color='black' />,
}

const DataPortalUserConfirmModal = ({ current, userId }: { current: boolean; userId: string }) => {
	const [opened, handler] = useDisclosure(false)
	const apiUtils = api.useUtils()
	const updateAccess = api.user.toggleDataPortalAccess.useMutation({
		onSettled: () => {
			handler.close()
		},
		onSuccess: () => {
			setTimeout(apiUtils.user.invalidate, 500)
		},
	})

	const createToggleHandler = useCallback(
		(userId: string, current: boolean) => () =>
			updateAccess.mutate({ userId, action: current ? 'deny' : 'allow' }),
		[updateAccess]
	)

	return (
		<>
			<Modal opened={opened} onClose={handler.close} title='Data Portal Access'>
				{current ? (
					<p>Are you sure you want to remove this user's access to the data portal?</p>
				) : (
					<p>Are you sure you want to give this user access to the data portal?</p>
				)}
				<Button onClick={createToggleHandler(userId, current)}>Yes</Button>
				<Button onClick={handler.close}>No</Button>
			</Modal>
			<Switch onChange={handler.toggle} checked={current} />
		</>
	)
}

const PasswordResetModal = ({ email }: { email: string }) => {
	const [opened, handler] = useDisclosure(false)
	const { t } = useTranslation('common')
	const resetPw = api.user.forgotPassword.useMutation({
		onSettled: handler.close,
	})
	const cognitoSubject = t('password-reset.email-subject')
	const cognitoMessage = t('password-reset.email-body')

	const createResetHandler = useCallback(
		(email: string) => () => {
			resetPw.mutate({ email, cognitoSubject, cognitoMessage })
		},
		[cognitoSubject, cognitoMessage, resetPw]
	)

	return (
		<>
			<Modal opened={opened} onClose={handler.close} title='Reset Password'>
				<p>Are you sure you want to reset this user's password?</p>
				<Button onClick={createResetHandler(email)}>Yes</Button>
				<Button onClick={handler.close}>No</Button>
			</Modal>
			<Link onClick={handler.open}>Reset</Link>
		</>
	)
}

export const UserTable = () => {
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
				Cell: ({ cell }) => {
					return cell.getValue<boolean>() ? 'Yes' : 'No'
				},
			},
			{
				accessorKey: 'canAccessDataPortal',
				header: 'Data Portal Access?',
				Cell: ({ cell }) => {
					const currentValue = cell.getValue<boolean>()
					return <DataPortalUserConfirmModal current={currentValue} userId={cell.row.original.id} />
				},
			},
			{
				header: 'Reset Password',
				Cell: ({ cell }) => {
					return <PasswordResetModal email={cell.row.original.email} />
				},
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
