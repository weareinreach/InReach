/* eslint-disable i18next/no-literal-string */
import {
	ActionIcon,
	Affix,
	Center,
	Checkbox,
	Group,
	Loader,
	Modal,
	Overlay,
	Pagination,
	rem,
	Space,
	Stack,
	Table,
	Tabs,
	Text,
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { useDisclosure } from '@mantine/hooks'
import {
	createColumnHelper,
	type ExpandedState,
	flexRender,
	getCoreRowModel,
	getExpandedRowModel,
	getFilteredRowModel,
	getGroupedRowModel,
	getPaginationRowModel,
	useReactTable,
} from '@tanstack/react-table'
import compact from 'just-compact'
import { type GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import { useSession } from 'next-auth/react'
import { type Route } from 'nextjs-routes'
import { useEffect, useMemo, useState } from 'react'

import { type ApiInput, type ApiOutput, trpcServerClient } from '@weareinreach/api/trpc'
import { checkServerPermissions } from '@weareinreach/auth'
import { Button } from '@weareinreach/ui/components/core/Button'
import { Link } from '@weareinreach/ui/components/core/Link'
import { MultiSelectPopover } from '@weareinreach/ui/components/data-portal/MultiSelectPopover'
import { useCustomVariant } from '@weareinreach/ui/hooks'
import { Icon } from '@weareinreach/ui/icon'
import { QuickPromotionModal } from '@weareinreach/ui/modals'
import { api } from '~app/utils/api'
import { getServerSideTranslations } from '~app/utils/i18n'

const RESULTS_PER_PAGE = 20

const columnHelper = createColumnHelper<FormData['data'][number]>()

const QuickLink = () => {
	const form = useForm<FormData>()
	const { data: session, status: sessionStatus } = useSession()
	const [page, setPage] = useState(0)
	const [pageAction, setPageAction] = useState<'prev' | 'next' | number | undefined>()
	const [expanded, setExpanded] = useState<ExpandedState>({})
	const [isSaved, setIsSaved] = useState(false)
	const [overlay, setOverlay] = useState(sessionStatus === 'unauthenticated')
	const [modalOpened, modalHandler] = useDisclosure(false)
	const router = useRouter()
	const apiUtils = api.useContext()
	const variants = useCustomVariant()
	const updatePhones = api.quicklink.updateServiceLocationData.useMutation({
		onSuccess: () => {
			setIsSaved(true)
			apiUtils.quicklink.getServiceLocationData.invalidate()
		},
	})

	const { data, isLoading } = api.quicklink.getServiceLocationData.useQuery(
		{
			limit: RESULTS_PER_PAGE,
			skip: RESULTS_PER_PAGE * page,
		},
		{ staleTime: 1 * 5 * 1000, enabled: !overlay }
	)
	const { totalResults } = data ?? { totalResults: 0 }
	const totalPages = Math.ceil(totalResults / RESULTS_PER_PAGE)
	useEffect(() => {
		if (!isLoading && data) {
			const values = { data: data.results ?? [] }
			form.setValues(values)
			form.resetDirty(values)
			setIsSaved(false)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [data, isLoading, page])
	useEffect(() => {
		if (page + 1 <= totalPages) {
			apiUtils.quicklink.getPhoneData.prefetch({
				limit: RESULTS_PER_PAGE,
				skip: RESULTS_PER_PAGE * (page + 1),
			})
		}
		if (page - 1 >= 0) {
			apiUtils.quicklink.getPhoneData.prefetch({
				limit: RESULTS_PER_PAGE,
				skip: RESULTS_PER_PAGE * (page - 1),
			})
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [page, totalPages])

	useEffect(() => {
		if (!overlay) {
			apiUtils.quicklink.getPhoneData.prefetch(
				{ limit: RESULTS_PER_PAGE, skip: RESULTS_PER_PAGE * (page + 1) },
				{}
			)
		}
	})

	useEffect(() => {
		if (!session && sessionStatus === 'unauthenticated') {
			setOverlay(true)
		} else if (session && sessionStatus === 'authenticated') {
			setOverlay(false)
		}
	}, [session, sessionStatus])
	const handlePageChange = (page?: 'prev' | 'next' | number, loseChanges = false) => {
		if (!page) return
		setPageAction(page)
		if (form.isDirty() && !loseChanges) {
			modalHandler.open()
			return
		}
		switch (page) {
			case 'prev': {
				setPage((prev) => prev - 1)
				break
			}
			case 'next': {
				setPage((prev) => prev + 1)
				break
			}
			default: {
				setPage(page - 1)
			}
		}
	}

	const handleMutation = () => {
		const updated: ApiInput['quicklink']['updateServiceLocationData'][number][] = compact(
			form.values.data.map((record, i) => {
				if (form.isDirty(`data.${i}`)) {
					const { attachedServices, orgId, locationId, published } = record
					const originalRecord = data?.results.find(
						(original) => orgId === original.orgId && locationId === original.locationId
					)
					if (!originalRecord) return

					return {
						id: locationId,
						to: {
							published,
							services: {
								add: attachedServices.filter((svc) => !originalRecord.attachedServices.includes(svc)),
								del: originalRecord.attachedServices.filter((svc) => !attachedServices.includes(svc)),
							},
						},
						from: {
							services: originalRecord.attachedServices,
							published: originalRecord.published,
						},
					}
				}
				return
			})
		)
		if (updated.length) {
			updatePhones.mutate(updated)
		}
	}

	const columns = useMemo(
		() => {
			if (data?.results.length) {
				return [
					columnHelper.accessor('slug', {}),
					columnHelper.accessor('name', {
						header: 'Organization',
						cell: (info) => {
							const slug = info.row.original.slug
							return (
								<Group noWrap spacing={8}>
									<Text variant={variants.Text.utility4}>{info.renderValue()}</Text>
									{slug !== undefined && (
										<Link
											href={{
												pathname: '/org/[slug]',
												query: { slug },
											}}
											target='_blank'
											variant={variants.Link.inheritStyle}
										>
											<Icon icon='carbon:launch' />
										</Link>
									)}
								</Group>
							)
						},
						getGroupingValue: (row) => row.orgId,
						size: 40,
						minSize: 10,
						maxSize: 80,
					}),
					columnHelper.accessor('locationName', {
						header: 'Location',
						cell: (info) => {
							return (
								<Group noWrap spacing={8}>
									<Text variant={variants.Text.utility4}>{info.renderValue()}</Text>
								</Group>
							)
						},
					}),
					columnHelper.accessor('attachedServices', {
						header: () => <div style={{ textAlign: 'center' }}>Services</div>,
						cell: (info) =>
							info.row.getIsGrouped() ? null : (
								<Center>
									<MultiSelectPopover
										key={info.cell.id}
										data={
											form.values.data[info.row.index]?.services.map(({ id, serviceName }) => ({
												value: id,
												label: serviceName?.tsKey.text ?? `MISSING DESCRIPTION - ${id}`,
											})) ?? []
										}
										label='Services'
										{...form.getInputProps(`data.${info.row.index}.attachedServices`, { withFocus: false })}
									/>
								</Center>
							),
						size: 150,
					}),
					columnHelper.display({
						id: 'allServices',
						header: () => <div style={{ textAlign: 'center' }}>Attach All Services</div>,
						cell: (info) => {
							const isChecked = form.values.data[info.row.index]?.services.every(({ id }) =>
								form.values.data[info.row.index]?.attachedServices.includes(id)
							)

							const handleUpdate = (select: boolean) => {
								if (select) {
									form.setFieldValue(
										`data.${info.row.index}.attachedServices`,
										form.values.data[info.row.index]?.services.map(({ id }) => id)
									)
								} else {
									form.setFieldValue(`data.${info.row.index}.attachedServices`, [])
								}
							}

							return <Checkbox checked={isChecked} onChange={(e) => handleUpdate(e.target.checked)} />
						},
					}),
					columnHelper.accessor('published', {
						header: () => <div style={{ textAlign: 'center' }}>Published?</div>,
						cell: (info) => {
							return info.row.getIsGrouped() ? null : (
								<Center>
									<Checkbox
										key={info.cell.id}
										checked={
											form.getInputProps(`data.${info.row.index}.published`, { type: 'checkbox' }).checked
										}
										onChange={(e) => form.setFieldValue(`data.${info.row.index}.published`, e.target.checked)}
									/>
								</Center>
							)
						},
						size: 48,
					}),
				]
			}
			return []
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[form.values.data]
	)
	const table = useReactTable({
		data: form.values.data,
		columns,
		state: {
			expanded,
		},
		initialState: {
			expanded,
			grouping: ['name'],
			columnVisibility: { slug: false },
		},
		enableHiding: true,
		enableGrouping: true,
		enableExpanding: true,
		autoResetExpanded: false,
		onExpandedChange: setExpanded,
		getExpandedRowModel: getExpandedRowModel(),
		getGroupedRowModel: getGroupedRowModel(),
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		manualPagination: true,
	})
	return (
		<>
			<Tabs value={router.pathname} onTabChange={(value) => router.push(value as unknown as Route)}>
				<Tabs.List>
					<Tabs.Tab value='/admin/quicklink/phone'>Phone Numbers</Tabs.Tab>
					<Tabs.Tab value='/admin/quicklink/email'>Email Addresses</Tabs.Tab>
					<Tabs.Tab value='/admin/quicklink/services'>Location Services</Tabs.Tab>
				</Tabs.List>
			</Tabs>
			{isLoading ? (
				<Center h='75vh'>
					<Loader />
				</Center>
			) : overlay ? (
				<>
					<Space h={400} />
					<Overlay blur={2}>
						<QuickPromotionModal autoLaunch noClose />
					</Overlay>
				</>
			) : !isLoading && !form.values.data?.length ? (
				<Center h='75vh'>
					<Text variant={variants.Text.utility1}>No pending links.</Text>
				</Center>
			) : (
				<>
					<Table>
						<thead style={{ position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 20 }}>
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
									{row.getVisibleCells().map((cell) => {
										return cell.getIsGrouped() ? (
											<td key={cell.id} colSpan={8}>
												<Group noWrap>
													<ActionIcon onClick={row.getToggleExpandedHandler()}>
														{row.getIsExpanded() ? (
															<Icon icon='carbon:chevron-down' />
														) : (
															<Icon icon='carbon:chevron-right' />
														)}
													</ActionIcon>{' '}
													{flexRender(cell.column.columnDef.cell, cell.getContext())}
												</Group>
											</td>
										) : cell.getIsPlaceholder() ? (
											<td key={cell.id}></td>
										) : cell.row.getIsGrouped() ? null : (
											<td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
										)
									})}
								</tr>
							))}
						</tbody>
					</Table>
					<Group noWrap position='apart' mt={40}>
						<Pagination
							onChange={handlePageChange}
							onNextPage={() => handlePageChange('next')} // table.nextPage()}
							onPreviousPage={() => handlePageChange('prev')} //table.previousPage()}
							total={totalPages}
							value={page + 1}
						/>
						<Affix position={{ bottom: rem(64), right: rem(24) }}>
							<Button
								variant='primary-icon'
								leftIcon={<Icon icon={isSaved ? 'carbon:checkmark' : 'carbon:save'} />}
								onClick={handleMutation}
								loading={updatePhones.isLoading}
								disabled={!form.isDirty()}
							>
								Save
							</Button>
						</Affix>
					</Group>
					<Modal opened={modalOpened} onClose={modalHandler.close}>
						<Stack align='center'>
							There are unsaved changes! If you navigate away from this page, they will be lost!
							<Group>
								<Button
									variant='primary-icon'
									leftIcon={<Icon icon={isSaved ? 'carbon:checkmark' : 'carbon:save'} />}
									onClick={handleMutation}
									loading={updatePhones.isLoading}
								>
									Save
								</Button>
								<Button
									variant='primary-icon'
									// leftIcon={<Icon icon='carbon:save' />}
									onClick={() => {
										handlePageChange(pageAction, true)
										modalHandler.close()
									}}
								>
									Discard Changes
								</Button>
							</Group>
						</Stack>
					</Modal>
				</>
			)}
		</>
	)
}

QuickLink.omitGrid = true

interface FormData {
	data: ApiOutput['quicklink']['getServiceLocationData']['results']
}

export const getServerSideProps: GetServerSideProps = async ({ locale, req, res }) => {
	const session = await checkServerPermissions({
		ctx: { req, res },
		permissions: 'root',
		has: 'all',
		returnNullSession: true,
	})
	if (session === false) {
		return {
			redirect: {
				destination: '/',
				permanent: false,
			},
		}
	}
	const ssg = await trpcServerClient({ session })
	if (session) {
		await ssg.quicklink.getPhoneData.prefetch({ limit: 20, skip: 0 })
	}

	return {
		props: {
			session,
			trpcState: ssg.dehydrate(),
			...(await getServerSideTranslations(locale, ['common'])),
		},
	}
}

export default QuickLink
