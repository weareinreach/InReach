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

// --- COMBINED DATA PORTAL ACCESS OPTIONS ---
// This array now contains both the display label and the associated database ID (if applicable).
// The 'value' property will be the permission name string.
// The 'id' property will be the database ID (or undefined for 'none').
const DATA_PORTAL_ACCESS_OPTIONS = [
	{ value: 'none', label: 'None', id: undefined }, // 'none' doesn't have a DB ID
	{ value: 'dataPortalBasic', label: 'Basic Access', id: 'perm_01H0QX1XC037A47900JPAX6JBP' }, // Replace with actual basic ID
	{ value: 'dataPortalManager', label: 'Manager Access', id: 'perm_01H0QX1XC04Z9G8H44G464YHQQ' }, // Replace with actual manager ID
	{ value: 'dataPortalAdmin', label: 'Admin Access', id: 'perm_01H0QX1XC0335R04JMGMQ3KXVN' }, // Replace with actual admin ID
	{ value: 'root', label: 'Superuser (Root)', id: 'perm_01GW2HKXRTRWKY87HNTTFZCBH1' }, // Replace with actual root ID
]
// --- END COMBINED DATA PORTAL ACCESS OPTIONS ---

// Helper to format permission names for display (now uses DATA_PORTAL_ACCESS_OPTIONS)
const formatPermissionName = (name: string) => {
	const option = DATA_PORTAL_ACCESS_OPTIONS.find((opt) => opt.value === name)
	return option ? option.label : name
}

// Frontend Permission Checking Helper
type CurrentUserPermissions = string[]

const userHasPermission = (
	userPermissions: CurrentUserPermissions | undefined,
	permissionName: string
): boolean => {
	if (!userPermissions) return false
	return userPermissions.includes(permissionName)
}

// --- DataPortalAccessSelect Component ---
const DataPortalAccessSelect = ({
	activePermissionId, // Now receives the specific permission ID or undefined
	userId,
	loggedInUserPermissions,
}: {
	activePermissionId: string | undefined // Now expects the specific permission ID or undefined
	userId: string
	loggedInUserPermissions: CurrentUserPermissions | undefined
}) => {
	const apiUtils = api.useUtils()

	const updateAccess = api.user.toggleDataPortalAccess.useMutation({
		onSuccess: (data) => {
			// Optimistic update: Update the cache for the forUserTable query directly
			apiUtils.user.forUserTable.setData(undefined, (oldData) => {
				if (!oldData) return oldData
				return oldData.map((user) => {
					if (user.id === userId) {
						// Use the permissionId returned directly from the mutation's response
						return {
							...user,
							canAccessDataPortal: data.canAccessDataPortal,
							permissionId: data.permissionId, // Crucial: Use data.permissionId from the response
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
				// Explicitly type 'action' as 'deny'
				const payload: { userId: string; action: 'deny'; permissionId?: string } = { userId, action: 'deny' }
				updateAccess.mutate(payload)
			} else if (selectedOption && selectedOption.id) {
				// Explicitly type 'action' as 'allow'
				const payload: { userId: string; action: 'allow'; permissionId: string } = {
					userId,
					action: 'allow',
					permissionId: selectedOption.id,
				}
				updateAccess.mutate(payload)
			}
		},
		[updateAccess, userId]
	)

	const filteredAccessOptions = useMemo(() => {
		return DATA_PORTAL_ACCESS_OPTIONS.map((option) => ({ value: option.value, label: option.label }))
	}, [])

	if (filteredAccessOptions.length === 0) {
		return (
			<Text size='sm' color='dimmed'>
				{activePermissionId
					? formatPermissionName(
							DATA_PORTAL_ACCESS_OPTIONS.find((opt) => opt.id === activePermissionId)?.value || 'none'
						)
					: 'None'}
			</Text>
		)
	}

	// Determine the currently selected value for the dropdown based on activePermissionId
	// Find the 'value' (e.g., 'dataPortalBasic') that corresponds to the activePermissionId
	const currentDropdownValue = activePermissionId
		? DATA_PORTAL_ACCESS_OPTIONS.find((opt) => opt.id === activePermissionId)?.value || 'none'
		: 'none'

	return (
		<Select
			data={filteredAccessOptions}
			value={currentDropdownValue === 'none' ? null : currentDropdownValue} // Set value based on the found permission name
			onChange={handleLevelChange}
			placeholder='Select access'
			searchable
			size='xs'
			styles={{
				root: { width: '260px' },
				input: { paddingRight: '24px' },
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
				// Now using 'permissionId' from the backend query
				accessorKey: 'permissionId', // Access the specific permission ID
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
					// Pass the specific permissionId (string | undefined)
					const activePermissionId = cell.getValue<string | undefined>()

					return (
						<DataPortalAccessSelect
							activePermissionId={activePermissionId}
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

// --- UPDATED UserDataRecord TYPE DEFINITION ---
// This type now explicitly matches the structure that your forUserTable handler
// is *currently* returning, which includes 'canAccessDataPortal: boolean'
// and 'permissionId: string | undefined'.
type UserDataRecord = NonNullable<ApiOutput['user']['forUserTable']>[number] & {
	canAccessDataPortal: boolean
	permissionId?: string // Make it optional as it can be undefined/null
}
