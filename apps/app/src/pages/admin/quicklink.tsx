/* eslint-disable i18next/no-literal-string */
import { Group, Table, Title } from '@mantine/core'
import { useForm } from '@mantine/form'
import {
	type CellContext,
	type ColumnDef,
	createColumnHelper,
	flexRender,
	getCoreRowModel,
	useReactTable,
} from '@tanstack/react-table'
import { type GetServerSideProps } from 'next'
import { useSession } from 'next-auth/react'
import { useEffect } from 'react'

import { type ApiOutput, trpcServerClient } from '@weareinreach/api/trpc'
import { checkServerPermissions } from '@weareinreach/auth'
import { api } from '~app/utils/api'
import { getServerSideTranslations } from '~app/utils/i18n'

const columnHelper = createColumnHelper<TableColumns>()

const QuickLink = () => {
	const { data: session } = useSession()
	const form = useForm<FormData>()
	const { data, isLoading } = api.quicklink.getPhoneData.useQuery()

	useEffect(() => {
		if (!isLoading && data) {
			console.log('useEffect', data)
			form.setValues({ data })
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [data, isLoading])

	const columns = [
		columnHelper.accessor('name', {
			cell: (info) => info.renderValue(),
		}),
		columnHelper.accessor('id', {
			cell: (info) => info.renderValue(),
		}),
	]
	const table = useReactTable({
		data: form.values.data,
		columns,
		getCoreRowModel: getCoreRowModel(),
	})

	if (isLoading || !data) return <>Loading...</>

	console.log(form.values)
	console.log(table.getRowModel())
	return (
		<>
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
		</>
	)
}

QuickLink.omitGrid = true

interface FormData {
	data: ApiOutput['quicklink']['getPhoneData']
}
interface TableColumns {
	name: string
	id: string
}
export const getServerSideProps: GetServerSideProps = async ({ locale, req, res }) => {
	const session = await checkServerPermissions({ ctx: { req, res }, permissions: 'root', has: 'all' })
	const ssg = await trpcServerClient()
	console.log('session', session)
	// if (!session) {
	// 	return {
	// 		redirect: {
	// 			destination: '/',
	// 			permanent: false,
	// 		},
	// 	}
	// }

	await ssg.quicklink.getPhoneData.prefetch()

	return {
		props: {
			session,
			trpcState: ssg.dehydrate(),
			...(await getServerSideTranslations(locale, ['common'])),
		},
	}
}

export default QuickLink
