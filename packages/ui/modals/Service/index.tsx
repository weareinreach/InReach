import {
	Box,
	type ButtonProps,
	createPolymorphicComponent,
	createStyles,
	List,
	Modal,
	Stack,
	Text,
	Title,
	useMantineTheme,
} from '@mantine/core'
import { useDisclosure, useMediaQuery } from '@mantine/hooks'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { forwardRef, type JSX, type ReactNode } from 'react'

import { serviceModalEvent } from '@weareinreach/analytics/events'
import { supplementSchema } from '@weareinreach/api/schemas/attributeSupplement'
import { AlertMessage } from '~ui/components/core/AlertMessage'
import { Badge } from '~ui/components/core/Badge'
import { Section } from '~ui/components/core/Section'
import { ContactInfo, hasContactInfo, Hours } from '~ui/components/data-display'
import { type PassedDataObject } from '~ui/components/data-display/ContactInfo/types'
import { getFreeText, useSlug } from '~ui/hooks'
import { isValidIcon } from '~ui/icon'
import { trpc as api } from '~ui/lib/trpcClient'

import { ModalTitle, type ModalTitleProps } from '../ModalTitle'

const useStyles = createStyles((theme) => ({
	sectionDivider: {
		backgroundColor: theme.other.colors.primary.lightGray,
		padding: 12,
	},
	timezone: {
		...theme.other.utilityFonts.utility4,
		color: theme.other.colors.secondary.darkGray,
	},
	blackText: {
		color: '#000000',
		margin: 0,
		whiteSpace: 'pre-line',
	},
}))

/**
 * TODO: [IN-797] Service Modal updates
 *
 * - Fix 'at capacity' layout/spacing
 * - Community focus to use badges with short name & icon
 * - Cost to use attribute badge
 * - Validate data display against finalized data structure.
 */

const CONTACTS = ['phone', 'email', 'website'] as const

