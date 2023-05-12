import {
	Anchor,
	Box,
	type ButtonProps,
	Checkbox,
	createPolymorphicComponent,
	createStyles,
	Drawer,
	Group,
	Radio,
	rem,
	Stack,
	Table,
	Text,
} from '@mantine/core'
import { createFormContext } from '@mantine/form'
import { useDisclosure } from '@mantine/hooks'
import {
	type CellContext,
	createColumnHelper,
	flexRender,
	getCoreRowModel,
	useReactTable,
} from '@tanstack/react-table'
import { ReactTableDevtools } from '@tanstack/react-table-devtools'
import { type CSSProperties, forwardRef } from 'react'

import { Breadcrumb } from '~ui/components/core/Breadcrumb'
import { Button } from '~ui/components/core/Button'
import { useCustomVariant } from '~ui/hooks/useCustomVariant'
import { useOrgId } from '~ui/hooks/useOrgId'
import { parsePhoneNumber } from '~ui/hooks/usePhoneNumber'
import { Icon } from '~ui/icon'
import { trpc as api } from '~ui/lib/trpcClient'
import { PhoneEmailModal } from '~ui/modals/dataPortal/PhoneEmail'

import { MultiSelectPopover } from './MultiSelectPopover'

const [FormProvider, useFormContext, useForm] = createFormContext<{ data: PhoneTableColumns[] }>()

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

export const _PhoneTableDrawer = forwardRef<HTMLButtonElement, PhoneTableDrawerProps>((props, ref) => {
	const [opened, handler] = useDisclosure(false)
	const form = useForm({ initialValues: { data: [] } })
	const organizationId = useOrgId()
	const variants = useCustomVariant()
	const { classes } = useStyles()
	// #region tRPC
	const { data } = api.orgPhone.get.useQuery(
		{ organizationId },
		{
			enabled: Boolean(organizationId),
			onSuccess: (data) => {
				if (!form.values.data || form.values.data.length === 0) {
					form.setValues({
						data: data.map(
							({ country, locations, description, organization, services, phoneType, ...record }) => ({
								...record,
								country,
								locations: locations.map(({ id }) => id),
								services: services.map(({ id }) => id),
								phoneType: phoneType?.id,
							})
						),
					})
				}
			},
		}
	)
	const { data: orgServices } = api.service.getNames.useQuery(
		{ organizationId },
		{
			enabled: Boolean(organizationId),
			select: (data) => data.map(({ id, defaultText }) => ({ value: id, label: defaultText })),
		}
	)
	const { data: orgLocations } = api.location.getNames.useQuery(
		{ organizationId: organizationId ?? '' },
		{
			enabled: Boolean(organizationId),
			select: (data) => data.map(({ id, name }) => ({ value: id, label: name ?? '' })),
		}
	)
	// #endregion

	// #region React Table Setup
	const columnHelper = createColumnHelper<PhoneTableColumns>()
	const columns = [
		columnHelper.accessor('id', {
			enableHiding: true,
		}),
		columnHelper.accessor('number', {
			header: 'Phone Number',
			cell: (info) => {
				const country = info.row.getValue<string>('country')
				const formattedPhone = parsePhoneNumber(info.getValue(), country)
				return (
					<Text className={conditionalStyles(info, classes)}>{formattedPhone?.formatInternational()}</Text>
				)
			},
		}),
		columnHelper.accessor('phoneType', {
			cell: (info) => info.renderValue(),
		}),
		columnHelper.accessor('primary', {
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
		}),
		columnHelper.accessor('published', {
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
		}),
		columnHelper.accessor('services', {
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
			cell: (info) => (
				<MultiSelectPopover
					key={info.cell.id}
					data={orgLocations ?? []}
					label='Locations'
					labelClassName={conditionalStyles(info, classes)}
					{...form.getInputProps(`data.${info.row.index}.locations`)}
				/>
			),
		}),
		columnHelper.accessor('country', {
			enableHiding: true,
		}),
		columnHelper.accessor('deleted', {
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
		}),
	]
	const table = useReactTable({
		data: form.values.data,
		columns,
		getCoreRowModel: getCoreRowModel(),
		state: {
			columnVisibility: {
				country: false,
				id: false,
			},
		},
	})
	// #endregion

	console.log(form.values.data)

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
									<Button variant='primary-icon' leftIcon={<Icon icon='carbon:save' />}>
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

				<Group w='100vw'>
					<ReactTableDevtools table={table} panelProps={{ className: classes.devtools }} />
				</Group>
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
	id: string
	number: string
	ext: string | null
	country: string
	phoneType?: string | null
	primary: boolean
	published: boolean
	deleted: boolean
	locations: string[]
	services: string[]
}
