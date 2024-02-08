import { createStyles, Grid, rem, Stack } from '@mantine/core'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { type GetServerSideProps } from 'nextjs-routes'
import { type ReactNode, Suspense, useEffect, useState } from 'react'
import { type Path, useFieldArray, useForm } from 'react-hook-form'
import { Textarea, TextInput } from 'react-hook-form-mantine'
import { type Merge } from 'type-fest'
import { z } from 'zod'

import { prefixedId } from '@weareinreach/api/schemas/idPrefix'
import { trpcServerClient } from '@weareinreach/api/trpc'
import { checkServerPermissions } from '@weareinreach/auth'
import { generateId } from '@weareinreach/db/lib/idGen'
import { Badge } from '@weareinreach/ui/components/core/Badge'
import { Section } from '@weareinreach/ui/components/core/Section'
import { InlineTextInput } from '@weareinreach/ui/components/data-portal/InlineTextInput'
import { ServiceSelect } from '@weareinreach/ui/components/data-portal/ServiceSelect'
import { api } from '~app/utils/api'
import { getServerSideTranslations } from '~app/utils/i18n'
import { Button } from '~ui/components/core/Button'

const DevTool = dynamic(() => import('@hookform/devtools').then((mod) => mod.DevTool), { ssr: false })

const FreetextObject = z
	.object({
		text: z.string().nullable(),
		key: z.string().nullish(),
		ns: z.string().nullish(),
	})
	.nullish()

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MapValue<A> = A extends Map<any, infer V> ? V : never

const literalSchema = z.union([z.string(), z.number(), z.boolean(), z.null()])
type Literal = z.infer<typeof literalSchema>
type Json = Literal | { [key: string]: Json } | Json[]
const JsonSchema: z.ZodType<Json> = z.lazy(() =>
	z.union([literalSchema, z.array(JsonSchema), z.record(JsonSchema)])
)

const FormSchema = z.object({
	name: FreetextObject,
	description: FreetextObject,
	services: prefixedId('serviceTag').array(),
	attributes: z
		.object({
			text: z
				.object({
					key: z.string(),
					text: z.string(),
					ns: z.string(),
				})
				.nullable(),
			boolean: z.boolean().nullable(),
			data: z.any(),
			active: z.boolean(),
			countryId: z.string().nullable(),
			govDistId: z.string().nullable(),
			languageId: z.string().nullable(),
			category: z.string(),
			attributeId: z.string(),
			supplementId: z.string(),
		})
		.array(),
	published: z.boolean(),
	deleted: z.boolean(),
})
const isObject = (x: unknown): x is object => typeof x === 'object'

