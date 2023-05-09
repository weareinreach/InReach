import { Box, type ButtonProps, createPolymorphicComponent, Drawer, Table, Text } from '@mantine/core'
import { createFormContext } from '@mantine/form'
import { useDisclosure } from '@mantine/hooks'
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { ReactTableDevtools } from '@tanstack/react-table-devtools'
import { forwardRef } from 'react'

import { useOrgId } from '~ui/hooks/useOrgId'
import { trpc as api } from '~ui/lib/trpcClient'

import { MultiSelectPopover } from './MultiSelectPopover'

const [FormProvider, useFormContext, useForm] = createFormContext<{ data: PhoneTableColumns[] }>()

export const _PhoneTableDrawer = forwardRef<HTMLButtonElement, PhoneTableDrawerProps>((props, ref) => {
	const [opened, handler] = useDisclosure(false)
	const form = useForm({ initialValues: { data: [] } })
	const organizationId = useOrgId()
	console.log(form.values.data)
	const { data } = api.orgPhone.get.useQuery(
		{ organizationId },
		{
			enabled: Boolean(organizationId),
			onSuccess: (data) => {
				console.log('onSuccess', form.values, data)
				if (!form.values.data || form.values.data.length === 0) {
					console.log('set values')
					form.setValues({
						data: data.map(
							({ country, locations, description, organization, services, phoneType, ...record }) => ({
								...record,
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
		{ enabled: Boolean(organizationId), initialData: [] }
	)

	const columnHelper = createColumnHelper<PhoneTableColumns>()
	const columns = [
		columnHelper.accessor('number', {
			header: 'Phone Number',
			cell: (info) => info.getValue(),
		}),
		columnHelper.accessor('phoneType', {
			cell: (info) => info.renderValue(),
		}),
		columnHelper.accessor('services', {
			cell: (info) => (
				<MultiSelectPopover
					key={info.cell.id}
					data={orgServices ?? []}
					label='Services'
					// checkboxGroupProps={{ ...form.getInputProps(`data.${info.row.index}.services`) }}
					useFormContextHook={useFormContext}
					formField={`data.${info.row.index}.services`}
				/>
			),
		}),
		columnHelper.accessor('locations', {
			cell: (info) => info.getValue(),
		}),
	]
	const table = useReactTable({
		data: form.values.data,
		columns,
		getCoreRowModel: getCoreRowModel(),
	})

	return (
		<>
			<Drawer onClose={handler.close} opened={opened} position='bottom'>
				<FormProvider form={form}>
					<Table>
						<thead>
							{table.getHeaderGroups().map((headerGroup) => (
								<tr key={headerGroup.id}>
									{headerGroup.headers.map((header) => (
										<th key={header.id}>{flexRender(header.column.columnDef.header, header.getContext())}</th>
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
				</FormProvider>
			</Drawer>

			<Box component='button' onClick={handler.open} ref={ref} {...props} />
			<ReactTableDevtools table={table} />
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
	phoneType?: string | null
	primary: boolean
	published: boolean
	deleted: boolean
	locations: string[]
	services: string[]
}
