import {
	ActionIcon,
	type ActionIconProps,
	Anchor,
	Box,
	type ButtonProps,
	Checkbox,
	createPolymorphicComponent,
	createStyles,
	Drawer,
	Group,
	Modal,
	Radio,
	rem,
	Select,
	Stack,
	Table,
	TextInput,
	type TextInputProps,
	Tooltip,
} from '@mantine/core'
import { createFormContext, zodResolver } from '@mantine/form'
import { useDisclosure } from '@mantine/hooks'
import {
	type CellContext,
	type ColumnDef,
	createColumnHelper,
	flexRender,
	getCoreRowModel,
	useReactTable,
} from '@tanstack/react-table'
import { useTranslation } from 'next-i18next'
import { forwardRef } from 'react'
import { z } from 'zod'

import { transformNullString } from '@weareinreach/api/schemas/common'
import { Breadcrumb } from '~ui/components/core/Breadcrumb'
import { Button } from '~ui/components/core/Button'
import { useCustomVariant } from '~ui/hooks/useCustomVariant'
import { useOrgInfo } from '~ui/hooks/useOrgInfo'
import { Icon } from '~ui/icon'
import { trpc as api } from '~ui/lib/trpcClient'
import { PhoneEmailModal } from '~ui/modals/dataPortal/PhoneEmail'

import { MultiSelectPopover } from './MultiSelectPopover'

const [FormProvider, useFormContext, useForm] = createFormContext<{ data: EmailTableColumns[] }>()

const FormSchema = z.object({
	orgSlug: z.string().optional(),
	data: z
		.object({
			id: z.string().optional(),
			email: z.string(),
			firstName: z.string().nullable().transform(transformNullString),
			lastName: z.string().nullable().transform(transformNullString),
			title: z.string().nullable().transform(transformNullString),
			description: z.string().optional(),
			primary: z.boolean(),
			published: z.boolean(),
			deleted: z.boolean(),
			locations: z.string().array(),
			services: z.string().array(),
		})
		.array(),
})

const useStyles = createStyles((theme) => ({
	addButton: {
		display: 'flex',
		flexWrap: 'nowrap',
		padding: `${rem(12)} ${rem(8)}`,
		gap: rem(8),
		alignItems: 'center',
	},
	deletedItem: {
		textDecoration: 'line-through',
		color: theme.other.colors.secondary.darkGray,
	},
	unpublishedItem: {
		color: theme.other.colors.secondary.darkGray,
	},
	devtools: {
		'& button': { backgroundColor: 'black !important' },
	},
}))

const conditionalStyles = (
	cellContext: CellContext<EmailTableColumns, unknown>,
	classes: ReturnType<typeof useStyles>['classes']
) => {
	const deleted = cellContext.row.getValue('deleted')
	const published = cellContext.row.getValue('published')
	return deleted ? classes.deletedItem : published ? undefined : classes.unpublishedItem
}

interface DescriptionEditProps {
	actionIconProps: ActionIconProps
	textInputProps: TextInputProps
}
const DescriptionEdit = ({ actionIconProps, textInputProps }: DescriptionEditProps) => {
	const [opened, handler] = useDisclosure(false)
	return (
		<>
			<Modal opened={opened} onClose={handler.close}>
				<TextInput {...textInputProps} />
				<Button onClick={handler.close}>Close</Button>
			</Modal>
			<ActionIcon {...actionIconProps} onClick={handler.open}>
				<Icon icon='carbon:edit' />
			</ActionIcon>
		</>
	)
}

