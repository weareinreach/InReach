import { Title, Text, Stack, Group, Box, createStyles, useMantineTheme } from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'
import { ContextModalProps, openContextModal } from '@mantine/modals'
import { ApiOutput } from '@weareinreach/api'
import { Interval, DateTime } from 'luxon'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'

import {
	AlertMessage,
	Badge,
	BadgeGroup,
	type CommunityTagProps,
	type AttributeTagProps,
} from '~ui/components/core'
import { type IconList } from '~ui/icon'
import { trpc as api } from '~ui/lib/trpcClient'

import { ModalTitle, ModalTitleProps } from './ModalTitle'
// Ask Joe if @weareinreach/db should be added to the ui package.json
import { Prisma } from '../../db'

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

const CONTACTS = ['phone', 'email', 'website'] as const

export const ServiceModalBody = ({ innerProps }: ContextModalProps<{ serviceId: string }>) => {
	const { data, status } = api.service.byId.useQuery({ id: innerProps.serviceId })
	const { t, i18n } = useTranslation()
	const { classes } = useStyles()

	const UL = (props: { children: string[] }) => {
		const listItems = props.children.map((text) => (
			<li key={text}>
				<Text>{text}</Text>
			</li>
		))
		return <ul className={classes.ul}>{listItems}</ul>
	}

	const SubSection = ({ title, children, li }: subsectionProps) => {
		let display = children

		if (li) display = <UL>{typeof li === 'string' ? [li] : li}</UL>

		return (
			<Stack spacing={12}>
				{title && <Title order={3}>{t(`service.${title}`)}</Title>}
				<div>{display}</div>
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

		const allServices = services.map(({ tag }) => (
			<Badge key={tag.tsKey} variant='service' tsKey={tag.tsKey} />
		))

		const formatHours: JSX.Element[] = []

		const hourMap = new Map<number, Set<(typeof hours)[number]>>()

		for (const entry of hours) {
			const daySet = hourMap.get(entry.dayIndex)
			if (!daySet) {
				hourMap.set(entry.dayIndex, new Set([entry]))
			} else {
				hourMap.set(entry.dayIndex, new Set([...daySet, entry]))
			}
		}

		hourMap.forEach((value, key) => {
			const entry = [...value].map(({ start, end, dayIndex: weekday, closed }, idx) => {
				const open = DateTime.fromJSDate(start).set({ weekday })
				const close = DateTime.fromJSDate(end).set({ weekday })
				const interval = Interval.fromDateTimes(open, close)

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
			formatHours.push(
				<Text component='p' className={classes.blackText}>
					{entry.filter(Boolean).join(' & ')}
				</Text>
			)
		})

		const timeZone = <Text className={classes.timezone}>{`${DateTime.local().zoneName}`}</Text>

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
					if (data) {
						const { json } = data as Prisma.JsonObject
						const { access_type, access_value } = json as SupplementData

						if (access_type === 'publicTransit')
							details[access_type].push(
								<Text component='p' className={classes.blackText}>
									{t(text!.key)}
								</Text>
							)

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
			lang: [],
			srvFocus: [],
			eligibility: {
				requirements: [],
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
						subsections[namespace].push(
							<Text className={classes.blackText} component='p'>
								{t(tsKey)}
							</Text>
						)
						break
					}
					case 'cost': {
						// Ask Joe the suplemement's data.json format for the cost
						subsections[namespace] = tsKey
						break
					}
					case 'eligibility': {
						tsKey.includes('elig-age')
							? (subsections[namespace]['age'] = <Text>{tsKey}</Text>) //Ask Joe the key names in data.json supplement for cost prices
							: subsections[namespace]['requirements'].push(t(tsKey))
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

		if (srvFocus.length > 0) clientsServed.push(<SubSection title='target-population'>{srvFocus}</SubSection>)

		const costs: JSX.Element[] = []

		if (cost && cost.length > 0)
			costs.push(
				<SubSection>
					<Group>{cost}</Group>
				</SubSection>
			)

		const eligDisplay: JSX.Element[] = []

		if (eligibility.age) eligDisplay.push(<SubSection title='age'>{eligibility.age}</SubSection>)

		if (eligibility.requirements.length > 0)
			eligDisplay.push(<SubSection title='requirements' li={eligibility.requirements} />)

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
			<Stack spacing={24}>
				{atCapacity}
				{name}
				<div>{allServices}</div>
				<SectionDivider title='get-help'>{getHelp}</SectionDivider>
				<SectionDivider title='clients-served'>{clientsServed}</SectionDivider>
				<SectionDivider title='cost'>{costs}</SectionDivider>
				<SectionDivider title='eligibility'>{eligDisplay}</SectionDivider>
				<SectionDivider title='languages'>{languages}</SectionDivider>
				<SectionDivider title='additional-info'>{extraInfo}</SectionDivider>
				<SectionDivider title='transit-directions'></SectionDivider>
			</Stack>
		)
	}

	return <div>loading...</div>
}

const ServiceModalTitle = () => {
	const icons = ['share', 'save'] as ModalTitleProps['icons']
	const theme = useMantineTheme()
	const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`)
	const router = useRouter<'/org/[slug]' | '/org/[slug]/[orgLocationId]'>()
	const { slug, orgLocationId } = router.query
	const apiQuery = typeof orgLocationId === 'string' ? { orgLocationId } : { slug }
	const { data, status } = api.service.getParentName.useQuery(apiQuery)

	if (isMobile || status === 'loading')
		return <ModalTitle breadcrumb={{ option: 'back', backTo: 'none' }} icons={icons} />

	if (data && status === 'success')
		return (
			<ModalTitle
				breadcrumb={{ option: 'back', backTo: 'dynamicText', backToText: data.name as string }}
				icons={icons}
			/>
		)

	return (
		<ModalTitle breadcrumb={{ option: 'back', backTo: 'dynamicText', backToText: '...' }} icons={icons} />
	)
}

export const OpenServiceModal = ({ serviceId }: ServiceModalBodyProps) => {
	openContextModal({
		modal: 'service',
		title: <ServiceModalTitle />,
		innerProps: { serviceId },
	})
}
type ServiceModalBodyProps = {
	serviceId: string
}

export type ServiceModalProps = {
	title: ModalTitleProps
	body: ServiceModalBodyProps
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
	cost?: string
	lang: string[]
	community: CommunityTagProps[]
	srvFocus: JSX.Element[]
	atCapacity?: JSX.Element
	eligibility: {
		age?: JSX.Element
		requirements: string[]
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
