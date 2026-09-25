// apps/app/src/pages/dashboards/kpi-board/index.tsx

/* eslint-disable i18next/no-literal-string -- internal-only, gated page, not yet translated */

import {
	Badge,
	Card,
	Drawer,
	Group,
	Select,
	SimpleGrid,
	Skeleton,
	Tabs,
	Text,
	TextInput,
	Title,
} from '@mantine/core'
import { useDebouncedValue, useDisclosure } from '@mantine/hooks'
import { type GetServerSideProps } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next/pages'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { checkServerPermissions } from '@weareinreach/auth'
import { Link } from '@weareinreach/ui/components/core/Link'
import { KpiOrgMap, type KpiOrgMapMarker } from '@weareinreach/ui/components/dashboard/kpi-board/KpiOrgMap'
import { type NextPageWithOptions } from '~app/pages/_app'
import { api } from '~app/utils/api'
import { getServerSideTranslations } from '~app/utils/i18n'

const STATUS_COLOR: Record<KpiOrgMapMarker['status'], string> = {
	good: 'green',
	needs_review: 'yellow',
	critical: 'red',
}
const STATUS_LABEL: Record<KpiOrgMapMarker['status'], string> = {
	good: 'Good',
	needs_review: 'Needs Review',
	critical: 'Critical',
}

const MapTab = () => {
	const [search, setSearch] = useState('')
	const [status, setStatus] = useState<string | null>(null)
	const [debouncedSearch] = useDebouncedValue(search, 300)
	const [selected, setSelected] = useState<KpiOrgMapMarker | null>(null)
	const [drawerOpened, { open: openDrawer, close: closeDrawer }] = useDisclosure(false)

	const { data, isLoading } = api.dashboard.kpiBoardMapMarkers.useQuery({
		search: debouncedSearch || undefined,
		status: (status ?? undefined) as KpiOrgMapMarker['status'] | undefined,
	})

	const handleMarkerClick = useCallback(
		(marker: KpiOrgMapMarker) => {
			setSelected(marker)
			openDrawer()
		},
		[openDrawer]
	)

	const markers = useMemo(() => data ?? [], [data])

	return (
		<>
			<Group mb='md'>
				<TextInput
					placeholder='Search by name'
					value={search}
					onChange={(event) => setSearch(event.currentTarget.value)}
					w={240}
				/>
				<Select
					placeholder='All statuses'
					clearable
					value={status}
					onChange={setStatus}
					data={[
						{ value: 'good', label: 'Good' },
						{ value: 'needs_review', label: 'Needs Review' },
						{ value: 'critical', label: 'Critical' },
					]}
					w={200}
				/>
				<Text c='dimmed' size='sm'>
					{isLoading ? 'Loading…' : `${markers.length.toLocaleString()} locations shown`}
				</Text>
			</Group>
			{isLoading ? (
				<Skeleton height={560} radius='lg' />
			) : (
				<KpiOrgMap height={560} width={1200} markers={markers} onMarkerClick={handleMarkerClick} />
			)}
			<Drawer opened={drawerOpened} onClose={closeDrawer} title={selected?.name} position='right'>
				{selected && (
					<Group>
						<Badge color={STATUS_COLOR[selected.status]}>{STATUS_LABEL[selected.status]}</Badge>
						<Link href={{ pathname: '/org/[slug]', query: { slug: selected.slug } }}>View organization</Link>
					</Group>
				)}
			</Drawer>
		</>
	)
}

/**
 * First implementation slice - Overview/Explore/Map are placeholders until their backend queries land (see
 * docs/Dashboards/KpiBoard/README.md for the full design). Impact's manual-metric list is wired up since that
 * backend already exists.
 */
const ImpactTab = () => {
	const { data, isLoading } = api.dashboard.kpiBoardManualMetricList.useQuery({})

	if (isLoading) {
		return <Skeleton height={110} radius='lg' />
	}
	if (!data?.length) {
		return (
			<Text c='dimmed' mt='sm'>
				No donations or grants have been entered yet.
			</Text>
		)
	}
	return (
		<SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing='lg' mt='lg'>
			{data.map((row) => (
				<Card key={row.id} withBorder padding='lg' radius='lg'>
					<Text size='xl' fw={700}>
						{(row.value / 100).toLocaleString(undefined, { style: 'currency', currency: 'USD' })}
					</Text>
					<Text size='sm' c='dimmed' mt={4}>
						{row.metricKey} ·{' '}
						{new Date(row.periodStart).toLocaleDateString(undefined, {
							year: 'numeric',
							month: 'short',
						})}
					</Text>
				</Card>
			))}
		</SimpleGrid>
	)
}

const PlaceholderTab = ({ label }: { label: string }) => (
	<Text c='dimmed' mt='sm'>
		{label} is not built yet - see docs/Dashboards/KpiBoard/README.md for the design.
	</Text>
)

const KpiBoard: NextPageWithOptions = () => {
	const { t } = useTranslation(['common'])
	const router = useRouter()
	const initialTab = typeof router.query.tab === 'string' ? router.query.tab : 'overview'
	const [activeTab, setActiveTab] = useState(initialTab)

	useEffect(() => {
		setActiveTab(typeof router.query.tab === 'string' ? router.query.tab : 'overview')
	}, [router.query.tab])

	const handleTabChange = useCallback(
		(tab: string | null) => {
			if (!tab) {
				return
			}
			setActiveTab(tab)
			router.push({ pathname: router.pathname, query: { ...router.query, tab } }, undefined, {
				shallow: true,
			})
		},
		[router]
	)

	return (
		<>
			<Head>
				<title>{t('page-title.base', { title: 'KPI Board' })}</title>
			</Head>
			<Title order={2}>KPI Board</Title>
			<Text c='dimmed' mt={4}>
				Reach, data quality, and impact metrics for the organization/service directory.
			</Text>
			<Tabs value={activeTab} onChange={handleTabChange} mt='xl'>
				<Tabs.List>
					<Tabs.Tab value='overview'>Overview</Tabs.Tab>
					<Tabs.Tab value='explore'>Explore</Tabs.Tab>
					<Tabs.Tab value='map'>Map</Tabs.Tab>
					<Tabs.Tab value='impact'>Impact</Tabs.Tab>
				</Tabs.List>
				<Tabs.Panel value='overview' pt='md'>
					<PlaceholderTab label='Overview' />
				</Tabs.Panel>
				<Tabs.Panel value='explore' pt='md'>
					<PlaceholderTab label='Explore' />
				</Tabs.Panel>
				<Tabs.Panel value='map' pt='md'>
					<MapTab />
				</Tabs.Panel>
				<Tabs.Panel value='impact' pt='md'>
					<ImpactTab />
				</Tabs.Panel>
			</Tabs>
		</>
	)
}

export default KpiBoard

export const getServerSideProps: GetServerSideProps = async ({ locale, req, res }) => {
	const session = await checkServerPermissions({
		ctx: { req, res },
		permissions: ['dataPortalManager', 'dataPortalAdmin', 'root'],
		has: 'some',
	})
	if (!session) {
		return {
			redirect: {
				destination: '/',
				permanent: false,
			},
		}
	}
	return {
		props: {
			session,
			...(await getServerSideTranslations(locale, ['common'])),
		},
	}
}