export const _EmailTableDrawer = forwardRef<HTMLButtonElement, EmailTableDrawerProps>((props, ref) => {
	const [opened, handler] = useDisclosure(false)
	const form = useForm({
		initialValues: { data: [] },
		validate: zodResolver(FormSchema),
		transformValues: FormSchema.parse,
	})
	const { id: organizationId, slug: orgSlug } = useOrgInfo()
	const { classes } = useStyles()
	const { t } = useTranslation('phone-type')
	// #region tRPC
	const apiUtils = api.useContext()
	const variants = useCustomVariant()
	const { data } = api.orgEmail.get.useQuery(
		{ organizationId },
		{
			enabled: Boolean(organizationId),
			onSuccess: (data) => {
				if (!form.values.data || form.values.data.length === 0) {
					form.setValues({
						data: data.map(({ locations, organization, services, title, ...record }) => ({
							...record,
							locations: locations.map(({ id }) => id),
							services: services.map(({ id }) => id),
							title: title ?? 'NULL',
						})),
					})
				}
			},
		}
	)
	const { data: userTitles } = api.fieldOpt.userTitle.useQuery(undefined, {
		enabled: Boolean(organizationId),
		select: (data) => [
			...data.map(({ id, title }) => ({ value: id, label: title })),
			{ value: 'NULL', label: 'Custom...' },
		],
		refetchOnWindowFocus: false,
	})
	const { data: orgServices } = api.service.getNames.useQuery(
		{ organizationId },
		{
			enabled: Boolean(organizationId),
			select: (data) => data.map(({ id, defaultText }) => ({ value: id, label: defaultText })),
			refetchOnWindowFocus: false,
		}
	)
	const { data: orgLocations } = api.location.getNames.useQuery(
		{ organizationId: organizationId ?? '' },
		{
			enabled: Boolean(organizationId),
			select: (data) => data.map(({ id, name }) => ({ value: id, label: name ?? '' })),
			refetchOnWindowFocus: false,
		}
	)
	const updateEmails = api.orgEmail.upsertMany.useMutation({
		onSuccess: () => apiUtils.orgEmail.get.invalidate({ organizationId }),
	})

	const handleUpdate = () => {
		updateEmails.mutate({ orgSlug, data: form.getTransformedValues().data })
	}
	// #endregion

	// #region React Table Setup
	const columnHelper = createColumnHelper<EmailTableColumns>()
	const columns = [
		columnHelper.accessor('email', {
			header: 'Email',
			cell: (info) => (
				<TextInput
					{...{
						value: form.getInputProps(`data.${info.row.index}.email`, { withFocus: false }).value,
						onBlur: (e) =>
							form
								.getInputProps(`data.${info.row.index}.email`, { withFocus: false })
								.onChange(e.target.value),
						variant: variants.Input.small,
						type: 'email',
					}}
				/>
			),
			size: 200,
		}),
		columnHelper.accessor('firstName', {
			header: 'First Name',
			cell: (info) => {
				return (
					<TextInput
						{...{
							value: form.getInputProps(`data.${info.row.index}.firstName`, { withFocus: false }).value,
							onBlur: (e) =>
								form
									.getInputProps(`data.${info.row.index}.firstName`, { withFocus: false })
									.onChange(e.target.value),
							variant: variants.Input.small,
						}}
					/>
				)
			},
		}),
		columnHelper.accessor('lastName', {
			header: 'Last Name',
			cell: (info) => {
				return (
					<TextInput
						{...{
							value: form.getInputProps(`data.${info.row.index}.lastName`, { withFocus: false }).value,
							onBlur: (e) =>
								form
									.getInputProps(`data.${info.row.index}.lastName`, { withFocus: false })
									.onChange(e.target.value),
							variant: variants.Input.small,
						}}
					/>
				)
			},
		}),
		columnHelper.accessor('title', {
			header: 'Title',
			cell: (info) => {
				return (
					<Tooltip
						label={form.getInputProps(`data.${info.row.index}.description`, { withFocus: false }).value}
						disabled={info.cell.getValue() !== 'NULL'}
					>
						<Group noWrap key={info.cell.id} spacing={4}>
							<Select
								data={userTitles ?? []}
								{...form.getInputProps(`data.${info.row.index}.title`, { withFocus: false })}
								variant={variants.Input.small}
							/>
							<DescriptionEdit
								textInputProps={{
									...form.getInputProps(`data.${info.row.index}.description`, { withFocus: false }),
									label: 'Email description',
								}}
								actionIconProps={{ disabled: info.cell.getValue() !== 'NULL' }}
							/>
						</Group>
					</Tooltip>
				)
			},
			size: 175,
		}),

		columnHelper.accessor('primary', {
			header: 'Primary',
			cell: (info) => {
				return (
					<Radio
						name='isPrimary'
						key={info.cell.id}
						disabled={!info.row.getValue('published') || info.row.getValue('deleted')}
						checked={form.getInputProps(`data.${info.row.index}.primary`, { type: 'checkbox' }).checked}
						onChange={(e) => {
							const newValues = form.values.data.map(({ primary, ...rest }, i) =>
								info.row.index === i ? { primary: true, ...rest } : { primary: false, ...rest }
							)
							form.setValues({ data: newValues })
						}}
					/>
				)
			},
			size: 48,
		}),
		columnHelper.accessor('published', {
			header: 'Published',
			cell: (info) => (
				<Checkbox
					key={info.cell.id}
					disabled={info.row.getValue('deleted')}
					checked={form.getInputProps(`data.${info.row.index}.published`, { type: 'checkbox' }).checked}
					onChange={(e) => {
						form.setFieldValue(`data.${info.row.index}.published`, e.target.checked)
					}}
				/>
			),
			size: 48,
		}),
		columnHelper.accessor('services', {
			header: 'Services',
			cell: (info) => (
				<MultiSelectPopover
					key={info.cell.id}
					data={orgServices ?? []}
					label='Services'
					labelClassName={conditionalStyles(info, classes)}
					{...form.getInputProps(`data.${info.row.index}.services`)}
				/>
			),
		}),
		columnHelper.accessor('locations', {
			header: 'Locations',
			cell: (info) => (
				<MultiSelectPopover
					key={info.cell.id}
					data={orgLocations ?? []}
					label='Locations'
					labelClassName={conditionalStyles(info, classes)}
					{...form.getInputProps(`data.${info.row.index}.locations`)}
				/>
			),
			size: 150,
		}),
		columnHelper.accessor('deleted', {
			header: 'Delete',
			cell: (info) => {
				const props = {
					height: 24,
					onClick: () => {
						const currentVals = form.values.data[info.row.index]
						if (!currentVals) throw new Error('Unable to get current values')
						const { deleted, published, ...rest } = currentVals
						const newVals = {
							deleted: !info.getValue(),
							published: info.getValue() ? published : false,
							...rest,
						}
						console.log(newVals)
						form.setFieldValue(`data.${info.row.index}`, newVals)
					},
				}
				return info.getValue() ? (
					<Icon icon='carbon:result-old' {...props} />
				) : (
					<Icon icon='carbon:trash-can' {...props} />
				)
			},
			size: 48,
		}),
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
	] satisfies ColumnDef<EmailTableColumns, any>[]
	const table = useReactTable({
		data: form.values.data,
		columns,
		getCoreRowModel: getCoreRowModel(),
	})
	// #endregion

	return (
		<>
			<FormProvider form={form}>
				<Drawer.Root onClose={handler.close} opened={opened} position='bottom'>
					<Drawer.Overlay />
					<Drawer.Content>
						<Drawer.Header>
							<Group noWrap position='apart' w='100%'>
								<Breadcrumb option='close' onClick={handler.close} />
								<Group>
									<PhoneEmailModal className={classes.addButton} component={Anchor} role='email'>
										<Icon icon='carbon:add' height={24} block />
										Add new Email
									</PhoneEmailModal>
									<Button
										variant='primary-icon'
										leftIcon={<Icon icon='carbon:save' />}
										onClick={handleUpdate}
										loading={updateEmails.isLoading}
									>
										Save
									</Button>
								</Group>
							</Group>
						</Drawer.Header>
						<Drawer.Body>
							<Table>
								<thead style={{ position: 'sticky' }}>
									{table.getHeaderGroups().map((headerGroup) => (
										<tr key={headerGroup.id}>
											{headerGroup.headers.map((header) => (
												<th key={header.id} style={{ width: header.getSize() }}>
													{flexRender(header.column.columnDef.header, header.getContext())}
												</th>
											))}
										</tr>
									))}
								</thead>

								<tbody>
									{table.getRowModel().rows.map((row) => (
										<tr key={row.id}>
											{row.getVisibleCells().map((cell) => (
												<td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
											))}
										</tr>
									))}
								</tbody>
							</Table>
						</Drawer.Body>
					</Drawer.Content>
				</Drawer.Root>
			</FormProvider>

			<Stack>
				<Box component='button' onClick={handler.open} ref={ref} {...props} />
			</Stack>
		</>
	)
})
_EmailTableDrawer.displayName = 'EmailTableDrawer'

export const EmailTableDrawer = createPolymorphicComponent<'button', EmailTableDrawerProps>(_EmailTableDrawer)

export interface EmailTableDrawerProps extends ButtonProps {
	x: string
}

interface EmailTableColumns {
	id?: string
	email: string
	firstName?: string | null
	lastName?: string | null
	title?: string | null
	description?: string
	primary: boolean
	published: boolean
	deleted: boolean
	locations: string[]
	services: string[]
}
