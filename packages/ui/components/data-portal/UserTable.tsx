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
import { useClipboard, useDebouncedValue, useDisclosure } from '@mantine/hooks'
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

import { DataTable, type DataTableCellContext, type DataTableColumn } from './DataTable'
import { ResultCount } from './ResultCount'

type UserDataRecord = NonNullable<ApiOutput['user']['forUserTable']>['results'][number]

/** Columns the server-side query can sort by. */
type UserSortableColumnId = 'name' | 'email' | 'emailVerified' | 'createdAt' | 'updatedAt' | 'active'

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

/**
 * The four staff account-recovery actions below are organized as two pairs - a preferred, email-dependent
 * path and an escalation that bypasses email entirely - for each of the two problems a user can get stuck on:
 * an unverified account, or a password they can't get back. Each modal's body states which pair it belongs to
 * and when to reach for it, so a data manager can pick the right one without needing to understand Cognito,
 * SES, or why an email might silently fail to arrive.
 */

export const PasswordResetAction = ({ email }: { email: string }) => {
	const theme = useMantineTheme()
	const [opened, handler] = useDisclosure(false)
	const { t } = useTranslation('common')
	const resetPw = api.user.adminResetPassword.useMutation({
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
			<Modal opened={opened} onClose={handler.close} title='Send Password Reset Link'>
				<Text size='sm' c='dimmed' mb='sm'>
					Preferred way to help a user reset their password. Only works if they can actually receive email -
					if they've already tried this and say nothing arrived, use &quot;Set Temporary Password&quot;
					instead.
				</Text>
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
			<Tooltip label='Send Password Reset Link'>
				<ActionIcon variant='subtle' onClick={handler.open}>
					<Icon icon='carbon:password' color={theme.other.colors.primary.allyGreen} />
				</ActionIcon>
			</Tooltip>
		</>
	)
}

export const SetTemporaryPasswordAction = ({ email }: { email: string }) => {
	const theme = useMantineTheme()
	const [opened, handler] = useDisclosure(false)
	const clipboard = useClipboard({ timeout: 1000 })
	const setTempPassword = api.user.adminSetTemporaryPassword.useMutation()

	const handleClose = useCallback(() => {
		handler.close()
		setTempPassword.reset()
	}, [handler, setTempPassword])

	const createSetHandler = useCallback(
		(email: string) => () => {
			setTempPassword.mutate({ email })
		},
		[setTempPassword]
	)

	return (
		<>
			<Modal opened={opened} onClose={handleClose} title='Set Temporary Password'>
				{setTempPassword.data ? (
					<>
						<Text mb='xs'>
							Share this password with the user directly - phone, verified chat, in person. Never by email.
							They&apos;ll be required to choose their own password the next time they log in.
						</Text>
						<Group wrap='nowrap' mb='md'>
							<Text ff='monospace' size='lg' fw={700}>
								{setTempPassword.data.temporaryPassword}
							</Text>
							<Button
								variant='secondaryLg'
								onClick={() => clipboard.copy(setTempPassword.data.temporaryPassword)}
							>
								{clipboard.copied ? 'Copied' : 'Copy'}
							</Button>
						</Group>
						<Button onClick={handleClose}>Done</Button>
					</>
				) : (
					<>
						<Text size='sm' c='dimmed' mb='sm'>
							Use this only if the user says a password reset email never arrived. Generates a one-time
							password with no email involved - you&apos;ll need to share it with them yourself.
						</Text>
						<Text mb='md'>Are you sure you want to set a temporary password for this user?</Text>
						<Group wrap='nowrap'>
							<Button onClick={createSetHandler(email)} loading={setTempPassword.isPending}>
								Yes
							</Button>
							<Button variant='secondaryLg' onClick={handleClose}>
								No
							</Button>
						</Group>
					</>
				)}
			</Modal>
			<Tooltip label='Set Temporary Password'>
				<ActionIcon variant='subtle' onClick={handler.open}>
					<Icon icon='carbon:key' color={theme.other.colors.primary.allyGreen} />
				</ActionIcon>
			</Tooltip>
		</>
	)
}

export const ResendVerificationAction = ({ email }: { email: string }) => {
	const theme = useMantineTheme()
	const [opened, handler] = useDisclosure(false)
	const resendCode = api.user.adminResendCode.useMutation({
		onSettled: handler.close,
	})

	const createResendHandler = useCallback(
		(email: string) => () => {
			resendCode.mutate({ email })
		},
		[resendCode]
	)

	return (
		<>
			<Modal opened={opened} onClose={handler.close} title='Resend Verification Link'>
				<Text size='sm' c='dimmed' mb='sm'>
					Preferred way to get a new verification link to the user. Only works if they can actually receive
					email - if they've already tried this and say nothing arrived, use &quot;Force Verification&quot;
					instead.
				</Text>
				<Text mb='md'>Are you sure you want to resend this user&apos;s verification link?</Text>
				<Group wrap='nowrap'>
					<Button onClick={createResendHandler(email)} loading={resendCode.isPending}>
						Yes
					</Button>
					<Button variant='secondaryLg' onClick={handler.close}>
						No
					</Button>
				</Group>
			</Modal>
			<Tooltip label='Resend Verification Link'>
				<ActionIcon variant='subtle' onClick={handler.open}>
					<Icon icon='carbon:send-alt' color={theme.other.colors.primary.allyGreen} />
				</ActionIcon>
			</Tooltip>
		</>
	)
}

export const ForceVerificationAction = ({ email }: { email: string }) => {
	const theme = useMantineTheme()
	const [opened, handler] = useDisclosure(false)
	const confirmUser = api.user.adminConfirmUser.useMutation({
		onSettled: handler.close,
	})

	const createConfirmHandler = useCallback(
		(email: string) => () => {
			confirmUser.mutate({ email })
		},
		[confirmUser]
	)

	return (
		<>
			<Modal opened={opened} onClose={handler.close} title='Force Verification'>
				<Text size='sm' c='dimmed' mb='sm'>
					Use this only if the user says a verification email never arrived. Confirms the account directly,
					skipping email entirely - no code or link needed.
				</Text>
				<Text mb='md'>Are you sure you want to confirm this user&apos;s account?</Text>
				<Group wrap='nowrap'>
					<Button onClick={createConfirmHandler(email)} loading={confirmUser.isPending}>
						Yes
					</Button>
					<Button variant='secondaryLg' onClick={handler.close}>
						No
					</Button>
				</Group>
			</Modal>
			<Tooltip label='Force Verification'>
				<ActionIcon variant='subtle' onClick={handler.open}>
					<Icon icon='carbon:checkmark-outline' color={theme.other.colors.primary.allyGreen} />
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

// --- Column Cell Renderers ---
// Defined at module scope (rather than nested inside `UserTable`) so React doesn't see a brand-new
// component identity on every render; anything a renderer needs beyond `row`/`value` is passed in as a
// prop instead of being read from closure.

interface UserActionsCellProps extends DataTableCellContext<UserDataRecord> {
	loggedInUserPermissions: CurrentUserPermissions | undefined
}

/** Cell renderer for the 'actions' column - password reset and data portal access management. */
const UserActionsCell = ({ row, loggedInUserPermissions }: UserActionsCellProps) => (
	<Group wrap='nowrap' gap={8}>
		<PasswordResetAction email={row.email} />
		<SetTemporaryPasswordAction email={row.email} />
		<ResendVerificationAction email={row.email} />
		<ForceVerificationAction email={row.email} />
		<ManageAccessAction
			activePermissionName={row.permissionName}
			userId={row.id}
			loggedInUserPermissions={loggedInUserPermissions}
		/>
	</Group>
)

/**
 * Curried factory for the 'actions' column cell - `loggedInUserPermissions` isn't part of
 * `DataTableCellContext`, so it's threaded through here rather than via an inline arrow in the columns
 * array.
 */
const createUserActionsCell = (extra: { loggedInUserPermissions: CurrentUserPermissions | undefined }) => {
	const Cell = (ctx: DataTableCellContext<UserDataRecord>) => <UserActionsCell {...ctx} {...extra} />
	Cell.displayName = 'UserActionsCell'
	return Cell
}

/** Cell renderer for the 'id' column. */
const IdCell = ({ value }: DataTableCellContext<UserDataRecord>) => <Text size='xs'>{value as string}</Text>

/** Cell renderer for the 'emailVerified' column. */
const EmailVerifiedCell = ({ value }: DataTableCellContext<UserDataRecord>) => {
	if (!value) {
		return null
	}
	const date = DateTime.fromJSDate(value as Date)
	return <span>{date.toLocaleString(DateTime.DATETIME_SHORT)}</span>
}

/** Cell renderer shared by the 'updatedAt' and 'createdAt' columns. */
const DateCell = ({ value }: DataTableCellContext<UserDataRecord>) => {
	const date = DateTime.fromJSDate(value as Date)
	return <span>{date.toLocaleString(DateTime.DATETIME_SHORT)}</span>
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
	const emailFilter = columnFilters.find((f) => f.id === 'email')?.value as
		{ id: string; label: string }[] | undefined
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
			emailVerified: dateFilter('emailVerified')
				? { from: dateFilter('emailVerified')?.[0], to: dateFilter('emailVerified')?.[1] }
				: undefined,
			userIds: emailFilter?.map((person) => person.id),
			sorting: sorting.map(({ id, desc }) => ({
				id: id as UserSortableColumnId,
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
				size: 190,
				enableSorting: false,
				enableGlobalFilter: false,
				hideable: false,
				accessorFn: () => undefined,
				cell: createUserActionsCell({ loggedInUserPermissions }),
			},
			{
				id: 'id',
				header: 'ID',
				size: 220,
				hiddenByDefault: true,
				enableSorting: false,
				cell: IdCell,
			},
			{ id: 'name', header: 'Name' },
			{
				id: 'email',
				header: 'Email',
				filter: { type: 'user-search' },
			},
			{
				id: 'emailVerified',
				header: 'Verified',
				filter: { type: 'date-range' },
				cell: EmailVerifiedCell,
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
				cell: DateCell,
			},
			{
				id: 'createdAt',
				header: 'Created',
				filter: { type: 'date-range' },
				cell: DateCell,
			},
		],
		[loggedInUserPermissions]
	)

	return (
		<Stack>
			<ResultCount count={data?.total ?? 0} />
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