const ServiceModalBody = forwardRef<HTMLButtonElement, ServiceModalProps>(({ serviceId, ...props }, ref) => {
	const slug = useSlug()
	const { data, status } = api.service.forServiceModal.useQuery(serviceId)
	const { data: orgId } = api.organization.getIdFromSlug.useQuery({ slug })
	const { t, i18n } = useTranslation(orgId?.id ? ['common', 'attribute', orgId.id] : ['common', 'attribute'])
	const { classes } = useStyles()
	const [opened, handler] = useDisclosure(false)
	const theme = useMantineTheme()
	const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`)

	const ServiceModalTitle = () => {
		const icons = ['share', 'save'] satisfies ModalTitleProps['icons']
		const router = useRouter<'/org/[slug]' | '/org/[slug]/[orgLocationId]'>()
		const { orgLocationId } = router.query
		const apiQuery = typeof orgLocationId === 'string' ? { orgLocationId } : { slug }
		const { data, status } = api.service.getParentName.useQuery(apiQuery)

		if (isMobile || status === 'loading')
			return (
				<ModalTitle breadcrumb={{ option: 'back', backTo: 'none', onClick: handler.close }} icons={icons} />
			)

		if (data && status === 'success')
			return (
				<ModalTitle
					breadcrumb={{
						option: 'back',
						backTo: 'dynamicText',
						backToText: data.name as string,
						onClick: handler.close,
					}}
					icons={icons}
					serviceId={serviceId}
				/>
			)

		return (
			<ModalTitle
				breadcrumb={{
					option: 'back',
					backTo: 'dynamicText',
					backToText: '...',
					onClick: handler.close,
				}}
				icons={icons}
			/>
		)
	}

	const ModalText = ({ children }: ModalTextprops) => (
		<Text component='p' className={classes.blackText}>
			{children}
		</Text>
	)

	const contactData: PassedDataObject = {
		phones: [],
		emails: [],
		websites: [],
		socialMedia: [],
	}

	if (data && status === 'success') {
		const { serviceName, services, hours, accessDetails, attributes, description, locations } = data

		const serviceBadges = (
			<Badge.Group>
				{services.map(({ tag }) => (
					<Badge.Service key={tag.tsKey}>{t(tag.tsKey, { ns: 'services' })}</Badge.Service>
				))}
			</Badge.Group>
		)

		const baseDetails: AccessDetails = { publicTransit: [] }

		const { publicTransit } = accessDetails.reduce((details, { supplement }) => {
			const { data, text, id } = supplement
			const parsed = supplementSchema.accessInstructions.safeParse(data)
			if (parsed.success) {
				const { access_type, access_value } = parsed.data
				switch (access_type) {
					case 'publicTransit': {
						if (!text) break
						const { key, options } = getFreeText(text)
						details[access_type].push(<ModalText key={id}>{t(key, options)}</ModalText>)
						break
					}
					case 'email': {
						contactData.emails.push({
							id,
							title: null,
							description: null,
							email: parsed.data.access_value,
							// legacyDesc: parsed.data.instructions,
							// firstName: null,
							// lastName: null,
							primary: false,
							locationOnly: false,
							serviceOnly: false,
						})
						break
					}
					case 'phone': {
						const country = locations.find(({ location }) => Boolean(location.country))?.location?.country
							?.cca2
						if (!country) break
						contactData.phones.push({
							id,
							number: parsed.data.access_value,
							phoneType: null,
							country,
							primary: false,
							locationOnly: false,
							ext: null,
							description: null,
						})
						break
					}
					case 'link':
					case 'file': {
						contactData.websites.push({
							id,
							description: null,
							isPrimary: false,
							// orgLocationId: null,
							orgLocationOnly: false,
							url: parsed.data.access_value,
						})
					}
				}

				const accessKey = CONTACTS.find((category) => category === access_type)
				if (accessKey) details[accessKey] ||= <Text key={id}>{access_value}</Text>
			}
			return details
		}, baseDetails)

		const attributeCategories: Attributes = {
			cost: [],
			lang: [],
			clientsServed: {
				srvfocus: [],
				targetPop: [],
			},
			eligibility: {
				requirements: [],
				freeText: [],
			},
			misc: [],
			miscWithIcons: [],
		}

		const { eligibility, clientsServed, cost, lang, misc, miscWithIcons, atCapacity } = attributes.reduce(
			(subsections, { attribute, supplement }) => {
				const { tsKey, icon, tsNs, id } = attribute
				/*
					Since the tsKeys follow a sort of pattern with the namespace being the first part of the
					string before the '.', would it be alright to check for the category that way?
					It avoids having to iterate through the categories array with:
					categories.find(({ category }) => tsKey.includes(category.tag))
				*/
				const namespace = tsKey.split('.').shift() as string

				switch (namespace) {
					/** Clients served */
					case 'srvfocus': {
						if (typeof icon === 'string' && attribute._count.parents === 0) {
							subsections.clientsServed[namespace].push(
								<Badge.Community key={id} icon={icon}>
									{t(tsKey, { ns: tsNs })}
								</Badge.Community>
							)
						}
						break
					}
					/** Target Population & Eligibility Requirements */
					case 'eligibility': {
						const type = tsKey.split('.').pop() as string
						switch (type) {
							case 'elig-age': {
								const { data, id } = supplement
								const parsed = supplementSchema.age.safeParse(data)
								if (!parsed.success) break
								const { min, max } = parsed.data
								const context = min && max ? 'range' : min ? 'min' : 'max'
								subsections[namespace]['age'] = (
									<ModalText key={id}>{t('service.elig-age', { ns: 'common', context, min, max })}</ModalText>
								)
								break
							}
							case 'other-describe': {
								const { text, id } = supplement
								if (!text) break
								const { key, options } = getFreeText(text)
								subsections.clientsServed.targetPop.push(<ModalText key={id}>{t(key, options)}</ModalText>)

								break
							}
						}

						break
					}
					case 'cost': {
						if (!isValidIcon(icon)) break
						const costDetails: CostDetails = { description: [] }

						const { text, data, id } = supplement
						if (text) {
							const { key, options } = getFreeText(text)
							costDetails.description.push(<ModalText key={id}>{t(key, options)}</ModalText>)
						}
						const parsed = supplementSchema.cost.safeParse(data)
						if (parsed.success) {
							const { cost, currency } = parsed.data
							costDetails.price = new Intl.NumberFormat(i18n.language, {
								style: 'currency',
								currency: currency ?? undefined,
							}).format(cost)
						}

						const { price, description } = costDetails
						subsections[namespace].push(
							<Badge.Attribute key={id} icon={icon} style={{ justifyContent: 'start' }}>
								{t(tsKey, { price, ns: tsNs })}
							</Badge.Attribute>
						)

						if (description.length > 0)
							subsections[namespace].push(
								<Section.Sub key={id} title={t('service.cost-details')}>
									{description}
								</Section.Sub>
							)
						break
					}

					case 'lang': {
						const { language } = supplement
						if (!language) break
						const { languageName } = language
						subsections[namespace].push(languageName)
						break
					}
					case 'additional': {
						if (tsKey.includes('at-capacity'))
							subsections['atCapacity'] = (
								<AlertMessage textKey={'service.at-capacity'} iconKey='information' />
							)
						else {
							isValidIcon(icon)
								? subsections[`miscWithIcons`].push(
										<Badge.Attribute key={id} icon={icon}>
											{t(tsKey, { ns: tsNs })}
										</Badge.Attribute>
									)
								: subsections['misc'].push(t(tsKey, { ns: tsNs }))
						}
						break
					}
					default: {
						break
					}
				}
				return subsections
			},
			attributeCategories
		)

		const eligibilityItems: JSX.Element[] = []

		if (eligibility.age)
			eligibilityItems.push(
				<Section.Sub key='ages' title={t('service.ages')}>
					{eligibility.age}
				</Section.Sub>
			)

		if (eligibility.requirements.length > 0)
			eligibilityItems.push(
				<Section.Sub key='req' title={t('service.requirements')}>
					<List>
						{eligibility.requirements.map((text, i) => (
							<List.Item key={`${i}-${text}`}>{text}</List.Item>
						))}
					</List>
				</Section.Sub>
			)

		if (eligibility.freeText.length > 0)
			eligibilityItems.push(
				<Section.Sub key='addtnl' title={t('service.additional-info')}>
					{eligibility.freeText}
				</Section.Sub>
			)

		const languages =
			lang.length === 0 ? undefined : (
				<Section.Sub title={t('service.languages')}>
					<List>
						{lang.map((lang, i) => (
							<List.Item key={`${i}-${lang}`}>{lang}</List.Item>
						))}
					</List>
				</Section.Sub>
			)

		const extraInfo: JSX.Element[] = []

		if (miscWithIcons.length > 0)
			extraInfo.push(
				<Section.Sub key='miscbadges'>
					<Badge.Group withSeparator={false}>{miscWithIcons}</Badge.Group>
				</Section.Sub>
			)

		if (misc.length > 0)
			extraInfo.push(
				<Section.Sub key='misc' title={t('service.additional-info')}>
					<List>
						{misc.map((text, i) => (
							<List.Item key={`${i}-${text}`}>{text}</List.Item>
						))}
					</List>
				</Section.Sub>
			)

		return (
			<>
				<Modal
					title={<ServiceModalTitle />}
					opened={opened}
					onClose={() => handler.close()}
					fullScreen={isMobile}
					withinPortal
				>
					<Stack spacing={24}>
						<Stack spacing={16}>
							{atCapacity}
							{serviceName && (
								<Title order={2}>
									{t(serviceName.key, { ns: orgId?.id, defaultValue: serviceName.tsKey.text })}
								</Title>
							)}
							{description && (
								<Text>{t(description.key, { ns: orgId?.id, defaultValue: description.tsKey.text })}</Text>
							)}
						</Stack>
						{serviceBadges}
						{(hasContactInfo(contactData) || Boolean(hours.length)) && (
							<Section.Divider title={t('service.get-help')}>
								{hasContactInfo(contactData) && (
									<ContactInfo passedData={contactData} direct order={['phone', 'email', 'website']} />
								)}
								{Boolean(hours.length) && <Hours parentId={serviceId} label='service' />}
							</Section.Divider>
						)}
						{(Boolean(clientsServed.srvfocus.length) || Boolean(clientsServed.targetPop.length)) && (
							<Section.Divider title={t('service.clients-served')}>
								{Boolean(clientsServed.srvfocus.length) && (
									<Section.Sub title={t('service.community-focus')}>
										<Badge.Group withSeparator={false}>{clientsServed.srvfocus}</Badge.Group>
									</Section.Sub>
								)}
								{Boolean(clientsServed.targetPop.length) && (
									<Section.Sub title={t('service.target-population')}>{clientsServed.targetPop}</Section.Sub>
								)}
							</Section.Divider>
						)}
						<Section.Divider title={t('service.cost')}>{cost}</Section.Divider>
						<Section.Divider title={t('service.eligibility')}>{eligibilityItems}</Section.Divider>
						<Section.Divider title={t('service.languages')}>{languages}</Section.Divider>
						<Section.Divider title={t('service.additional-info')}>{extraInfo}</Section.Divider>
						<Section.Divider title={t('service.transit-directions')}>{publicTransit}</Section.Divider>
					</Stack>
				</Modal>
				<Box
					component='button'
					ref={ref}
					onClick={() => {
						serviceModalEvent.opened({ serviceId, serviceName: serviceName?.tsKey?.text, orgSlug: slug })
						handler.open()
					}}
					{...props}
				/>
			</>
		)
	}

	return <Box component='button' ref={ref} style={{ cursor: 'wait' }} {...props} />
})
ServiceModalBody.displayName = 'ServiceModal'

export const ServiceModal = createPolymorphicComponent<'button', ServiceModalProps>(ServiceModalBody)
export interface ServiceModalProps extends ButtonProps {
	serviceId: string
}

type SubsectionProps = {
	title?: string
	children?: ReactNode
	li?: string[] | string
}

type SectionProps = {
	title?: string
	children?: ReactNode
}

type Attributes = {
	directEmail?: string
	directPhone?: string
	directWebsite?: string
	cost: JSX.Element[]
	lang: string[]
	clientsServed: {
		srvfocus: JSX.Element[]
		targetPop: JSX.Element[]
	}
	atCapacity?: JSX.Element
	eligibility: {
		age?: JSX.Element
		requirements: string[]
		freeText: JSX.Element[]
	}
	misc: string[]
	miscWithIcons: JSX.Element[]
}

type AccessDetails = {
	phone?: JSX.Element
	email?: JSX.Element
	website?: JSX.Element
	atCapacity?: JSX.Element
	publicTransit: JSX.Element[]
}

type CostDetails = {
	price?: number | string
	description: JSX.Element[]
}

type ModalTextprops = {
	children: ReactNode
}
