import { zodResolver } from '@hookform/resolvers/zod'
import {
	Box,
	type ButtonProps,
	createPolymorphicComponent,
	Drawer,
	List,
	Modal,
	Stack,
	Text,
	Title,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import compact from 'just-compact'
import { useTranslation } from 'next-i18next'
import { forwardRef, type ReactNode, useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { Textarea, TextInput } from 'react-hook-form-mantine'

import { Badge } from '~ui/components/core/Badge'
import { Breadcrumb } from '~ui/components/core/Breadcrumb'
import { ServiceSelect } from '~ui/components/data-portal/ServiceSelect'
import { useCustomVariant } from '~ui/hooks'
import { Icon } from '~ui/icon'
import { trpc as api } from '~ui/lib/trpcClient'
import { DataViewer } from '~ui/other/DataViewer'

import { FormSchema, type TFormSchema } from './schemas'
import { useStyles } from './styles'
import { InlineTextInput } from '../InlineTextInput'

const isObject = (x: unknown): x is object => typeof x === 'object'

const _ServiceEditDrawer = forwardRef<HTMLButtonElement, ServiceEditDrawerProps>(
	({ serviceId, ...props }, ref) => {
		const [drawerOpened, drawerHandler] = useDisclosure(true)
		const [serviceModalOpened, serviceModalHandler] = useDisclosure(false)
		const { classes } = useStyles()
		const variants = useCustomVariant()
		const { t } = useTranslation(['country', 'gov-dist'])
		// #region Get existing data/populate form
		const { data, isLoading } = api.service.forServiceEditDrawer.useQuery(serviceId, {
			refetchOnWindowFocus: false,
		})
		const form = useForm<TFormSchema>({
			resolver: zodResolver(FormSchema),
			values: data,
		})
		const dirtyFields = {
			name: isObject(form.formState.dirtyFields.name) ? form.formState.dirtyFields.name.text : false,
			description: isObject(form.formState.dirtyFields.description)
				? form.formState.dirtyFields.description.text
				: false,
			services: form.formState.dirtyFields.services ?? false,
		}

		// #endregion

		// #region Get all available service options & filter selected
		const { data: allServices } = api.service.getOptions.useQuery(undefined, { refetchOnWindowFocus: false })

		const activeServices = form.watch('services') ?? []

		// #endregion

		// #region Get service area options
		const { data: geoMap } = api.fieldOpt.countryGovDistMap.useQuery(undefined, {
			refetchOnWindowFocus: false,
		})
		const serviceAreas = () => {
			const serviceAreaObj: Record<string, ReactNode[]> = {}
			const { countries, districts } = form.watch('serviceAreas') ?? {}
			if (!geoMap) return null
			const countryIdRegex = /^ctry_.*/
			const distIdRegex = /^gdst_.*/

			if (countries?.length) {
				for (const country of countries) {
					const array = serviceAreaObj[country]
					const countryDetails = geoMap.get(country)
					if (!countryDetails) continue
					if (!Array.isArray(array)) {
						serviceAreaObj[country] = [
							<List.Item key={country}>
								<Text variant={variants.Text.utility4}>
									All of {t(countryDetails.tsKey, { ns: countryDetails.tsNs })}
								</Text>
							</List.Item>,
						]
					} else {
						array.push(
							<List.Item key={country}>
								<Text variant={variants.Text.utility4}>
									All of {t(countryDetails.tsKey, { ns: countryDetails.tsNs })}
								</Text>
							</List.Item>
						)
					}
				}
			}
			if (districts?.length) {
				for (const district of districts) {
					const govDist = geoMap.get(district)
					if (!govDist) continue
					const country = govDist.parent?.parent?.id ?? govDist.parent?.id ?? ''
					if (!countryIdRegex.test(country)) continue
					const array = serviceAreaObj[country]
					const parent = govDist.parent?.id ?? ''
					const parentDist = geoMap.get(parent)
					if (!distIdRegex.test(parent) || !parentDist) {
						Array.isArray(array)
							? array.push(
									<List.Item key={district}>
										<Text variant={variants.Text.utility4}>{t(govDist.tsKey, { ns: govDist.tsNs })}</Text>
									</List.Item>
								)
							: (serviceAreaObj[country] = [
									<List.Item key={district}>
										<Text variant={variants.Text.utility4}>{t(govDist.tsKey, { ns: govDist.tsNs })}</Text>
									</List.Item>,
								])
						continue
					}
					Array.isArray(array)
						? array.push(
								<List.Item key={district}>
									<Text variant={variants.Text.utility4}>
										{t(parentDist.tsKey, { ns: parentDist.tsNs })} - {t(govDist.tsKey, { ns: govDist.tsNs })}
									</Text>
								</List.Item>
							)
						: (serviceAreaObj[country] = [
								<List.Item key={district}>
									<Text variant={variants.Text.utility4}>
										{t(parentDist.tsKey, { ns: parentDist.tsNs })} - {t(govDist.tsKey, { ns: govDist.tsNs })}
									</Text>
								</List.Item>,
							])
					continue
				}
			}
			return Object.entries(serviceAreaObj)?.map(([key, value]) => {
				const country = geoMap.get(key)
				if (!country) return null
				return (
					<Stack key={country.id} spacing={0}>
						<Title order={3}>{t(country.tsKey, { ns: country.tsNs })}</Title>
						<List className={classes.badgeGroup} icon={<Icon icon='carbon:checkmark' height={14} />}>
							{value}
						</List>
					</Stack>
				)
			})
		}

		// #endregion

		return (
			<>
				<Drawer.Root onClose={drawerHandler.close} opened={drawerOpened} position='right'>
					<Drawer.Overlay />
					<Drawer.Content className={classes.drawerContent}>
						<Drawer.Header>
							<Breadcrumb option='close' onClick={drawerHandler.close} />
						</Drawer.Header>
						<Drawer.Body className={classes.drawerBody}>
							<Stack>
								<InlineTextInput
									component={TextInput<TFormSchema>}
									name='name.text'
									control={form.control}
									fontSize='h2'
									data-isDirty={dirtyFields.name}
								/>
								<InlineTextInput
									fontSize='utility4'
									component={Textarea<TFormSchema>}
									name='description.text'
									control={form.control}
									data-isDirty={dirtyFields.description}
									autosize
								/>
								<ServiceSelect name='services' control={form.control} data-isDirty={dirtyFields.services}>
									<Badge.Group>
										{activeServices.map((serviceId) => {
											const service = allServices?.find((s) => s.id === serviceId)
											if (!service) return null
											return (
												<Badge.Service key={service.id}>
													{t(service.tsKey, { ns: service.tsNs })}
												</Badge.Service>
											)
										})}
									</Badge.Group>
								</ServiceSelect>
								{/* <Card> */}
								<Stack className={classes.dottedCard}>
									<Title order={2} className={classes.tealText}>
										Coverage Area
									</Title>
									{serviceAreas()}
									{/* {Boolean(geoMap?.size) && } */}
								</Stack>
								{/* </Card> */}
							</Stack>
						</Drawer.Body>
					</Drawer.Content>
				</Drawer.Root>
				<Stack>
					<DataViewer value={data} />
					<Box component='button' onClick={drawerHandler.open} ref={ref} {...props} />
				</Stack>
			</>
		)
	}
)
_ServiceEditDrawer.displayName = 'ServiceEditDrawer'

export const ServiceEditDrawer = createPolymorphicComponent<'button', ServiceEditDrawerProps>(
	_ServiceEditDrawer
)

interface ServiceEditDrawerProps extends ButtonProps {
	serviceId: string
}

interface FreeText {
	id?: string
	key: string
	ns: string
	tsKey: {
		text: string | null
		crowdinId: number | null
	}
}
interface Attribute {
	attribute: {
		categories?: string[]
		id: string
		tsKey: string
		tsNs: string
		icon?: string | null
	}
	supplement: {
		id: string
		active?: boolean
		data: unknown
		boolean?: boolean | null
		countryId?: string | null
		govDistId?: string | null
		languageId?: string | null
		text: FreeText | null
	}
}
interface FormData {
	id: string
	published: boolean
	deleted: boolean
	serviceName: FreeText | null
	description: FreeText | null
	hours: {
		id: string
		dayIndex: number
		start: Date
		end: Date
		closed: boolean
		tz: string | null
	}[]
	phones: string[]
	emails: string[]
	locations: string[]
	services: {
		id: string
		primaryCategoryId: string
	}[]
	serviceAreas: {
		id: string
		countries: string[]
		districts: string[]
	} | null
	attributes: Attribute[]
	accessDetails: {
		id?: string
		attribute: { id: string; tsKey: string; tsNs: string }
		supplement: {
			id: string
			data: unknown
			text: { id?: string; key: string; ns: string; tsKey: { text: string; crowdinId: number | null } } | null
		}
	}[]
}
