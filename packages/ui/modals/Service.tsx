import {
	Title,
	Text,
	Stack,
	Box,
	createStyles,
	useMantineTheme,
	createPolymorphicComponent,
	Modal,
	ButtonProps,
	List,
} from '@mantine/core'
import { useMediaQuery, useDisclosure } from '@mantine/hooks'
import { supplementSchema } from '@weareinreach/api/schemas/attributeSupplement'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { forwardRef, type ReactNode } from 'react'

import {
	AlertMessage,
	Badge,
	BadgeGroup,
	type CommunityTagProps,
	type AttributeTagProps,
	type ServiceTagProps,
} from '~ui/components/core'
import { Hours, ContactInfo, type ContactInfoProps, hasContactInfo } from '~ui/components/data-display'
import { useSlug, getFreeText } from '~ui/hooks'
import { isValidIcon } from '~ui/icon'
import { trpc as api } from '~ui/lib/trpcClient'

import { ModalTitle, ModalTitleProps } from './ModalTitle'

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

export const ServiceModalBody = forwardRef<HTMLButtonElement, ServiceModalProps>(
	({ serviceId, ...props }, ref) => {
		const slug = useSlug()
		const { data, status } = api.service.byId.useQuery({ id: serviceId })
		const { t, i18n } = useTranslation(['common', 'attribute', slug])
		const { classes } = useStyles()
		const [opened, handler] = useDisclosure(false)

		const ServiceModalTitle = () => {
			const icons = ['share', 'save'] satisfies ModalTitleProps['icons']
			const theme = useMantineTheme()
			const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`)
			const router = useRouter<'/org/[slug]' | '/org/[slug]/[orgLocationId]'>()
			const { orgLocationId } = router.query
			const apiQuery = typeof orgLocationId === 'string' ? { orgLocationId } : { slug }
			const { data, status } = api.service.getParentName.useQuery(apiQuery)

			if (isMobile || status === 'loading')
				return (
					<ModalTitle
						breadcrumb={{ option: 'back', backTo: 'none', onClick: () => handler.close() }}
						icons={icons}
					/>
				)

			if (data && status === 'success')
				return (
					<ModalTitle
						breadcrumb={{
							option: 'back',
							backTo: 'dynamicText',
							backToText: data.name as string,
							onClick: () => handler.close(),
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
						onClick: () => handler.close(),
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

		const SubSection = ({ title, children, li }: SubsectionProps) => (
			<Stack spacing={12}>
				{title && <Title order={3}>{t(`service.${title}`)}</Title>}
				{li ? (
					<List>
						{typeof li === 'string' ? (
							<List.Item>
								<Text>{li}</Text>
							</List.Item>
						) : (
							li.map((item, i) => (
								<List.Item key={i}>
									<Text key={i}>{item}</Text>
								</List.Item>
							))
						)}
					</List>
				) : (
					children
				)}
			</Stack>
		)

		const SectionDivider = ({ title, children }: SectionProps) => {
			if (!children || (Array.isArray(children) && children.length === 0)) return <></>

			return (
				<Stack spacing={24}>
					<Box className={classes.sectionDivider}>
						<Title order={3} fw={600}>
							{t(`service.${title}`)}
						</Title>
					</Box>
					{children}
				</Stack>
			)
		}

		const contactData: ContactInfoProps['data'] = {
			phones: [],
			emails: [],
			websites: [],
			socialMedia: [],
		}

		if (data && status === 'success') {
			const { serviceName, services, hours, accessDetails, attributes, description, locations } = data

			const serviceBadges: ServiceTagProps[] = services.map(({ tag }) => ({
				tsKey: tag.tsKey,
				variant: 'service',
			}))

			const baseDetails: AccessDetails = { publicTransit: [] }

			const { publicTransit } = accessDetails.reduce((details, { attributes }) => {
				attributes.forEach(({ supplement }) => {
					supplement.forEach(({ data, text, id }) => {
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
										email: {
											title: null,
											description: null,
											email: parsed.data.access_value,
											legacyDesc: parsed.data.instructions,
											firstName: null,
											lastName: null,
											primary: false,
											locationOnly: false,
											serviceOnly: false,
										},
									})
									break
								}
								case 'phone': {
									const country = locations.find(({ location }) => Boolean(location.country))?.location
										.country
									if (!country) break
									contactData.phones.push({
										phone: {
											number: parsed.data.access_value,
											phoneType: null,
											country,
											primary: false,
											locationOnly: false,
											ext: null,
											phoneLangs: [],
										},
									})
									break
								}
								case 'link':
								case 'file': {
									contactData.websites.push({
										description: null,
										id: '',
										isPrimary: false,
										languages: [],
										orgLocationId: null,
										orgLocationOnly: false,
										url: parsed.data.access_value,
									})
								}
							}

							const accessKey = CONTACTS.find((category) => category === access_type)
							if (accessKey) details[accessKey] ||= <Text key={id}>{access_value}</Text>
						}
					})
				})
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
							if (typeof icon === 'string') {
								subsections.clientsServed[namespace].push({ icon, tsKey, variant: 'community' })
							}
							break
						}
						/** Target Population & Eligibility Requirements */
						case 'eligibility': {
							const type = tsKey.split('.').pop() as string
							switch (type) {
								case 'elig-age': {
									for (const { data, id } of supplement) {
										const parsed = supplementSchema.age.safeParse(data)
										if (!parsed.success) continue
										const { min, max } = parsed.data
										const context = min && max ? 'range' : min ? 'min' : 'max'
										subsections[namespace]['age'] = (
											<ModalText key={id}>
												{t('service.elig-age', { ns: 'common', context, min, max })}
											</ModalText>
										)
									}
									break
								}
								case 'other-describe': {
									for (const { text, id } of supplement) {
										if (!text) continue
										const { key, options } = getFreeText(text)
										subsections.clientsServed.targetPop.push(
											<ModalText key={id}>{t(key, options)}</ModalText>
										)
									}

									break
								}
							}

							break
						}

						// Ask Joe about the suplemement's data.json format for services with prices
						case 'cost': {
							if (!isValidIcon(icon)) break
							const costDetails: CostDetails = { description: [] }

							supplement.forEach(({ text, data, id }) => {
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
							})

							const { price, description } = costDetails
							const badgeProps = { icon, tsKey, tsNs, tProps: { price: price ?? undefined } }
							subsections[namespace].push(<Badge key={id} variant='attribute' {...badgeProps} />)

							if (description.length > 0)
								subsections[namespace].push(
									<SubSection key={id} title='cost-details'>
										{description}
									</SubSection>
								)
							break
						}

						case 'lang': {
							supplement.forEach(({ language }) => {
								if (!language) return
								const { languageName } = language
								subsections[namespace].push(languageName)
							})
							break
						}
						case 'additional': {
							if (tsKey.includes('at-capacity'))
								subsections['atCapacity'] = (
									<AlertMessage textKey={'service.at-capacity'} iconKey='information' />
								)
							else {
								isValidIcon(icon)
									? subsections[`miscWithIcons`].push({
											tsKey,
											icon,
											tsNs,
											variant: 'attribute',
									  })
									: subsections['misc'].push(t(tsKey, { ns: tsNs }))
								break
							}
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
					<SubSection key='ages' title='ages'>
						{eligibility.age}
					</SubSection>
				)

			if (eligibility.requirements.length > 0)
				eligibilityItems.push(<SubSection key='req' title='requirements' li={eligibility.requirements} />)

			if (eligibility.freeText.length > 0)
				eligibilityItems.push(
					<SubSection key='addtnl' title='additional-info'>
						{eligibility.freeText}
					</SubSection>
				)

			const languages = lang.length === 0 ? undefined : <SubSection title='languages' li={lang} />

			const extraInfo: JSX.Element[] = []

			if (miscWithIcons.length > 0)
				extraInfo.push(
					<SubSection key='miscbadges'>
						<BadgeGroup badges={miscWithIcons} withSeparator={false} />
					</SubSection>
				)

			if (misc.length > 0) extraInfo.push(<SubSection key='misc' title='additional-info' li={misc} />)

			return (
				<>
					<Modal title={<ServiceModalTitle />} opened={opened} onClose={() => handler.close()} zIndex={100}>
						<Stack spacing={24}>
							<Stack spacing={16}>
								{atCapacity}
								{serviceName && (
									<Title order={2}>
										{t(serviceName.key, { ns: slug, defaultValue: serviceName.tsKey.text })}
									</Title>
								)}
								{description && (
									<Text>{t(description.key, { ns: slug, defaultValue: description.tsKey.text })}</Text>
								)}
							</Stack>
							<BadgeGroup badges={serviceBadges} />
							{(hasContactInfo(contactData) || Boolean(hours.length)) && (
								<SectionDivider title='get-help'>
									{hasContactInfo(contactData) && (
										<ContactInfo data={contactData} direct order={['phone', 'email', 'website']} />
									)}
									{Boolean(hours.length) && <Hours data={hours} label='service' />}
								</SectionDivider>
							)}
							{(Boolean(clientsServed.srvfocus.length) || Boolean(clientsServed.targetPop.length)) && (
								<SectionDivider title='clients-served'>
									{Boolean(clientsServed.srvfocus.length) && (
										<SubSection title='community-focus'>
											<BadgeGroup badges={clientsServed.srvfocus} withSeparator={false} />
										</SubSection>
									)}
									{Boolean(clientsServed.targetPop.length) && (
										<SubSection title='target-population'>{clientsServed.targetPop}</SubSection>
									)}
								</SectionDivider>
							)}
							<SectionDivider title='cost'>{cost}</SectionDivider>
							<SectionDivider title='eligibility'>{eligibilityItems}</SectionDivider>
							<SectionDivider title='languages'>{languages}</SectionDivider>
							<SectionDivider title='additional-info'>{extraInfo}</SectionDivider>
							<SectionDivider title='transit-directions'>{publicTransit}</SectionDivider>
						</Stack>
					</Modal>
					<Box component='button' ref={ref} onClick={() => handler.open()} {...props} />
				</>
			)
		}

		return <Box component='button' ref={ref} style={{ cursor: 'wait' }} {...props} />
	}
)
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
		srvfocus: CommunityTagProps[]
		targetPop: JSX.Element[]
	}
	atCapacity?: JSX.Element
	eligibility: {
		age?: JSX.Element
		requirements: string[]
		freeText: JSX.Element[]
	}
	misc: string[]
	miscWithIcons: AttributeTagProps[]
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
