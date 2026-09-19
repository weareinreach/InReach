import { Box, Grid, Group, Stack, Tooltip } from '@mantine/core'
import { t } from 'i18next'
import compact from 'just-compact'
import { type InferGetServerSidePropsType } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { type GetServerSideProps } from 'nextjs-routes'
import { useEffect, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { z } from 'zod'

import { trpcServerClient } from '@weareinreach/api/trpc'
import { checkServerPermissions } from '@weareinreach/auth'
import { Button } from '@weareinreach/ui/components/core'
import { LocationDrawer } from '@weareinreach/ui/components/data-portal/LocationDrawer'
import { ServiceEditDrawer } from '@weareinreach/ui/components/data-portal/ServiceEditDrawer'
import { ContactSection } from '@weareinreach/ui/components/sections/ContactSection'
import { DataToolbar } from '@weareinreach/ui/components/sections/DataToolbar'
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

const addRemoteServiceLabel = 'Add Remote Service'

const OrganizationPage: NextPageWithOptions<InferGetServerSidePropsType<typeof getServerSideProps>> = () => {
	const router = useRouter<'/org/[slug]'>()
	const apiUtils = api.useUtils()
	const {
		query: { slug: pageSlug },
	} = router.isReady ? router : { query: { slug: '' } }
	const {
		data,
		status,
		isFetching: _isFetching,
	} = api.organization.forOrgPageEdits.useQuery({ slug: pageSlug }, { enabled: router.isReady })
	const { mutate: revalidatePage } = api.misc.revalidatePage.useMutation()
	const updateBasic = api.organization.updateBasic.useMutation({
		// Optimistically update the UI with the new data
		onMutate: async (newData) => {
			// Cancel any outgoing refetches so they don't overwrite our optimistic update
			await apiUtils.organization.forOrgPageEdits.cancel({ slug: pageSlug })

			// Snapshot the previous value
			const previousData = apiUtils.organization.forOrgPageEdits.getData({ slug: pageSlug })

			// Optimistically update to the new value
			// @ts-expect-error - The description object is intentionally missing the `ns` property in this specific case.
			apiUtils.organization.forOrgPageEdits.setData({ slug: pageSlug }, (oldData) => {
				if (!oldData) return undefined
				return {
					...oldData,
					name: newData.name ?? oldData.name, // Optimistically update the name
					// Safely update the nested description object, handling cases where it might be null.
					description: newData.description
						? {
								...(oldData.description ?? { id: '', key: '' }), // Provide a default shape if null
								tsKey: { text: newData.description },
							}
						: oldData.description,
				}
			})

			// Return a context object with the snapshotted value
			return { previousData }
		},
		onSuccess: (data, variables) => {
			// After a successful optimistic update, reset the form with the new values.
			// This synchronizes react-hook-form's state and correctly sets `isDirty` to false.
			// `keepDirtyValues: false` overrides the form-level default (set above, to stop a background
			// refetch from clobbering an in-progress edit) - this reset is different: it's applying what
			// the user just successfully saved, so it should always win outright.
			formMethods.reset(
				{
					id: variables.id,
					name: variables.name,
					description: variables.description,
				},
				{ keepDirtyValues: false }
			)
			// Renaming an org regenerates its `slug` server-side (mutation.updateBasic.handler.ts) - the
			// URL/route param this whole page is keyed on (`pageSlug`) doesn't know that happened, so
			// without this the page keeps querying `forOrgPageEdits` by a slug that no longer exists,
			// which throws `findUniqueOrThrow`'s "No record was found" the moment anything refetches it
			// (confirmed live - this is what silently broke Save after a rename). Moving to the real,
			// current slug keeps every subsequent query correctly keyed.
			if (data.slug !== pageSlug) {
				router.replace({ pathname: '/org/[slug]/edit', query: { slug: data.slug } })
			}
		},
		// If the mutation fails, use the context returned from onMutate to roll back
		onError: (err, newData, context) => {
			if (context?.previousData) {
				apiUtils.organization.forOrgPageEdits.setData({ slug: pageSlug }, context.previousData)
			}
		},
		onSettled: (data) => {
			// `refetchType: 'none'` - a forced immediate refetch here would still be keyed on the stale
			// `pageSlug` closed over by this callback (the router.replace above hasn't re-rendered this
			// component yet), so it would hit the exact same now-nonexistent-slug error `invalidate()`
			// alone used to cause on every rename. This still marks it stale so the next natural load
			// (now under the corrected slug/route) picks up fresh data.
			apiUtils.organization.forOrgPageEdits.invalidate(undefined, { refetchType: 'none' })
			revalidatePage({ path: router.asPath.replace('/edit', '') })
			if (data && data.slug !== pageSlug) {
				revalidatePage({ path: `/org/${data.slug}` })
			}
		},
	})

	// `BadgeEdit` lives in the shared UI package and runs on its own tRPC client/QueryClient, so
	// it has no way to update this page's `forOrgPageEdits` cache after a save. It calls this back
	// with the freshly-saved badge selection so we can patch our own cache directly, the same way
	// `updateBasic` above does for name/description.
	const handleBadgesChange = (
		badgeType: 'organization-leadership' | 'service-focus',
		newAttributes: NonNullable<typeof data>['attributes']
	) => {
		apiUtils.organization.forOrgPageEdits.setData({ slug: pageSlug }, (oldData) => {
			if (!oldData) return oldData
			const otherAttributes = oldData.attributes.filter(
				({ attribute }) => !attribute.categories.some(({ category }) => category.tag === badgeType)
			)
			return { ...oldData, attributes: [...otherAttributes, ...newAttributes] }
		})
	}

	const formMethods = useForm<FormSchema>({
		// `defaultValues` (a plain object) is captured exactly once, on this component instance's very
		// first render - if `data` hasn't loaded yet at that instant (a real race, not guaranteed to
		// lose), `id` locks in as `undefined` forever and is never resynced, since nothing here ever
		// called `reset()`/`setValue()` once `data` actually arrived (the comment above previously
		// claimed "we will populate the form via useEffect", but that effect never existed). Since `id`
		// is required by `organization.updateBasic`'s schema, every save silently failed input
		// validation - confirmed directly, not just theorized. `values` (unlike `defaultValues`)
		// reactively resyncs the form whenever `data`'s reference changes, fixing this the same way
		// PhoneDrawer/WebsiteDrawer/etc. already correctly do elsewhere in this codebase.
		values: data
			? {
					id: data.id,
					name: data.name ?? '',
					description: data.description?.tsKey?.text ?? '',
				}
			: undefined,
		// Without this, a background refetch of `forOrgPageEdits` that resolves while the user is
		// mid-edit (e.g. window refocus) would silently overwrite their in-progress, unsaved changes via
		// the `values` sync above. The explicit `reset()` call in `onSuccess` below overrides this with
		// `keepDirtyValues: false`, since applying what was just successfully saved should win outright.
		resetOptions: { keepDirtyValues: true },
	})

	const { unsaved, saveEvent, isEditMode } = useEditMode()
	saveEvent.subscribe(() => {
		const values = formMethods.getValues()
		updateBasic.mutate(values)
	})
	// `formState` is a Proxy that only starts tracking a given property (like `isDirty`) once it's
	// read during render - reading it inside a `useEffect` callback, as the previous version of this
	// code did, never registers that subscription, so the effect's own `[formMethods.formState, ...]`
	// dependency (a stable object reference that Proxy wrapper never itself changes) never actually
	// changes and the effect only ever runs once, at mount, with whatever `isDirty` happened to be
	// then (always `false`). That permanently disabled the Navbar's "Save Changes" button - `unsaved.state`
	// never became `true` no matter what the user typed. Destructuring `isDirty` here, during render,
	// registers the subscription correctly, and using the resulting boolean (not the wrapping object)
	// as the effect's dependency is what actually lets the effect re-run when it changes.
	const { isDirty } = formMethods.formState
	useEffect(() => {
		if (unsaved.state !== isDirty) {
			unsaved.set(isDirty)
		}
	}, [isDirty, unsaved])

	const [loading, setLoading] = useState(true)
	const { data: hasRemote } = api.service.forServiceInfoCard.useQuery(
		{ parentId: data?.id ?? '', remoteOnly: true, isEditMode },
		{
			enabled: !!data?.id,
			select: (result) => result.length !== 0,
		}
	)
	useEffect(() => {
		if (data && status === 'success') {
			setLoading(false)
		}
	}, [data, status])
	if (loading || !data) {
		return <OrgPageLoading />
	}

	const { attributes, description: _description, slug, locations, isClaimed } = data

	return (
		<>
			<Head>
				<title>{t('page-title.edit-mode', { ns: 'common', title: data.name })}</title>
			</Head>
			<FormProvider {...formMethods}>
				<Grid.Col span={12} order={0}>
					<DataToolbar data={data} />
				</Grid.Col>
				<Grid.Col span={{ sm: 8 }} order={1}>
					<Stack pt={24} align='flex-start' gap={40}>
						<ListingBasicInfo
							data={{
								id: data.id,
								name: data.name ?? '',
								lastVerified: data.lastVerified,
								slug,
								attributes,
								description: data.description,
								locations,
								isClaimed,
							}}
							edit
							onBadgesChange={handleBadgesChange}
						/>
						<Group>
							{}
							<Tooltip
								label='Use for a physical address where this org provides services in person.'
								withArrow
								multiline
								w={260}
							>
								<Box style={{ display: 'inline-block' }}>
									{/* eslint-disable-next-line i18next/no-literal-string */}
									<LocationDrawer>Create new Location</LocationDrawer>
								</Box>
							</Tooltip>
							{!hasRemote && (
								<Tooltip
									label="Use for a service with no physical office — offered by phone, video, or online. If this service is also offered at one of the org's locations, add it from that location's page instead."
									withArrow
									multiline
									w={260}
								>
									<Box style={{ display: 'inline-block' }}>
										<ServiceEditDrawer
											createNew
											autoAttachAttributeTag='offers-remote-services'
											component={Button}
											variant='primary'
										>
											{addRemoteServiceLabel}
										</ServiceEditDrawer>
									</Box>
								</Tooltip>
							)}
						</Group>
						<Stack gap={40} w='100%'>
							{locations.map((location) => (
								<LocationCard key={location.id} locationId={location.id} edit />
							))}
							{hasRemote && <LocationCard remoteOnly edit />}
						</Stack>
					</Stack>
				</Grid.Col>
				<Grid.Col span={{ base: 12, sm: 4 }} order={2}>
					<Stack pt={24} gap={40}>
						<ContactSection role='org' parentId={data.id} edit />
					</Stack>
				</Grid.Col>
			</FormProvider>
		</>
	)
}

export const getServerSideProps: GetServerSideProps<{ organizationId: string }, '/org/[slug]'> = async ({
	locale,
	params,
	req,
	res,
}) => {
	if (!params) {
		return { notFound: true }
	}
	const { slug } = params

	const session = await checkServerPermissions({
		ctx: { req, res },
		permissions: ['dataPortalBasic', 'dataPortalManager', 'dataPortalAdmin', 'root'],
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
	const { id: organizationId, redirectedTo } = await ssg.organization.getIdFromSlug.fetch({ slug })
	// Renaming an org regenerates its slug - a bookmarked/cached link using the old one used to
	// hard-crash here with a raw Prisma "record not found" instead of resolving (confirmed live).
	// `getIdFromSlug` now resolves it via the recorded redirect; following through to the org's
	// current URL here keeps every query below (which all key off `slug`) correctly scoped, instead
	// of continuing to load the page under a slug that no longer matches anything.
	if (redirectedTo) {
		return {
			redirect: {
				destination: `/org/${redirectedTo}/edit`,
				permanent: false,
			},
		}
	}

	const [i18n] = await Promise.all([
		getServerSideTranslations(
			locale,
			compact(['common', 'services', 'attribute', 'phone-type', 'gov-dist', 'user', organizationId])
		),
		ssg.organization.forOrgPageEdits.prefetch({ slug }),
		ssg.fieldOpt.countries.prefetch({ activeForOrgs: true }),
	])
	const props = {
		organizationId,
		session,
		trpcState: ssg.dehydrate(),
		...i18n,
	}

	return {
		props,
	}
}
export default OrganizationPage
