import { Title, Text, Stack, Group, Box, createStyles } from '@mantine/core'
import { ModalSettings } from '@mantine/modals/lib/context'
import { ApiOutput } from '@weareinreach/api'
import { useRouter } from 'next/router'
import { useTranslation } from 'react-i18next'

import { Badge, BadgeGroup, type CommunityTagProps } from '~ui/components/core'
import { Icon } from '~ui/icon'
import { trpc as api } from '~ui/lib/trpcClient'

import { ModalTitle, ModalTitleProps } from './ModalTitle'

const useStyles = createStyles((theme) => ({
	modalBody: {
		paddingTop: '40px',
	},
	sectionDivider: {
		backgroundColor: theme.other.colors.primary.lightGray,
		padding: 12,
	},
	ul: {
		margin: 0,
	},
}))

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

const getHoursAndMinutes = (date: Date) => `${date.getHours()}:${date.getMinutes()}`

export const ServiceModalBody = ({ serviceId }: ServiceModalBodyProps) => {
	const { data, status } = api.service.byId.useQuery({ id: serviceId })
	const { t } = useTranslation()
	const { classes } = useStyles()
	const router = useRouter<'/org/[slug]' | '/org/[slug]/[orgLocationId]'>()
	const { slug, orgLocationId } = router.query
	const apiQuery = typeof orgLocationId === 'string' ? { orgLocationId } : { slug }
	const { data: parent } = api.service.getParentName.useQuery(apiQuery)

	const SectionDivider = ({ title, children }: sectionDividerProps) => (
		<Stack>
			<Box className={classes.sectionDivider}>
				<Title order={3} fw={600}>
					{t(`service-${title}`)}
				</Title>
			</Box>
			{children}
		</Stack>
	)

	const Subsection = ({ title, children }: subsectionProps) => (
		<Stack>
			{title && <Title order={3}>{t(`service-${title}`)}</Title>}
			<div>{children}</div>
		</Stack>
	)

	const UL = (props: { children: string[] }) => {
		const listItems = props.children.map((text) => (
			<li key={text}>
				<Text>{text}</Text>
			</li>
		))
		return <ul className={classes.ul}>{listItems}</ul>
	}

	if (data && status === 'success') {
		const { services, phones, emails, hours, accessDetails, attributes } = data

		const allServices = services.map(({ tag }) => (
			<Badge key={tag.tsKey} variant='service' tsKey={tag.tsKey} />
		))

		const directPhones = phones.map(({ phone }) => phone.number).join(' / ')

		const directEmail = emails.find(({ email }) => {
			email.primary
		})

		// const directWebsite = missing data for website

		const serviceHours = hours.map(({ start, end, dayIndex }, i) => {
			const formatStart = getHoursAndMinutes(start)
			const formatEnd = getHoursAndMinutes(end)
			const formatTime = `${WEEKDAYS[dayIndex]} ${formatStart}-${formatEnd}`
			return <Text key={i}>{formatTime}</Text>
		})

		const attributeCategories: Attributes = {
			community: [],
			languages: [],
			cost: '',
			srvFocus: [],
			eligibility: {
				requirements: [],
			},
			misc: [],
		}

		const { community, languages, cost, srvFocus, eligibility, misc } = attributes.reduce(
			(subsections, { attribute, supplement }) => {
				const { tsKey, categories } = attribute
				const { category } = categories.at(0)!
				const { tag } = category

				switch (tag) {
					case 'languages': {
						supplement.forEach(({ language }) => {
							const { nativeName, languageName } = language as Language
							subsections[tag].push(languageName)
						})
						break
					}
					case 'community': {
						subsections[tag].push({ tsKey, icon: 'a', variant: tag })
						break
					}
					case 'cost': {
						subsections[tag] = tsKey
						break
					}
					case 'srvFocus': {
						subsections[tag].push(t(tsKey))
						break
					}
					case 'eligibility': {
						tsKey === 'elig-age'
							? (subsections[tag]['age'] = tsKey)
							: subsections[tag]['requirements'].push(t(tsKey))
						break
					}
					case 'misc': {
						subsections[tag].push(t(tsKey))
						break
					}
				}
				return subsections
			},
			attributeCategories
		)

		return (
			<Stack spacing={24} className={classes.modalBody}>
				<div>{allServices}</div>
				<SectionDivider title='get-help'>
					<Subsection title={`direct-phone${directPhones.length > 1 ? 's' : ''}`}>
						<Text>{directPhones}</Text>
					</Subsection>
					<Subsection title='direct-email'>
						<Text>{directEmail ? directEmail.email.email : 'not available'}</Text>
					</Subsection>
					<Subsection title='direct-website'>
						<Text>{/* todo: get data for website */}</Text>
					</Subsection>
					<Subsection title='hours'>
						<>
							<Text>{t('service-default-timezone')}</Text>
							{serviceHours}
						</>
					</Subsection>
				</SectionDivider>
				<SectionDivider title='clients-served'>
					<Subsection title='community-focus'>
						<BadgeGroup badges={community} withSeparator={false} />
					</Subsection>
					<Subsection title='target-population'>
						<UL>{srvFocus}</UL>
					</Subsection>
				</SectionDivider>
				<SectionDivider title='cost'>
					<Subsection>
						<Group spacing='sm'>
							<Icon icon='carbon:piggy-bank' />
							<Text>{cost.length > 0 || 'N/A'}</Text>
						</Group>
					</Subsection>
					{/* todo: ask where to look for cost details data */}
				</SectionDivider>
				<SectionDivider title='elegibility-requirements'>
					<Subsection title='eligible-age'>
						<Text>{eligibility.age ? `${eligibility.age} and older` : 'not applicable'}</Text>
					</Subsection>
					<Subsection title='requirements'>
						<UL>{eligibility.requirements}</UL>
					</Subsection>
				</SectionDivider>
				<SectionDivider title='languages'>
					<Subsection title='languages'>
						<UL>{languages}</UL>
					</Subsection>
				</SectionDivider>
				<SectionDivider title='additional-information'>
					<Subsection title='Additional information'>
						<UL>{misc}</UL>
					</Subsection>
				</SectionDivider>
			</Stack>
		)
	}

	return <div>loading...</div>
}

export const ServiceModal = (props: ServiceModalProps) =>
	({
		title: <ModalTitle {...props.title} />,
		children: <ServiceModalBody {...props.body} />,
	} satisfies ModalSettings)

type ServiceModalBodyProps = {
	serviceId: string
}

export type ServiceModalProps = {
	title: ModalTitleProps
	body: ServiceModalBodyProps
}

type subsectionProps = {
	title?: string
	children: JSX.Element[] | JSX.Element
}

type sectionDividerProps = {
	title: string
	children: JSX.Element | JSX.Element[]
}

type Attributes = {
	cost: string
	languages: string[]
	community: CommunityTagProps[]
	srvFocus: string[]
	eligibility: {
		age?: string
		requirements: string[]
	}
	misc: string[]
}

type Language = {
	languageName: string
	nativeName: string
}