type FormSchemaType = z.infer<typeof FormSchema>
const EditServicePage = () => {
	const { t } = useTranslation()
	const router = useRouter<'/org/[slug]/[orgLocationId]/edit/[orgServiceId]'>()
	const { data: attributeMap } = api.attribute.map.useQuery()
	const { data } = api.page.serviceEdit.useQuery({ id: router.query.orgServiceId ?? '' })
	const { data: allServices } = api.service.getOptions.useQuery()
	const form = useForm<FormSchemaType>({
		values: data ? { ...data, services: data.services.map(({ id }) => id) } : undefined,
	})
	const attribFields = useFieldArray({ control: form.control, name: 'attributes', keyName: '_rhfId' })

	console.log(`🚀 ~ EditServicePage ~ attribFields:`, attribFields.fields)

	const dirtyFields = {
		name: isObject(form.formState.dirtyFields.name) ? form.formState.dirtyFields.name.text : false,
		description: isObject(form.formState.dirtyFields.description)
			? form.formState.dirtyFields.description.text
			: false,
		services: form.formState.dirtyFields.services ?? false,
	}
	const dataAttributes = form.watch('attributes') ?? []
	const activeServices = form.watch('services') ?? []

	type AttrSectionKeys = 'clientsServed' | 'cost' | 'eligibility' | 'languages' | 'additionalInfo'
	type AttrSectionVals = Merge<
		FormSchemaType['attributes'][number],
		{ _rhfName: Path<FormSchemaType>; _rhfLabel: string }
	>

	const attributeBase: {
		[key in AttrSectionKeys]: ReactNode[]
	} = {
		clientsServed: [],
		cost: [],
		eligibility: [],
		languages: [],
		additionalInfo: [],
	}
	const [attributes, setAttributes] = useState(attributeBase)

	console.log(`🚀 ~ EditServicePage ~ attributes:`, attributes)

	useEffect(() => {
		if (!attributeMap) return
		const attrToSet = attributeBase

		for (const [i, item] of dataAttributes.entries()) {
			const attribDef = attributeMap.byId.get(item.attributeId)

			console.log(`🚀 ~ useEffect ~ attribDef:`, attribDef)

			if (!attribDef) continue

			const attribNs = attribDef.tsKey.split('.').length
				? (attribDef.tsKey.split('.').shift() as string)
				: attribDef.tsKey
			console.log(`🚀 ~ useEffect ~ attribNs:`, attribNs)

			switch (attribNs) {
				case 'tpop': {
					// attrToSet.clientsServed.push({
					// 	...item,
					// 	_rhfName: `attributes.${i}.text.text`,
					// 	_rhfLabel: 'Target Population',
					// })
					attrToSet.clientsServed.push(
						<InlineTextInput
							key={item.supplementId}
							component={Textarea<FormSchemaType>}
							name={`attributes.${i}.text.text`}
							control={form.control}
							label='Target Population'
							data-isDirty={form.getFieldState(`attributes.${i}.text.text`).isDirty}
							autosize
						/>
					)
					break
				}
				case 'cost': {
					if (attribDef.tag === 'cost-free')
						// attrToSet.cost.push({
						// 	...item,
						// 	_rhfName: `attributes.${i}`,
						// 	_rhfLabel: 'Cost',
						// })
						break
				}
			}
		}
		setAttributes(attrToSet)

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [dataAttributes, attributeMap])

	return (
		<>
			<Grid.Col xs={12} sm={8} order={1}>
				<Stack pt={24} align='flex-start' spacing={40}>
					<Stack spacing={8} w='100%'>
						<Suspense fallback='Loading'>
							<InlineTextInput
								component={TextInput<FormSchemaType>}
								name='name.text'
								control={form.control}
								fontSize='h2'
								data-isDirty={dirtyFields.name}
							/>
						</Suspense>
						<Suspense fallback='Loading'>
							<InlineTextInput
								component={Textarea<FormSchemaType>}
								name='description.text'
								control={form.control}
								data-isDirty={dirtyFields.description}
								autosize
							/>
						</Suspense>
					</Stack>
					<Suspense fallback='Loading'>
						<ServiceSelect name='services' control={form.control} data-isDirty={dirtyFields.services}>
							<Badge.Group>
								{activeServices.map((serviceId) => {
									const service = allServices?.find((s) => s.id === serviceId)
									if (!service) return null
									return (
										<Badge.Service key={service.id}>{t(service.tsKey, { ns: service.tsNs })}</Badge.Service>
									)
								})}
							</Badge.Group>
						</ServiceSelect>
					</Suspense>
					<Section.Divider title={t('service.get-help')}>{t('service.get-help')}</Section.Divider>
					<Section.Divider title={t('service.clients-served')}>
						{attributes.clientsServed.length ? (
							// attributes.clientsServed.map(({ _rhfName, _rhfLabel, ...item }) => (
							// 	<InlineTextInput
							// 		key={item.supplementId}
							// 		component={Textarea<FormSchemaType>}
							// 		name={_rhfName}
							// 		control={form.control}
							// 		label={_rhfLabel}
							// 		data-isDirty={form.getFieldState(_rhfName).isDirty}
							// 		autosize
							// 	/>
							// ))
							attributes.clientsServed
						) : (
							<Button
								onClick={() => {
									attribFields.append({
										attributeId: 'attr_01HNG5GDC5MXW30F32FWJNJ98C',
										supplementId: generateId('attributeSupplement'),
										boolean: null,
										active: true,
										countryId: null,
										govDistId: null,
										languageId: null,
										category: '',
										text: {
											text: '',
											key: '',
											ns: '',
										},
									})
								}}
							>
								{t('add', { item: '$t(service.clients-served)' })}
							</Button>
						)}
					</Section.Divider>
					<Section.Divider title={t('service.cost')}>{t('service.cost')}</Section.Divider>
					<Section.Divider title={t('service.eligibility')}>{t('service.eligibility')}</Section.Divider>
					<Section.Divider title={t('service.languages')}>{t('service.languages')}</Section.Divider>
					<Section.Divider title={t('service.extra-info')}>{t('service.extra-info')}</Section.Divider>
				</Stack>
			</Grid.Col>
			{/* @ts-expect-error Hush, devtool. */}
			<DevTool control={form.control} />
		</>
	)
}

export default EditServicePage

export const getServerSideProps: GetServerSideProps = async ({ locale, params, req, res }) => {
	const urlParams = z
		.object({
			slug: z.string(),
			orgLocationId: prefixedId('orgLocation'),
			orgServiceId: prefixedId('orgService'),
		})
		.safeParse(params)
	if (!urlParams.success) return { notFound: true }
	const { slug, orgLocationId, orgServiceId } = urlParams.data
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
	const { id: orgId } = await ssg.organization.getIdFromSlug.fetch({ slug })
	const [i18n] = await Promise.all([
		getServerSideTranslations(locale, ['common', 'services', 'attribute']),
		ssg.page.serviceEdit.prefetch({ id: orgServiceId }),
		ssg.component.ServiceSelect.prefetch(),
		ssg.service.getOptions.prefetch(),
	])
	const props = {
		organizationId: orgId,
		session,
		trpcState: ssg.dehydrate(),
		...i18n,
	}

	return {
		props,
	}
}
