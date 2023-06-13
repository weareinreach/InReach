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

import { Breadcrumb } from '~ui/components/core/Breadcrumb'
import { Button } from '~ui/components/core/Button'
import { useOrgInfo } from '~ui/hooks/useOrgInfo'
import { Icon } from '~ui/icon'
import { trpc as api } from '~ui/lib/trpcClient'
import { PhoneEmailModal } from '~ui/modals/dataPortal/PhoneEmail'

import { MultiSelectPopover } from './MultiSelectPopover'
import { PhoneNumberEntry } from './PhoneNumberEntry'

const [FormProvider, useFormContext, useForm] = createFormContext<{ data: PhoneTableColumns[] }>()

const transformNullString = (val: string | null) => {
	if (val === '' || val === 'NULL') return null
	return val
}

const FormSchema = z.object({
	orgSlug: z.string().optional(),
	data: z
		.object({
			id: z.string().optional(),
			number: z.string(),
			ext: z.string().nullable().transform(transformNullString),
			country: z.object({ id: z.string(), cca2: z.string() }),
			phoneType: z.string().nullable().transform(transformNullString),
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
	cellContext: CellContext<PhoneTableColumns, unknown>,
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

export const _PhoneTableDrawer = forwardRef<HTMLButtonElement, PhoneTableDrawerProps>((props, ref) => {
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
	const { data } = api.orgPhone.get.useQuery(
		{ organizationId },
		{
			enabled: Boolean(organizationId),
			onSuccess: (data) => {
				if (!form.values.data || form.values.data.length === 0) {
					form.setValues({
						data: data.map(({ country, locations, organization, services, phoneType, ...record }) => ({
							...record,
							country,
							locations: locations.map(({ id }) => id),
							services: services.map(({ id }) => id),
							phoneType: phoneType?.id ?? 'NULL',
						})),
					})
				}
			},
		}
	)
	const { data: phoneTypes } = api.fieldOpt.phoneTypes.useQuery(undefined, {
		enabled: Boolean(organizationId),
		// @ts-expect-error trpc/trpc#4519
		// !fix when issue resolved.
		select: (data) => [
			...data.map(({ id, tsKey, tsNs }) => ({ value: id, label: t(tsKey, { ns: tsNs }) satisfies string })),
			{ value: 'NULL', label: 'Custom...' },
		],
		refetchOnWindowFocus: false,
	})
	const { data: orgServices } = api.service.getNames.useQuery(
		{ organizationId },
		{
			enabled: Boolean(organizationId),
			// @ts-expect-error trpc/trpc#4519
			// !fix when issue resolved.
			select: (data) => data.map(({ id, defaultText }) => ({ value: id, label: defaultText })),
			refetchOnWindowFocus: false,
		}
	)
	const { data: orgLocations } = api.location.getNames.useQuery(
		{ organizationId: organizationId ?? '' },
		{
			enabled: Boolean(organizationId),
			// @ts-expect-error trpc/trpc#4519
			// !fix when issue resolved.
			select: (data) => data.map(({ id, name }) => ({ value: id, label: name ?? '' })),
			refetchOnWindowFocus: false,
		}
	)
	const updatePhones = api.orgPhone.upsertMany.useMutation({
		onSuccess: () => apiUtils.orgPhone.get.invalidate({ organizationId }),
	})

	const handleUpdate = () => {
		updatePhones.mutate({ orgSlug, data: form.getTransformedValues().data })
	}
	// #endregion

	// #region React Table Setup
	const columnHelper = createColumnHelper<PhoneTableColumns>()
	const columns = [
		columnHelper.accessor('number', {
			header: 'Phone Number',
			cell: (info) => {
				return (
					<PhoneNumberEntry
						countrySelectProps={form.getInputProps(`data.${info.row.index}.country.id`, { withFocus: false })}
						phoneEntryProps={{
							onBlur: (e) => form.getInputProps(`data.${info.row.index}.number`).onChange(e.target.value),
							setError: (err) => form.setFieldError(`data.${info.row.index}.number`, err),
							value: form.getInputProps(`data.${info.row.index}.number`).value,
						}}
						key={info.cell.id}
					/>
				)
			},
			size: 200,
		}),
		columnHelper.accessor('ext', {
			header: 'Extension',
			cell: (info) => {
				return (
					<TextInput
						{...{
							value: form.getInputProps(`data.${info.row.index}.ext`, { withFocus: false }).value,
							onBlur: (e) =>
								form
									.getInputProps(`data.${info.row.index}.ext`, { withFocus: false })
									.onChange(e.target.value),
						}}
						w={96}
					/>
				)
			},
			size: 48,
		}),
		columnHelper.accessor('phoneType', {
			header: 'Description/Type',
			cell: (info) => {
				return (
					<Tooltip
						label={form.getInputProps(`data.${info.row.index}.description`, { withFocus: false }).value}
						disabled={info.cell.getValue() !== 'NULL'}
					>
						<Group noWrap key={info.cell.id} spacing={4}>
							<Select
								// @ts-expect-error trpc/trpc#4519
								// !fix when issue resolved.
								data={phoneTypes ?? []}
								{...form.getInputProps(`data.${info.row.index}.phoneType`, { withFocus: false })}
							/>
							<DescriptionEdit
								textInputProps={{
									...form.getInputProps(`data.${info.row.index}.description`, { withFocus: false }),
									label: 'Phone number description',
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
					// @ts-expect-error trpc/trpc#4519
					// !fix when issue resolved.
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
					// @ts-expect-error trpc/trpc#4519
					// !fix when issue resolved.
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
	] satisfies ColumnDef<PhoneTableColumns, any>[]
	const table = useReactTable({
		data: form.values.data,
		columns,
		getCoreRowModel: getCoreRowModel(),
	})
	// #endregion

	console.log(form.values.data[0])
	console.log(form.getTransformedValues())

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
									<PhoneEmailModal className={classes.addButton} component={Anchor} role='phone'>
										<Icon icon='carbon:add' height={24} block />
										Add new Phone Number
									</PhoneEmailModal>
									<Button
										variant='primary-icon'
										leftIcon={<Icon icon='carbon:save' />}
										onClick={handleUpdate}
										loading={updatePhones.isLoading}
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
_PhoneTableDrawer.displayName = 'PhoneTableDrawer'

export const PhoneTableDrawer = createPolymorphicComponent<'button', PhoneTableDrawerProps>(_PhoneTableDrawer)

export interface PhoneTableDrawerProps extends ButtonProps {
	x: string
}

interface PhoneTableColumns {
	id?: string
	number: string
	ext: string | null
	country: { id: string; cca2: string }
	phoneType?: string | null
	description?: string
	primary: boolean
	published: boolean
	deleted: boolean
	locations: string[]
	services: string[]
}
