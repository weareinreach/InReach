import { createStyles, Grid, Stack, Tabs, Title } from '@mantine/core'
import { compareArrayVals } from 'crud-object-diff'
import { type InferGetServerSidePropsType, type NextPage } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { type GetServerSidePropsContext } from 'nextjs-routes'
import { useCallback, useEffect, useRef, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { z } from 'zod'

import { prefixedId } from '@weareinreach/api/schemas/idPrefix'
import { trpcServerClient } from '@weareinreach/api/trpc'
import { checkServerPermissions } from '@weareinreach/auth'
import { AlertMessage } from '@weareinreach/ui/components/core/AlertMessage'
import { Toolbar } from '@weareinreach/ui/components/core/Toolbar'
import { MultiSelectPopover } from '@weareinreach/ui/components/data-portal/MultiSelectPopover/hook-form'
import { ContactSection } from '@weareinreach/ui/components/sections/ContactSection'
import { ListingBasicInfo } from '@weareinreach/ui/components/sections/ListingBasicInfo'
import { PhotosSection } from '@weareinreach/ui/components/sections/Photos'
import { ReviewSection } from '@weareinreach/ui/components/sections/Reviews'
import { ServicesInfoCard } from '@weareinreach/ui/components/sections/ServicesInfo'
import { VisitCard } from '@weareinreach/ui/components/sections/VisitCard'
import { useEditMode } from '@weareinreach/ui/hooks/useEditMode'
import { useNewNotification } from '@weareinreach/ui/hooks/useNewNotification'
import { OrgLocationPageLoading } from '@weareinreach/ui/loading-states/OrgLocationPage'
import { api } from '~app/utils/api'
import { getServerSideTranslations } from '~app/utils/i18n'

const useStyles = createStyles((theme) => ({
	tabsList: {
		position: 'sticky',
		top: 0,
		zIndex: 10,
		backgroundColor: theme.other.colors.secondary.white,
	},
}))
const formSchema = z.object({
	id: z.string(),
	name: z.string().nullable().optional(),
	services: z.string().array().optional(),
})
type FormSchema = z.infer<typeof formSchema>
const OrgLocationPage: NextPage<InferGetServerSidePropsType<typeof getServerSideProps>> = ({
	organizationId,
}) => {
	const apiUtils = api.useUtils()
	const { t } = useTranslation()
	const router = useRouter<'/org/[slug]/[orgLocationId]'>()
	const { query } = router.isReady ? router : { query: { slug: '', orgLocationId: '' } }
	const { slug, orgLocationId } = query
	const [activeTab, setActiveTab] = useState<string | null>('services')
	const [loading, setLoading] = useState(true)
	const notifySave = useNewNotification({ displayText: 'Saved', icon: 'success' })
	const { data, status } = api.location.forLocationPageEdits.useQuery({ id: orgLocationId })
	const { data: isSaved } = api.savedList.isSaved.useQuery(data?.organization?.id ?? '', {
		enabled: status === 'success' && Boolean(data?.organization?.id),
	})
	const { data: alertData } = api.location.getAlerts.useQuery(
		{ id: orgLocationId },
		{ enabled: router.isReady }
	)

	// for use with MultiSelectPopover

	const { data: orgServices } = api.service.getNames.useQuery(
		{ organizationId },
		{
			select: (returnedData) =>
				returnedData.map(({ id, defaultText }) => ({ value: id, label: defaultText })),
			refetchOnWindowFocus: false,
		}
	)
	const defaultFormValues = data
		? { id: data.id, name: data.name, services: data.services.map(({ serviceId }) => serviceId) }
		: undefined

	const formMethods = useForm<FormSchema>({
		values: defaultFormValues,
	})

	const hasAlerts = Array.isArray(alertData) && alertData.length > 0
	const { classes } = useStyles()

	const servicesRef = useRef<HTMLDivElement>(null)
	const photosRef = useRef<HTMLDivElement>(null)
	const reviewsRef = useRef<HTMLDivElement>(null)

	const updateLocation = api.page.LocationEditUpdate.useMutation({
		onSuccess: () => {
			apiUtils.location.forLocationPageEdits.invalidate()
			notifySave()
		},
	})
	const { unsaved, saveEvent } = useEditMode()

	const saveSubscription = useCallback(() => {
		const values = formMethods.getValues()
		const services = compareArrayVals([defaultFormValues?.services ?? [], values?.services ?? []])
		updateLocation.mutate({
			...values,
			services,
		})
	}, [defaultFormValues?.services, formMethods, updateLocation])

	saveEvent.subscribe(saveSubscription)
	useEffect(() => {
		const { isDirty } = formMethods.formState
		if (unsaved.state !== isDirty) {
			unsaved.set(isDirty)
		}
	}, [formMethods.formState, unsaved])
	useEffect(() => {
		if (data && status === 'success') {
			setLoading(false)
		}
	}, [data, status])

	const tabHandler = useCallback((tab: string) => {
		setActiveTab(tab)
		switch (tab) {
			case 'services': {
				servicesRef.current?.scrollIntoView({ behavior: 'smooth' })
				break
			}
			case 'photos': {
				photosRef.current?.scrollIntoView({ behavior: 'smooth' })
				break
			}
			case 'reviews': {
				reviewsRef.current?.scrollIntoView({ behavior: 'smooth' })
				break
			}
		}
	}, [])

	if (loading || !data) {
		return <OrgLocationPageLoading />
	}

	const {
		// emails,
		// phones,
		// socialMedia,
		// websites,
		attributes,
		description,
		// photos,
		reviews,
	} = data

	return (
		<>
			<Head>
				<title>
					{t('page-title.edit-mode', { ns: 'common', title: `${data.organization.name} - ${data.name}` })}
				</title>
			</Head>
			<FormProvider {...formMethods}>
				<Grid.Col xs={12} sm={8} order={1}>
					<Toolbar
						breadcrumbProps={{
							option: 'back',
							backTo: 'dynamicText',
							backToText: data.organization.name,
							onClick: () => {
								router.push({
									pathname: '/org/[slug]/edit',
									query: { slug: data.organization.slug },
								})
							},
						}}
						organizationId={data.organization.id}
					/>
					<Stack pt={24} align='flex-start' spacing={40}>
						{hasAlerts &&
							alertData.map((alert) => (
								<AlertMessage
									key={alert.key}
									iconKey={alert.icon}
									ns={data.organization.id}
									textKey={alert.key}
									defaultText={alert.text}
								/>
							))}
						<ListingBasicInfo
							data={{
								slug,
								description,
								attributes,
								name: data.name ?? data.organization.name,
								id: data.id,
								locations: [data],
								lastVerified: data.organization.lastVerified,
								isClaimed: data.organization.isClaimed,
							}}
							edit
							location
						/>
						<Tabs w='100%' value={activeTab} onTabChange={tabHandler}>
							<Tabs.List className={classes.tabsList}>
								<Tabs.Tab value='services'>{t('services')}</Tabs.Tab>
								<Tabs.Tab value='photos'>{t('photo', { count: 2 })}</Tabs.Tab>
								<Tabs.Tab value='reviews'>{t('review', { count: 2 })}</Tabs.Tab>
							</Tabs.List>
							<Stack spacing={40} pt={40}>
								<Stack spacing={20} ref={servicesRef}>
									<Stack spacing={8}>
										<Title order={3}>{'Associate service(s) to this location'}</Title>
										<MultiSelectPopover
											label='Services available'
											data={orgServices}
											control={formMethods.control}
											name='services'
											indicateWhenDirty
										/>
									</Stack>
									<Stack spacing={8}>
										<Title order={3}>{'Associated services'}</Title>
										<ServicesInfoCard parentId={data.id} />
									</Stack>
								</Stack>
								<div ref={photosRef}>
									<PhotosSection parentId={data.id} />
								</div>
								<div ref={reviewsRef}>
									<ReviewSection reviews={reviews} />
								</div>
							</Stack>
						</Tabs>
					</Stack>
				</Grid.Col>
				<Grid.Col order={2}>
					<Stack spacing={40}>
						<ContactSection role='org' parentId={data.id} edit />
						<VisitCard locationId={data.id} edit />
					</Stack>
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
}: GetServerSidePropsContext<'/org/[slug]/[orgLocationId]/edit'>) => {
	const urlParams = z.object({ slug: z.string(), orgLocationId: prefixedId('orgLocation') }).safeParse(params)
	if (!urlParams.success) {
		return { notFound: true }
	}
	const { slug, orgLocationId: id } = urlParams.data
	const session = await checkServerPermissions({
		ctx: { req, res },
		permissions: ['dataPortalBasic'],
		has: 'some',
	})
	if (!session) {
		return {
			redirect: {
				destination: `/org/${slug}/${id}`,
				permanent: false,
			},
		}
	}
	const ssg = await trpcServerClient({ session })
	const { id: orgId } = await ssg.organization.getIdFromSlug.fetch({ slug })
	const [i18n] = await Promise.allSettled([
		getServerSideTranslations(locale, [
			'common',
			'services',
			'attribute',
			'phone-type',
			'country',
			'gov-dist',
			orgId,
		]),
		ssg.location.forLocationPageEdits.prefetch({ id }),
		ssg.location.getAlerts.prefetch({ id }),
	])

	const translations = i18n.status === 'fulfilled' ? i18n.value : {}

	const props = {
		organizationId: orgId,
		session,
		trpcState: ssg.dehydrate(),
		...translations,
	}

	return {
		props,
	}
}
export default OrgLocationPage
