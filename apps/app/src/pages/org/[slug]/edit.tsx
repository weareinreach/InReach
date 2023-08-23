import { DevTool } from '@hookform/devtools'
import { Grid, Stack } from '@mantine/core'
import { useElementSize } from '@mantine/hooks'
import compact from 'just-compact'
import { type GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { type RoutedQuery } from 'nextjs-routes'
import { useEffect, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { z } from 'zod'

import { trpcServerClient } from '@weareinreach/api/trpc'
import { checkServerPermissions } from '@weareinreach/auth'
import { GoogleMap } from '@weareinreach/ui/components/core/GoogleMap'
import { ContactSection } from '@weareinreach/ui/components/sections/Contact'
import { ListingBasicInfo } from '@weareinreach/ui/components/sections/ListingBasicInfo'
import { LocationCard } from '@weareinreach/ui/components/sections/LocationCard'
import { OrgPageLoading } from '@weareinreach/ui/loading-states/OrgPage'
import { type NextPageWithOptions } from '~app/pages/_app'
import { api } from '~app/utils/api'
import { getServerSideTranslations } from '~app/utils/i18n'

const formSchema = z
	.object({
		name: z.string(),
		description: z.string(),
	})
	.partial()
type FormSchema = z.infer<typeof formSchema>

const OrganizationPage: NextPageWithOptions = () => {
	const router = useRouter<'/org/[slug]'>()
	const { query } = router.isReady ? router : { query: { slug: '' } }
	const { data, status } = api.organization.forOrgPageEdits.useQuery(query, { enabled: router.isReady })
	const { t } = useTranslation()
	const formMethods = useForm<FormSchema>({
		values: {
			name: data?.name,
			description: data?.description?.tsKey?.text,
		},
	})
	const [loading, setLoading] = useState(true)
	const { data: hasRemote } = api.service.forServiceInfoCard.useQuery(
		{ parentId: data?.id ?? '', remoteOnly: true },
		{
			enabled: !!data?.id && data?.locations.length > 1,
			select: (data) => data.length !== 0,
		}
	)
	const { ref, width } = useElementSize()
	useEffect(() => {
		if (data && status === 'success') setLoading(false)
	}, [data, status])
	if (loading || !data) return <OrgPageLoading />

	const { attributes, description, slug, locations, isClaimed } = data

	return (
		<FormProvider {...formMethods}>
			<Grid.Col sm={8} order={1}>
				<Stack pt={24} align='flex-start' spacing={40}>
					<ListingBasicInfo
						data={{
							name: data.name,
							id: data.id,
							slug,
							lastVerified: data.lastVerified,
							attributes,
							description,
							locations,
							isClaimed,
						}}
						edit
					/>
					<Stack spacing={40}>
						{locations.map((location) => (
							<LocationCard key={location.id} locationId={location.id} />
						))}
						{hasRemote && <LocationCard remoteOnly />}
					</Stack>
				</Stack>
			</Grid.Col>
			<Grid.Col order={2}>
				<Stack spacing={40}>
					<ContactSection role='org' parentId={data.id} />
					<Stack ref={ref} miw='100%'>
						{width && (
							<GoogleMap
								locationIds={locations.map(({ id }) => id)}
								width={width}
								height={Math.floor(width * 1.185)}
							/>
						)}
					</Stack>
				</Stack>
				<DevTool control={formMethods.control} />
			</Grid.Col>
		</FormProvider>
	)
}

export const getServerSideProps: GetServerSideProps<
	Record<string, unknown>,
	RoutedQuery<'/org/[slug]'>
> = async ({ locale, params, req, res }) => {
	if (!params) return { notFound: true }
	const { slug } = params

	const session = await checkServerPermissions({
		ctx: { req, res },
		permissions: ['dataPortalBasic'],
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

	const ssg = await trpcServerClient({ session })
	const orgId = await ssg.organization.getIdFromSlug.fetch({ slug })

	const [i18n] = await Promise.allSettled([
		getServerSideTranslations(locale, compact(['common', 'services', 'attribute', 'phone-type', orgId?.id])),
		ssg.organization.getBySlug.prefetch({ slug }),
		ssg.organization.forOrgPageEdits.prefetch({ slug }),
	])
	const props = {
		session,
		trpcState: ssg.dehydrate(),
		...(i18n.status === 'fulfilled' ? i18n.value : {}),
	}

	return {
		props,
	}
}
export default OrganizationPage
