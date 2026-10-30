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
import { type ReactNode, useCallback, useMemo, useState } from 'react'

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
 * an unverified account, or a password they can't get back. Each tooltip states which pair it belongs to and
 * when to reach for it, so a data manager can pick the right one without needing to understand Cognito, SES,
 * or why an email might silently fail to arrive.
 */

/**
 * Shared shell for the four actions above: a tooltip-labeled icon that opens a confirm modal. `children` is a
 * render prop (not a plain node) so callers can close the modal themselves after a mutation settles, or - as
 * `SetTemporaryPasswordAction` does - swap the modal's body entirely once the mutation has a result.
 */
const ActionItem = ({
	tooltipLabel,
	modalTitle,
	icon,
	children,
}: {
	tooltipLabel: string
	modalTitle: string
	icon: string
	children: (helpers: { close: () => void }) => ReactNode
}) => {
	const theme = useMantineTheme()
	const [opened, handler] = useDisclosure(false)

	return (
		<>
			<Modal opened={opened} onClose={handler.close} title={modalTitle}>
				{children({ close: handler.close })}
			</Modal>
			<Tooltip multiline maw={240} label={tooltipLabel}>
				<ActionIcon variant='subtle' onClick={handler.open}>
					<Icon icon={icon} color={theme.other.colors.primary.allyGreen} />
				</ActionIcon>
			</Tooltip>
		</>
	)
}

/**
 * The common body shape for all four actions: a "when to use" explanation, then the confirm question on its
 * own line, then Yes/No. `SetTemporaryPasswordAction` only uses this for its pre-confirm state - its
 * post-success state (revealing the generated password) is a different body entirely.
 */
const ConfirmBody = ({
	explanation,
	confirmText,
	isPending,
	onConfirm,
	onCancel,
}: {
	explanation: string
	confirmText: string
	isPending: boolean
	onConfirm: () => void
	onCancel: () => void
}) => (
	// This app defaults Text to `component: 'span'` (inline) app-wide (see theme/common.tsx's Text
	// defaultProps), so two bare sibling <Text> elements flow together with no line break between them.
	// Stack forces each child onto its own line regardless of Text's own inline rendering.
	<Stack gap='sm'>
		<Text size='sm' c='dimmed'>
			{explanation}
		</Text>
		<Text>{confirmText}</Text>
		<Group wrap='nowrap'>
			<Button onClick={onConfirm} loading={isPending}>
				Yes
			</Button>
			<Button variant='secondaryLg' onClick={onCancel}>
				No
			</Button>
		</Group>
	</Stack>
)

export const PasswordResetAction = ({ email }: { email: string }) => {
	const { t } = useTranslation('common')
	const resetPw = api.user.adminResetPassword.useMutation()
	const cognitoSubject = t('password-reset.email-subject')
	const cognitoMessage = t('password-reset.email-body')

	return (
		<ActionItem
			tooltipLabel='Send Password Reset Link - preferred. Only works if the user can receive email.'
			modalTitle='Send Password Reset Link'
			icon='carbon:password'
		>
			{({ close }) => (
				<ConfirmBody
					explanation={
						'This is the preferred way to help a user reset their password, however it only works if they can actually receive ' +
						'email - if they (or staff) already tried this and the user says nothing arrived, use the "Set Temporary Password" action instead.'
					}
					confirmText="Are you sure you want to reset this user's password?"
					isPending={resetPw.isPending}
					onConfirm={() => resetPw.mutate({ email, cognitoSubject, cognitoMessage }, { onSettled: close })}
					onCancel={close}
				/>
			)}
		</ActionItem>
	)
}

export const SetTemporaryPasswordAction = ({ email }: { email: string }) => {
	const clipboard = useClipboard({ timeout: 1000 })
	const setTempPassword = api.user.adminSetTemporaryPassword.useMutation()

	return (
		<ActionItem
			tooltipLabel='Set Temporary Password - escalation. Use only if the user says a reset email never arrived.'
			modalTitle='Set Temporary Password'
			icon='carbon:key'
		>
			{({ close }) => {
				const handleClose = () => {
					close()
					setTempPassword.reset()
				}
				if (setTempPassword.data) {
					return (
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
					)
				}
				return (
					<ConfirmBody
						explanation="Use this only if the user says a password reset email never arrived. Generates a one-time password with no email involved - you'll need to share it with them yourself."
						confirmText='Are you sure you want to set a temporary password for this user?'
						isPending={setTempPassword.isPending}
						onConfirm={() => setTempPassword.mutate({ email })}
						onCancel={handleClose}
					/>
				)
			}}
		</ActionItem>
	)
}

export const ResendVerificationAction = ({ email, isVerified }: { email: string; isVerified: boolean }) => {
	const resendCode = api.user.adminResendCode.useMutation()
	// Not disabled - see ForceVerificationAction's comment on why this stays clickable regardless.
	const tooltipLabel = isVerified
		? 'Resend Verification Link - this user is already verified.'
		: 'Resend Verification Link - preferred. Only works if the user can receive email.'

	return (
		<ActionItem tooltipLabel={tooltipLabel} modalTitle='Resend Verification Link' icon='carbon:send-alt'>
			{({ close }) => (
				<ConfirmBody
					explanation={
						'This is the preferred way to send a new emailverification link to the user, however it only works if they can actually ' +
						'receive email - if they (or staff) have already tried this and the user says nothing arrived, use the "Force Verification" action instead.'
					}
					confirmText="Are you sure you want to resend this user's verification link?"
					isPending={resendCode.isPending}
					onConfirm={() => resendCode.mutate({ email }, { onSettled: close })}
					onCancel={close}
				/>
			)}
		</ActionItem>
	)
}

export const ForceVerificationAction = ({ email, isVerified }: { email: string; isVerified: boolean }) => {
	const confirmUser = api.user.adminConfirmUser.useMutation()
	// Intentionally not disabled when already verified: `isVerified` reflects the app's own DB
	// (emailVerified), which can drift from Cognito's actual confirmation state - the exact kind of
	// mismatch this action exists to fix. Disabling based on a value that can itself be wrong would
	// block the one tool meant to correct it, so this only hints via the tooltip.
	const tooltipLabel = isVerified
		? 'Force Verification - this user is already verified.'
		: 'Force Verification - escalation. Use only if the user says a verification email never arrived.'

	return (
		<ActionItem tooltipLabel={tooltipLabel} modalTitle='Force Verification' icon='carbon:checkmark-outline'>
			{({ close }) => (
				<ConfirmBody
					explanation='Use this only if the user says a verification email never arrived. Confirms the account directly, skipping email entirely - no code or link needed.'
					confirmText="Are you sure you want to confirm this user's account?"
					isPending={confirmUser.isPending}
					onConfirm={() => confirmUser.mutate({ email }, { onSettled: close })}
					onCancel={close}
				/>
			)}
		</ActionItem>
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
		<ResendVerificationAction email={row.email} isVerified={!!row.emailVerified} />
		<ForceVerificationAction email={row.email} isVerified={!!row.emailVerified} />
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
