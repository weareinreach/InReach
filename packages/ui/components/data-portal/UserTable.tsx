import {
	ActionIcon,
	Group,
	Modal,
	Popover,
	Select,
	Stack,
	Text,
	Tooltip,
	useMantineTheme,
} from '@mantine/core'
import { useDebouncedValue, useDisclosure } from '@mantine/hooks'
import { keepPreviousData } from '@tanstack/react-query'
import { type ColumnFiltersState, type PaginationState, type SortingState } from '@tanstack/react-table'
import { DateTime } from 'luxon'
import { useSession } from 'next-auth/react'
import { useTranslation } from 'next-i18next/pages'
import { useCallback, useMemo, useState } from 'react'

import { type ApiOutput } from '@weareinreach/api'
import { Button } from '~ui/components/core/Button'
import { Icon } from '~ui/icon'
import { trpc as api } from '~ui/lib/trpcClient'

import { DataTable, type DataTableColumn } from './DataTable'

const DATA_PORTAL_ACCESS_OPTIONS = [
	{ value: 'none', label: 'None' },
	{ value: 'dataPortalBasic', label: 'Basic Access' },
	{ value: 'dataPortalManager', label: 'Manager Access' },
	{ value: 'dataPortalAdmin', label: 'Admin Access' },
	{ value: 'root', label: 'Superuser (Root)' },
]

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
		onSuccess: () => {
			apiUtils.user.forUserTable.invalidate()
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
		/>
	)
}

const PasswordResetAction = ({ email }: { email: string }) => {
	const theme = useMantineTheme()
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
				<Text mb='md'>Are you sure you want to reset this user&apos;s password?</Text>
				<Group wrap='nowrap'>
					<Button onClick={createResetHandler(email)} loading={resetPw.isPending}>
						Yes
					</Button>
					<Button variant='secondaryLg' onClick={handler.close}>
						No
					</Button>
				</Group>
			</Modal>
			<Tooltip label='Reset Password'>
				<ActionIcon variant='subtle' onClick={handler.open}>
					<Icon icon='carbon:password' color={theme.other.colors.primary.allyGreen} />
				</ActionIcon>
			</Tooltip>
		</>
	)
}

const ManageAccessAction = ({
	activePermissionName,
	userId,
	loggedInUserPermissions,
}: {
	activePermissionName: string | undefined
	userId: string
	loggedInUserPermissions: CurrentUserPermissions | undefined
}) => {
	const theme = useMantineTheme()

	return (
		<Popover position='bottom-end' withArrow shadow='md'>
			<Popover.Target>
				<Tooltip label='Manage Data Portal Access'>
					<ActionIcon variant='subtle'>
						<Icon icon='carbon:user-role' color={theme.other.colors.primary.allyGreen} />
					</ActionIcon>
				</Tooltip>
			</Popover.Target>
			<Popover.Dropdown>
				<DataPortalAccessSelect
					activePermissionName={activePermissionName}
					userId={userId}
					loggedInUserPermissions={loggedInUserPermissions}
				/>
			</Popover.Dropdown>
		</Popover>
	)
}

