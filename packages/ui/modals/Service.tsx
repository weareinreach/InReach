import {
	Title,
	Text,
	Stack,
	Group,
	Box,
	createStyles,
	useMantineTheme,
	createPolymorphicComponent,
	Modal,
	ButtonProps,
} from '@mantine/core'
import { useMediaQuery, useDisclosure } from '@mantine/hooks'
import { supplementSchema } from '@weareinreach/api/schemas/attributeSupplement'
import { Interval, DateTime } from 'luxon'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { forwardRef } from 'react'

import {
	AlertMessage,
	Badge,
	BadgeGroup,
	type CommunityTagProps,
	type AttributeTagProps,
} from '~ui/components/core'
import { Icon, type IconList } from '~ui/icon'
import { trpc as api } from '~ui/lib/trpcClient'

import { ModalTitle, ModalTitleProps } from './ModalTitle'

const useStyles = createStyles((theme) => ({
	sectionDivider: {
		backgroundColor: theme.other.colors.primary.lightGray,
		padding: 12,
	},
	ul: {
		margin: 0,
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
 * TODO: [IN-797] Service Modal updates - Fix 'at capacity' layout/spacing
 *
 * - Format phone number with'libphonenumber-js'
 * - Convert timezone to standard localized name "Eastern Standard Time"
 * - Community focus to use badges with short name & icon
 * - Cost to use attribute badge
 * - Validate data display against finalized data structure.
 */

const CONTACTS = ['phone', 'email', 'website'] as const

export const ServiceModalBody = forwardRef<HTMLButtonElement, ServiceModalProps>(
	({ serviceId, ...props }, ref) => {
		const { data, status } = api.service.byId.useQuery({ id: serviceId })
		const { t, i18n } = useTranslation(['common', 'attribute'])
		const { classes } = useStyles()
		const [opened, handler] = useDisclosure(false)

		const ServiceModalTitle = () => {
			const icons = ['share', 'save'] as ModalTitleProps['icons']
			const theme = useMantineTheme()
			const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`)
			const router = useRouter<'/org/[slug]' | '/org/[slug]/[orgLocationId]'>()
			const { slug, orgLocationId } = router.query
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

		const UL = (props: { children: string[] }) => {
			const listItems = props.children.map((text) => (
				<li key={text}>
					<Text>{text}</Text>
				</li>
			))
			return <ul className={classes.ul}>{listItems}</ul>
		}

		const ModalText = ({ children }: ModalTextprops) => (
			<Text component='p' className={classes.blackText}>
				{children}
			</Text>
		)

		const SubSection = ({ title, children, li }: subsectionProps) => {
			let display = children

			if (li) display = <UL>{typeof li === 'string' ? [li] : li}</UL>

			return (
				<Stack spacing={12}>
					{title && <Title order={3}>{t(`service.${title}`)}</Title>}
					{display}
				</Stack>
			)
		}

		const SectionDivider = ({ title, children }: sectionProps) => {
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

		if (data && status === 'success') {
			const { serviceName, services, hours, accessDetails, attributes } = data

			let name: JSX.Element | undefined

			if (serviceName) name = <Title order={2}>{serviceName.tsKey.text}</Title>

			let orgTimezone: string | null = null
			const allServices = services.map(({ tag }) => (
				<Badge key={tag.tsKey} variant='service' tsKey={tag.tsKey} />
			))

			const formatHours: JSX.Element[] = []

			const hourMap = new Map<number, Set<(typeof hours)[number]>>()
			const { weekYear, weekNumber } = DateTime.now()
			for (const entry of hours) {
				const daySet = hourMap.get(entry.dayIndex)
				if (!daySet) {
					hourMap.set(entry.dayIndex, new Set([entry]))
				} else {
					hourMap.set(entry.dayIndex, new Set([...daySet, entry]))
				}
			}

			hourMap.forEach((value, key) => {
				const entry = [...value].map(({ start, end, dayIndex: weekday, closed, tz }, idx) => {
					const zone = tz ?? undefined
					const open = DateTime.fromJSDate(start, { zone }).set({ weekday, weekNumber, weekYear })
					const close = DateTime.fromJSDate(end, { zone }).set({ weekday, weekNumber, weekYear })
					const interval = Interval.fromDateTimes(open, close)

					if (!orgTimezone && zone) {
						orgTimezone = open.toFormat('ZZZZZ (ZZZZ)', { locale: i18n.language })
					}
					if (closed) return null

					if (idx === 0) {
						const range = interval
							.toLocaleString(
								{ weekday: 'short', hour: 'numeric', minute: 'numeric', formatMatcher: 'best fit' },
								{ locale: i18n.language }
							)
							.split(',')
							.join('')

						return interval.isValid ? range : null
					}

					const range = interval.toLocaleString(
						{ hour: 'numeric', minute: 'numeric' },
						{ locale: i18n.language }
					)
					return interval.isValid ? range : null
				})
				if (entry[0] === null) return
				formatHours.push(<ModalText>{entry.filter(Boolean).join(' & ')}</ModalText>)
			})

			const timeZone = <Text className={classes.timezone}>{orgTimezone}</Text>

			const serviceHours =
				formatHours.length > 0 ? (
					<SubSection title='hours'>
						<Stack spacing={12}>
							<div>{timeZone}</div>
							<div>{formatHours}</div>
						</Stack>
					</SubSection>
				) : undefined

			const baseDetails: accessDetails = { publicTransit: [] }

			const { publicTransit, ...contacts } = accessDetails.reduce((details, { attributes }) => {
				attributes.forEach(({ supplement }) => {
					supplement.forEach(({ data, text }) => {
						const parsed = supplementSchema.accessInstructions.safeParse(data)
						if (parsed.success) {
							const { access_type, access_value } = parsed.data

							if (access_type === 'publicTransit')
								details[access_type].push(<ModalText>{t(text!.key) as string}</ModalText>)

							const accessKey = CONTACTS.find((category) => category === access_type)
							if (accessKey) details[accessKey] ||= <Text>{access_value}</Text>
						}
					})
				})
				return details
			}, baseDetails)

			const availableContacts = Object.entries(contacts)
				.filter(([key, value]) => value)
				.map(([key, value]) => {
					return (
						<SubSection key={key} title={key}>
							{value}
						</SubSection>
					)
				})

			const attributeCategories: Attributes = {
				community: [],
				cost: [],
				lang: [],
				srvFocus: [],
				eligibility: {
					requirements: [],
					freeText: [],
				},
				misc: [],
				miscWithIcons: [],
			}

			const { eligibility, community, srvFocus, cost, lang, misc, miscWithIcons, atCapacity } =
				attributes.reduce((subsections, { attribute, supplement }) => {
					const { tsKey, icon, tsNs } = attribute
					/*
					Since the tsKeys follow a sort of pattern with the namespace being the first part of the
					string before the '.', would it be alright to check for the category that way?
					It avoids having to iterate through the categories array with:
					categories.find(({ category }) => tsKey.includes(category.tag))
				*/
					const namespace = tsKey.split('.').shift() as string

					switch (namespace) {
						case 'community': {
							subsections[namespace].push({ tsKey, icon: icon as string, variant: namespace })
							break
						}
						case 'srvFocus': {
							subsections[namespace].push(<ModalText>{t(tsKey) as string}</ModalText>)
							break
						}
						// Ask Joe about the suplemement's data.json format for services with prices
						case 'cost': {
							const costDetails: costDetails = { description: [] }

							supplement.forEach(({ text, data }) => {
								if (text) {
									const { ns, key } = text
									costDetails.description.push(
										<ModalText>{t(`${ns}.${key}`, { ns: 'attribute' }) as string}</ModalText>
									)
								}
								const parsed = supplementSchema.cost.safeParse(data)
								if (parsed.success) {
									const { cost: price } = parsed.data
									costDetails.price = price
								}
							})

							const { price, description } = costDetails

							subsections[namespace].push(
								<Group spacing='sm'>
									<Icon icon='carbon:piggy-bank' />
									<Text>{price || t(tsKey)}</Text>
								</Group>
							)

							if (description.length > 0)
								subsections[namespace].push(<SubSection title='cost-details'>{description}</SubSection>)
							break
						}
						case 'eligibility': {
							if (tsKey.includes('elig-age')) {
								supplement.forEach(({ data }) => {
									const parsed = supplementSchema.age.safeParse(data)
									if (!parsed.success) return
									const { min, max } = parsed.data
									const ageRange = t('service.age.range', {
										min: min || t('service.age.min'),
										max: max || t('service.age.max'),
										separator: min && max ? ' — ' : undefined,
									})
									subsections[namespace]['age'] = <ModalText>{ageRange}</ModalText>
								})
							} else if (tsKey.includes('other-describe')) {
								supplement.forEach(({ text }) => {
									const { ns, key } = text as { ns: string; key: string }
									subsections[namespace]['freeText'].push(
										<ModalText>{t(`${ns}.${key}`) as string}</ModalText>
									)
								})
							} else subsections[namespace]['requirements'].push(t(tsKey))

							break
						}
						case 'lang': {
							supplement.forEach(({ language }) => {
								const { languageName } = language as Language
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
								icon
									? subsections[`miscWithIcons`].push({
											tsKey,
											icon: icon as IconList,
											tsNs,
											variant: 'attribute',
									  })
									: subsections['misc'].push(t(tsKey))
								break
							}
						}
						default: {
							break
						}
					}
					return subsections
				}, attributeCategories)

			const getHelp = serviceHours ? availableContacts.concat(serviceHours) : availableContacts

			const clientsServed: JSX.Element[] = []

			if (community.length > 0)
				clientsServed.push(
					<SubSection title='community-focus'>
						<BadgeGroup badges={community} withSeparator={false} />
					</SubSection>
				)

			if (srvFocus.length > 0)
				clientsServed.push(<SubSection title='target-population'>{srvFocus}</SubSection>)

			const eligDisplay: JSX.Element[] = []

			if (eligibility.age) eligDisplay.push(<SubSection title='ages'>{eligibility.age}</SubSection>)

			if (eligibility.requirements.length > 0)
				eligDisplay.push(<SubSection title='requirements' li={eligibility.requirements} />)

			if (eligibility.freeText.length > 0)
				eligDisplay.push(<SubSection title='additional-info'>{eligibility.freeText}</SubSection>)

			const languages = lang.length === 0 ? undefined : <SubSection title='languages' li={lang} />

			const extraInfo: JSX.Element[] = []

			if (miscWithIcons.length > 0)
				extraInfo.push(
					<SubSection>
						<BadgeGroup badges={miscWithIcons} withSeparator={false} />
					</SubSection>
				)

			if (misc.length > 0) extraInfo.push(<SubSection title='additional-info' li={misc} />)

			return (
				<>
					<Modal title={<ServiceModalTitle />} opened={opened} onClose={() => handler.close()}>
						<Stack spacing={24}>
							{atCapacity}
							{name}
							<div>{allServices}</div>
							<SectionDivider title='get-help'>{getHelp}</SectionDivider>
							<SectionDivider title='clients-served'>{clientsServed}</SectionDivider>
							<SectionDivider title='cost'>{cost.length > 0 ? cost : undefined}</SectionDivider>
							<SectionDivider title='eligibility'>{eligDisplay}</SectionDivider>
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

type subsectionProps = {
	title?: string
	children?: JSX.Element[] | JSX.Element
	li?: string[] | string
}

type sectionProps = {
	title?: string
	children?: JSX.Element | JSX.Element[]
}

type Attributes = {
	directEmail?: string
	directPhone?: string
	directWebsite?: string
	cost: JSX.Element[]
	lang: string[]
	community: CommunityTagProps[]
	srvFocus: JSX.Element[]
	atCapacity?: JSX.Element
	eligibility: {
		age?: JSX.Element
		requirements: string[]
		freeText: JSX.Element[]
	}
	misc: string[]
	miscWithIcons: AttributeTagProps[]
}

type accessDetails = {
	phone?: JSX.Element
	email?: JSX.Element
	website?: JSX.Element
	atCapacity?: JSX.Element
	publicTransit: JSX.Element[]
}

type Language = {
	languageName: string
	nativeName: string
}

type SupplementData = {
	access_type: string
	access_value: string
}

type costDetails = {
	price?: number
	description: JSX.Element[]
}

type ModalTextprops = {
	children: JSX.Element | string
}
