import { Button, Group, Modal, NativeSelect, Select, Stack, Text } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { DateTime } from 'luxon'
import {
	MantineReactTable,
	type MRT_ColumnDef,
	MRT_GlobalFilterTextInput,
	type MRT_Icons,
	MRT_TablePagination,
	useMantineReactTable,
} from 'mantine-react-table'
import { useSession } from 'next-auth/react'
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

const DATA_PORTAL_ACCESS_OPTIONS = [
	{ value: 'none', label: 'None' },
	{ value: 'dataPortalBasic', label: 'Basic Access' },
	{ value: 'dataPortalManager', label: 'Manager Access' },
	{ value: 'dataPortalAdmin', label: 'Admin Access' },
	{ value: 'root', label: 'Superuser (Root)' },
]

const formatPermissionName = (name: string) => {
	const option = DATA_PORTAL_ACCESS_OPTIONS.find((opt) => opt.value === name)
	return option ? option.label : name
}

type CurrentUserPermissions = string[]

const getRoleLevel = (role: string | undefined) => {
	switch (role) {
		case 'root':
			return 4
		case 'dataPortalAdmin':
			return 3
		case 'dataPortalManager':
			return 2
		case 'dataPortalBasic':
			return 1
		default:
			return 0
	}
}

// --- DataPortalAccessSelect Component ---
const DataPortalAccessSelect = ({
	activePermissionName,
	userId,
	loggedInUserPermissions,
}: {
	activePermissionName: string | undefined
	userId: string
	loggedInUserPermissions: CurrentUserPermissions | undefined
}) => {
	const apiUtils = api.useUtils()

	const updateAccess = api.user.toggleDataPortalAccess.useMutation({
		onSuccess: (data) => {
			apiUtils.user.forUserTable.setData(undefined, (oldData) => {
				if (!oldData) return oldData
				return oldData.map((user) => {
					if (user.id === userId) {
						return {
							...user,
							canAccessDataPortal: data.canAccessDataPortal,
							permissionId: data.permissionId,
							permissionName: data.permissionName,
						}
					}
					return user
				})
			})
		},
		onError: (error) => {
			console.error('Error updating data portal access:', error)
			apiUtils.user.invalidate()
		},
	})

	const handleLevelChange = useCallback(
		(newLevelValue: string | null) => {
			const selectedOption = DATA_PORTAL_ACCESS_OPTIONS.find((opt) => opt.value === newLevelValue)

			if (selectedOption && selectedOption.value === 'none') {
				updateAccess.mutate({ userId, action: 'deny' })
			} else if (selectedOption) {
				updateAccess.mutate({
					userId,
					action: 'allow',
					permissionId: selectedOption.value,
				})
			}
		},
		[updateAccess, userId]
	)

	const filteredAccessOptions = useMemo(() => {
		const loggedInLevel = Math.max(...(loggedInUserPermissions || []).map(getRoleLevel))

		return DATA_PORTAL_ACCESS_OPTIONS.filter((opt) => {
			const optionLevel = getRoleLevel(opt.value)
			// Always show roles at/below my level OR the specific role the user currently has
			return optionLevel <= loggedInLevel || opt.value === activePermissionName
		}).map((option) => ({
			value: option.value,
			label: option.label,
			// Disable the option if it's a higher rank than the logged-in user
			disabled: getRoleLevel(option.value) > loggedInLevel,
		}))
	}, [loggedInUserPermissions, activePermissionName])

	const loggedInLevel = Math.max(...(loggedInUserPermissions || []).map(getRoleLevel))
	const targetLevel = getRoleLevel(activePermissionName || 'none')
	const isTargetHigherThanMe = targetLevel > loggedInLevel

	return (
		<Select
			data={filteredAccessOptions}
			value={activePermissionName || 'none'}
			onChange={handleLevelChange}
			placeholder='Select access'
			size='xs'
			disabled={isTargetHigherThanMe}
			styles={{
				root: { width: '260px' },
				input: {
					paddingRight: '24px',
					'&:disabled': {
						backgroundColor: '#f1f3f5',
						color: '#495057',
						opacity: 1,
						cursor: 'not-allowed',
						border: '1px solid #dee2e6',
					},
				},
			}}
			withinPortal={true}
		/>
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
	const { data: session } = useSession()
	const loggedInUserPermissions = session?.user?.permissions as CurrentUserPermissions | undefined

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
					const cellValue = cell.getValue<Date | null>()
					if (!cellValue) return null
					const date = DateTime.fromJSDate(cellValue)
					return <span>{date.toLocaleString(DateTime.DATETIME_SHORT)}</span>
				},
			},
			{
				accessorKey: 'updatedAt',
				header: 'Last updated',
				Cell: ({ cell }) => {
					const cellValue = cell.getValue<Date>()
					const date = DateTime.fromJSDate(cellValue)
					return <span>{date.toLocaleString(DateTime.DATETIME_SHORT)}</span>
				},
			},
			{
				accessorKey: 'createdAt',
				header: 'Created At',
				Cell: ({ cell }) => {
					const cellValue = cell.getValue<Date>()
					const date = DateTime.fromJSDate(cellValue)
					return <span>{date.toLocaleString(DateTime.DATETIME_SHORT)}</span>
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
				accessorKey: 'permissionName',
				header: 'Data Portal Access Level',
				size: 280,
				mantineTableBodyCellProps: {
					align: 'left',
					sx: {
						display: 'flex',
						alignItems: 'center',
					},
				},
				Cell: ({ cell }) => {
					const activePermissionName = cell.getValue<string | undefined>()

					return (
						<DataPortalAccessSelect
							activePermissionName={activePermissionName}
							userId={cell.row.original.id}
							loggedInUserPermissions={loggedInUserPermissions}
						/>
					)
				},
			},
			{
				header: 'Reset Password',
				Cell: ({ cell }) => {
					return <PasswordResetModal email={cell.row.original.email} />
				},
			},
		],
		[loggedInUserPermissions]
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
			<Group noWrap={true} position='left' spacing={'16px'} style={{ marginBottom: '4px' }}>
				<MRT_GlobalFilterTextInput table={table} />
				<NativeSelect
					rightSection={<Icon icon='carbon:chevron-down' />}
					data={['Data Entry Teams']}
					styles={{
						root: { width: '208px', height: '48px' },
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

type UserDataRecord = NonNullable<ApiOutput['user']['forUserTable']>[number] & {
	canAccessDataPortal: boolean
	permissionId?: string
	permissionName?: string
}