export const UserTable = () => {
	const { data: session } = useSession()
	const loggedInUserPermissions = session?.user?.permissions as CurrentUserPermissions | undefined

	const [globalFilter, setGlobalFilter] = useState('')
	const [debouncedGlobalFilter] = useDebouncedValue(globalFilter, 300)
	const [sorting, setSorting] = useState<SortingState>([{ id: 'name', desc: false }])
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
	const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 50 })

	const permissionNamesFilter = columnFilters.find((f) => f.id === 'permissionName')?.value as
		string[] | undefined
	const dateFilter = (id: string) =>
		columnFilters.find((f) => f.id === id)?.value as [Date | undefined, Date | undefined] | undefined

	const { data, isLoading, isFetching, isError } = api.user.forUserTable.useQuery(
		{
			search: debouncedGlobalFilter || undefined,
			createdAt: dateFilter('createdAt')
				? { from: dateFilter('createdAt')?.[0], to: dateFilter('createdAt')?.[1] }
				: undefined,
			updatedAt: dateFilter('updatedAt')
				? { from: dateFilter('updatedAt')?.[0], to: dateFilter('updatedAt')?.[1] }
				: undefined,
			sorting: sorting.map(({ id, desc }) => ({
				id: id as 'name' | 'email' | 'emailVerified' | 'createdAt' | 'updatedAt' | 'active',
				desc,
			})),
			permissionNames: permissionNamesFilter?.length ? permissionNamesFilter : undefined,
			take: pagination.pageSize,
			skip: pagination.pageIndex * pagination.pageSize,
		},
		{ placeholderData: keepPreviousData, refetchOnWindowFocus: false }
	)

	const columns = useMemo<DataTableColumn<UserDataRecord>[]>(
		() => [
			{
				id: 'actions',
				header: 'Actions',
				pin: 'left',
				size: 90,
				enableSorting: false,
				enableGlobalFilter: false,
				hideable: false,
				accessorFn: () => undefined,
				cell: ({ row }) => (
					<Group wrap='nowrap' gap={8}>
						<PasswordResetAction email={row.email} />
						<ManageAccessAction
							activePermissionName={row.permissionName}
							userId={row.id}
							loggedInUserPermissions={loggedInUserPermissions}
						/>
					</Group>
				),
			},
			{
				id: 'id',
				header: 'ID',
				size: 220,
				hiddenByDefault: true,
				enableSorting: false,
				cell: ({ value }) => <Text size='xs'>{value as string}</Text>,
			},
			{ id: 'name', header: 'Name' },
			{ id: 'email', header: 'Email' },
			{
				id: 'emailVerified',
				header: 'Verified',
				cell: ({ value }) => {
					if (!value) {
						return null
					}
					const date = DateTime.fromJSDate(value as Date)
					return <span>{date.toLocaleString(DateTime.DATETIME_SHORT)}</span>
				},
			},
			{
				id: 'active',
				header: 'Active',
				cell: ({ value }) => (value ? 'Yes' : 'No'),
			},
			{
				id: 'permissionName',
				header: 'Data Portal Access Level',
				size: 200,
				enableSorting: false,
				filter: { type: 'multi-select', options: DATA_PORTAL_ACCESS_OPTIONS },
				cell: ({ row }) =>
					DATA_PORTAL_ACCESS_OPTIONS.find((opt) => opt.value === (row.permissionName ?? 'none'))?.label ??
					'None',
			},
			{
				id: 'updatedAt',
				header: 'Updated',
				filter: { type: 'date-range' },
				cell: ({ value }) => {
					const date = DateTime.fromJSDate(value as Date)
					return <span>{date.toLocaleString(DateTime.DATETIME_SHORT)}</span>
				},
			},
			{
				id: 'createdAt',
				header: 'Created',
				filter: { type: 'date-range' },
				cell: ({ value }) => {
					const date = DateTime.fromJSDate(value as Date)
					return <span>{date.toLocaleString(DateTime.DATETIME_SHORT)}</span>
				},
			},
		],
		[loggedInUserPermissions]
	)

	return (
		<Stack>
			<Text size='16px' fw={500} style={{ marginBottom: '-1rem' }}>
				Total: {data?.total ?? 0}
			</Text>
			<DataTable
				data={data?.results ?? []}
				columns={columns}
				sorting={sorting}
				onSortingChange={setSorting}
				columnFilters={columnFilters}
				onColumnFiltersChange={setColumnFilters}
				globalFilter={globalFilter}
				onGlobalFilterChange={setGlobalFilter}
				globalFilterPlaceholder='Search Users'
				pagination={pagination}
				onPaginationChange={setPagination}
				mode={{ serverSide: true, rowCount: data?.total ?? 0 }}
				isLoading={isLoading}
				isFetching={isFetching}
				isError={isError}
			/>
		</Stack>
	)
}

type UserDataRecord = NonNullable<ApiOutput['user']['forUserTable']>['results'][number]
