import { DevTool } from '@hookform/devtools'
import { Grid, Stack } from '@mantine/core'
import { useElementSize } from '@mantine/hooks'
import { t } from 'i18next'
import compact from 'just-compact'
import { type GetServerSidePropsContext, type InferGetServerSidePropsType } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { type RoutedQuery } from 'nextjs-routes'
import { useEffect, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { z } from 'zod'

import { trpcServerClient } from '@weareinreach/api/trpc'
import { checkServerPermissions } from '@weareinreach/auth'
import { GoogleMap } from '@weareinreach/ui/components/core/GoogleMap'
import { ContactSection } from '@weareinreach/ui/components/sections/ContactSection'
import { ListingBasicInfo } from '@weareinreach/ui/components/sections/ListingBasicInfo'
import { LocationCard } from '@weareinreach/ui/components/sections/LocationCard'
import { useEditMode } from '@weareinreach/ui/hooks/useEditMode'
import { OrgPageLoading } from '@weareinreach/ui/loading-states/OrgPage'
import { type NextPageWithOptions } from '~app/pages/_app'
import { api } from '~app/utils/api'
import { getServerSideTranslations } from '~app/utils/i18n'

const formSchema = z.object({
	id: z.string(),
	name: z.string().optional(),
	description: z.string().optional(),
})
type FormSchema = z.infer<typeof formSchema>

const OrganizationPage: NextPageWithOptions<InferGetServerSidePropsType<typeof getServerSideProps>> = () => {
	const router = useRouter<'/org/[slug]'>()
	const apiUtils = api.useUtils()
	const {
		query: { slug: pageSlug },
	} = router.isReady ? router : { query: { slug: '' } }
	const { data, status } = api.organization.forOrgPageEdits.useQuery(
		{ slug: pageSlug },
		{ enabled: router.isReady }
	)
	const updateBasic = api.organization.updateBasic.useMutation({
		onSuccess: (newData) => {
			if (data && newData && data.slug !== newData.slug) {
				router.replace({ pathname: router.pathname, query: { ...router.query, slug: newData.slug } })
			}
			apiUtils.organization.forOrgPageEdits.invalidate()
		},
	})

	const formMethods = useForm<FormSchema>({
		values: {
			id: data?.id ?? '',
			name: data?.name,
			description: data?.description?.tsKey?.text,
		},
	})

	const { unsaved, saveEvent } = useEditMode()
	saveEvent.subscribe(() => {
		const values = formMethods.getValues()
		updateBasic.mutate(values)
	})
	useEffect(() => {
		const { isDirty } = formMethods.formState
		if (unsaved.state !== isDirty) {
			unsaved.set(isDirty)
		}
	}, [formMethods.formState, unsaved])

	const [loading, setLoading] = useState(true)
	const { data: hasRemote } = api.service.forServiceInfoCard.useQuery(
		{ parentId: data?.id ?? '', remoteOnly: true },
		{
			enabled: !!data?.id && data?.locations?.length > 1,
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
		<>
			<Head>
				<title>{t('page-title.edit-mode', { ns: 'common', title: data.name })}</title>
			</Head>
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
						<Stack spacing={40} w='100%'>
							{locations.map((location) => (
								<LocationCard key={location.id} locationId={location.id} edit />
							))}
							{hasRemote && <LocationCard remoteOnly />}
						</Stack>
					</Stack>
				</Grid.Col>
				<Grid.Col order={2}>
					<Stack spacing={40}>
						<ContactSection role='org' parentId={data.id} edit />
						<Stack ref={ref} miw='100%'>
							{!!width && (
								<GoogleMap
									locationIds={locations.map(({ id }) => id)}
									width={width}
									height={Math.floor(width * 1.185)}
								/>
							)}
						</Stack>
					</Stack>
					<DevTool control={formMethods.control} placement='bottom-right' id='page' />
				</Grid.Col>
			</FormProvider>
		</>
	)
}

export const getServerSideProps = async ({
	locale,
	params,
	req,
	res,
}: GetServerSidePropsContext<RoutedQuery<'/org/[slug]'>>) => {
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

	const [i18n] = await Promise.all([
		getServerSideTranslations(locale, compact(['common', 'services', 'attribute', 'phone-type', orgId?.id])),
		ssg.organization.forOrgPageEdits.prefetch({ slug }),
		ssg.fieldOpt.countries.prefetch({ activeForOrgs: true }),
	])
	const props = {
		session,
		trpcState: ssg.dehydrate(),
		...i18n,
	}

	return {
		props,
	}
}
export default OrganizationPage
