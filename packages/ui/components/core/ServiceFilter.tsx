import { Accordion, Checkbox, createStyles, Group, Text, useMantineTheme } from '@mantine/core'
import { useListState } from '@mantine/hooks'
import { id } from '@weareinreach/api/schemas/common'
import { useTranslation } from 'next-i18next'
import { useState } from 'react'
import { array } from 'zod'

import { Icon } from '../../icon'

const useStyles = createStyles((theme) => ({
	count: {
		backgroundColor: theme.other.colors.secondary.black,
		color: theme.other.colors.secondary.white,
		marginLeft: '8px',
		padding: '2px 7px',
		width: '24px',
		height: '24px',
		borderRadius: '100px',
	},
	group: {
		justifyContent: 'space-between',
		borderBottom: 'solid 1px black',
		padding: '25px 32px',
		width: '600px',
	},
	item: {
		width: '600px',
	},
}))

const initialValues = [
	{
		id: 'cle6jfyhu0006ag9kf8ibft65',
		tsKey: 'abortion-care',
		tsNs: 'services',
		checked: false,
		services: [
			{
				id: 'cle6jfyq800dp9kag3isplyq5',
				tsKey: 'abortion-careabortion-providers',
				tsNs: 'services',
				checked: false,
			},
			{
				id: 'cle6jfyq800dq9kagg0rwwb5y',
				tsKey: 'abortion-carefinancial-assistance',
				tsNs: 'services',
				checked: false,
			},
			{
				id: 'cle6jfyq800dr9kagitvx69cq',
				tsKey: 'abortion-carelodging-assistance',
				tsNs: 'services',
				checked: false,
			},
			{
				id: 'cle6jfyq800ds9kagl89381u3',
				tsKey: 'abortion-caremail-order-services',
				tsNs: 'services',
				checked: false,
			},
			{
				id: 'cle6jfyq800dt9kaghmf06y1h',
				tsKey: 'abortion-caremental-health-support',
				tsNs: 'services',
				checked: false,
			},
			{
				id: 'cle6jfyq800du9kags5p2l0ql',
				tsKey: 'abortion-caretravel-assistance',
				tsNs: 'services',
				checked: false,
			},
		],
	},
	{
		id: 'cle6jfyig0007ag9khqr98tgc',
		tsKey: 'community-support',
		tsNs: 'services',
		checked: false,
		services: [
			{
				id: 'cle6jfyq800dv9kagrbf6kpkj',
				tsKey: 'community-supportcultural-centers',
				tsNs: 'services',
				checked: false,
			},
			{
				id: 'cle6jfyq800dw9kag6j07imrs',
				tsKey: 'community-supportlgbtq-centers',
				tsNs: 'services',
				checked: false,
			},
			{
				id: 'cle6jfyq800dx9kagfvxr0pxp',
				tsKey: 'community-supportreception-services',
				tsNs: 'services',
				checked: false,
			},
			{
				id: 'cle6jfyq800dy9kag260ai4tr',
				tsKey: 'community-supportsponsors',
				tsNs: 'services',
				checked: false,
			},
			{
				id: 'cle6jfyq800dz9kag44iv15t5',
				tsKey: 'community-supportspiritual-support',
				tsNs: 'services',
				checked: false,
			},
		],
	},
]

export const ServiceFilter = ({}: Props) => {
	const { classes } = useStyles()
	const theme = useMantineTheme()
	const { t } = useTranslation('services')
	const [opened, setOpened] = useState(false)

	const [values, setValues] = useState(servicesList)

	function updateServiceTag(serviceIndex: number, serviceTagIndex: number, event: boolean) {
		let newVals = [...values]
		newVals[serviceIndex]!.services[serviceTagIndex] = {
			...newVals[serviceIndex]?.services[serviceTagIndex],
			checked: event,
		}
		setValues(newVals)
	}

	function updateService(serviceIndex: number) {
		let checkedValue = !allChecked(serviceIndex)
		let newVals = [...values]
		let newServiceTags = newVals[serviceIndex]!.services
		newServiceTags = serviceTags(newServiceTags, checkedValue)
		newVals[serviceIndex]!.services = newServiceTags
		setValues(newVals)
	}

	function allChecked(serviceIndex: number) {
		return values[serviceIndex]?.services.every((service: any) => service.checked)
	}

	function indeterminate(serviceIndex: number) {
		return values[serviceIndex]?.services.some((service: any) => service.checked) && !allChecked(serviceIndex)
	}

	const selectedItems = 2
	const selectedCountIcon = <Text className={classes.count}>{selectedItems}</Text>

	const items = (sIndex: any, serviceTags: any) =>
		serviceTags.map((tag: any, stIndex: any) => (
			<Checkbox
				mt='xs'
				ml={33}
				label={t(tag.tsKey)}
				key={tag.id}
				checked={tag.checked}
				onChange={(event) => {
					updateServiceTag(sIndex, stIndex, event.currentTarget.checked)
				}}
			/>
		))

	const services = values.map((service, index) => (
		<Accordion.Item value={service.id} key={service.id}>
			<Accordion.Control>{t(service.tsKey)}</Accordion.Control>
			<Accordion.Panel>
				<Checkbox
					checked={allChecked(index)}
					indeterminate={indeterminate(index)}
					label={t(service.tsKey)}
					transitionDuration={0}
					onChange={() => {
						updateService(index)
					}}
				/>
				{items(index, service.services)}
			</Accordion.Panel>
		</Accordion.Item>
	))

	return (
		<>
			<Accordion
				chevron={<Icon icon='carbon:chevron-right' />}
				styles={{ chevron: { '&[data-rotate]': { transform: 'rotate(90deg)' } } }}
				transitionDuration={0}
				classNames={classes}
			>
				<Group className={classes.group}>
					<Text>Services {selectedCountIcon}</Text>
					<a>Uncheck all</a>
				</Group>
				{services}
			</Accordion>
		</>
	)
}

type Props = {}

const mockServiceData = [
	{
		id: 'cle6jfyhu0006ag9kf8ibft65',
		tsKey: 'abortion-care',
		tsNs: 'services',
		services: [
			{
				id: 'cle6jfyq800dp9kag3isplyq5',
				tsKey: 'abortion-careabortion-providers',
				tsNs: 'services',
			},
			{
				id: 'cle6jfyq800dq9kagg0rwwb5y',
				tsKey: 'abortion-carefinancial-assistance',
				tsNs: 'services',
			},
			{
				id: 'cle6jfyq800dr9kagitvx69cq',
				tsKey: 'abortion-carelodging-assistance',
				tsNs: 'services',
			},
			{
				id: 'cle6jfyq800ds9kagl89381u3',
				tsKey: 'abortion-caremail-order-services',
				tsNs: 'services',
			},
			{
				id: 'cle6jfyq800dt9kaghmf06y1h',
				tsKey: 'abortion-caremental-health-support',
				tsNs: 'services',
			},
			{
				id: 'cle6jfyq800du9kags5p2l0ql',
				tsKey: 'abortion-caretravel-assistance',
				tsNs: 'services',
			},
		],
	},
	{
		id: 'cle6jfyig0007ag9khqr98tgc',
		tsKey: 'community-support',
		tsNs: 'services',
		services: [
			{
				id: 'cle6jfyq800dv9kagrbf6kpkj',
				tsKey: 'community-supportcultural-centers',
				tsNs: 'services',
			},
			{
				id: 'cle6jfyq800dw9kag6j07imrs',
				tsKey: 'community-supportlgbtq-centers',
				tsNs: 'services',
			},
			{
				id: 'cle6jfyq800dx9kagfvxr0pxp',
				tsKey: 'community-supportreception-services',
				tsNs: 'services',
			},
			{
				id: 'cle6jfyq800dy9kag260ai4tr',
				tsKey: 'community-supportsponsors',
				tsNs: 'services',
			},
			{
				id: 'cle6jfyq800dz9kag44iv15t5',
				tsKey: 'community-supportspiritual-support',
				tsNs: 'services',
			},
		],
	},
	{
		id: 'cle6jfyix0008ag9k3bb423mf',
		tsKey: 'computers-and-internet',
		tsNs: 'services',
		services: [
			{
				id: 'cle6jfyq800e09kag8ua4hm9g',
				tsKey: 'computers-and-internetcomputers-and-internet',
				tsNs: 'services',
			},
		],
	},
	{
		id: 'cle6jfyj30009ag9k5zhv38bp',
		tsKey: 'education-and-employment',
		tsNs: 'services',
		services: [
			{
				id: 'cle6jfyq800e19kagxz7efl3l',
				tsKey: 'education-and-employmentcareer-counseling',
				tsNs: 'services',
			},
			{
				id: 'cle6jfyq800e29kaglhsrta74',
				tsKey: 'education-and-employmenteducational-support-for-lgbtq-youth',
				tsNs: 'services',
			},
			{
				id: 'cle6jfyq800e39kagcxgrcvmc',
				tsKey: 'education-and-employmentenglish-classes',
				tsNs: 'services',
			},
			{
				id: 'cle6jfyq800e49kagxsl8j3l8',
				tsKey: 'education-and-employmentlanguage-classes',
				tsNs: 'services',
			},
			{
				id: 'cle6jfyq800e59kagsinsr1jl',
				tsKey: 'education-and-employmentleadership-training-and-professional-development',
				tsNs: 'services',
			},
			{
				id: 'cle6jfyq800e69kagau551v3b',
				tsKey: 'education-and-employmentlibraries',
				tsNs: 'services',
			},
			{
				id: 'cle6jfyq800e79kagiul8i8en',
				tsKey: 'education-and-employmentscholarships',
				tsNs: 'services',
			},
		],
	},
	{
		id: 'cle6jfyjr000aag9k4xdv01gd',
		tsKey: 'food',
		tsNs: 'services',
		services: [
			{
				id: 'cle6jfyq800e89kag98ulih0e',
				tsKey: 'foodfood',
				tsNs: 'services',
			},
			{
				id: 'cle6jfyq800e99kag3mlkt8u5',
				tsKey: 'foodfood-assistance',
				tsNs: 'services',
			},
		],
	},
	{
		id: 'cle6jfyjy000bag9k6h6c9cm4',
		tsKey: 'housing',
		tsNs: 'services',
		services: [
			{
				id: 'cle6jfyq800ea9kagtntejk61',
				tsKey: 'housingdrop-in-centers-for-lgbtq-youth',
				tsNs: 'services',
			},
			{
				id: 'cle6jfyq800eb9kag0zaqyh8n',
				tsKey: 'housingemergency-housing',
				tsNs: 'services',
			},
			{
				id: 'cle6jfyq800ec9kag9mj1t9yw',
				tsKey: 'housinghousing-information-and-referrals',
				tsNs: 'services',
			},
			{
				id: 'cle6jfyq800ed9kagif9371lk',
				tsKey: 'housingshort-term-housing',
				tsNs: 'services',
			},
			{
				id: 'cle6jfyq800ee9kag02vd6sue',
				tsKey: 'housingtrans-housing',
				tsNs: 'services',
			},
		],
	},
	{
		id: 'cle6jfykf000cag9k0xpm22x6',
		tsKey: 'hygiene-and-clothing',
		tsNs: 'services',
		services: [
			{
				id: 'cle6jfyq800ef9kags7o6spnj',
				tsKey: 'hygiene-and-clothingclothes',
				tsNs: 'services',
			},
			{
				id: 'cle6jfyq800eg9kagkmc0yj80',
				tsKey: 'hygiene-and-clothinggender-affirming-items',
				tsNs: 'services',
			},
			{
				id: 'cle6jfyq800eh9kagqdns9n1y',
				tsKey: 'hygiene-and-clothinggender-neutral-bathrooms',
				tsNs: 'services',
			},
			{
				id: 'cle6jfyq800ei9kag2s30qx9h',
				tsKey: 'hygiene-and-clothinghaircuts-and-stylists',
				tsNs: 'services',
			},
			{
				id: 'cle6jfyq800ej9kag19mj15cw',
				tsKey: 'hygiene-and-clothinghygiene',
				tsNs: 'services',
			},
		],
	},
	{
		id: 'cle6jfykw000dag9kak8b3176',
		tsKey: 'legal',
		tsNs: 'services',
		services: [
			{
				id: 'cle6jfyq800ek9kageafmh341',
				tsKey: 'legalasylum-application',
				tsNs: 'services',
			},
			{
				id: 'cle6jfyq800el9kagzrx0n44b',
				tsKey: 'legalcitizenship',
				tsNs: 'services',
			},
			{
				id: 'cle6jfyq800em9kaggbvh66as',
				tsKey: 'legalcrime-and-discrimination',
				tsNs: 'services',
			},
			{
				id: 'cle6jfyq800en9kag5prcync0',
				tsKey: 'legaldeferred-action-for-childhood-arrivals-daca',
				tsNs: 'services',
			},
			{
				id: 'cle6jfyq800eo9kag9to6fa0o',
				tsKey: 'legaldeportation-or-removal',
				tsNs: 'services',
			},
			{
				id: 'cle6jfyq800ep9kagad9x8jpz',
				tsKey: 'legalemployment-authorization',
				tsNs: 'services',
			},
			{
				id: 'cle6jfyq800eq9kagnwzklvc5',
				tsKey: 'legalfamily-petitions',
				tsNs: 'services',
			},
			{
				id: 'cle6jfyq800er9kag5hmjdnk8',
				tsKey: 'legalimmigration-detention',
				tsNs: 'services',
			},
			{
				id: 'cle6jfyq800es9kagi8d14cys',
				tsKey: 'legallegal-advice',
				tsNs: 'services',
			},
			{
				id: 'cle6jfyq800et9kagdb7eo56s',
				tsKey: 'legallegal-hotlines',
				tsNs: 'services',
			},
			{
				id: 'cle6jfyq800eu9kagr3y77o3v',
				tsKey: 'legalname-and-gender-change',
				tsNs: 'services',
			},
			{
				id: 'cle6jfyq800ev9kagvew4a9kb',
				tsKey: 'legalrefugee-claim',
				tsNs: 'services',
			},
			{
				id: 'cle6jfyq800ew9kag7w391o3p',
				tsKey: 'legalresidency',
				tsNs: 'services',
			},
			{
				id: 'cle6jfyq800ex9kag6qiyiv0f',
				tsKey: 'legalspecial-immigrant-juvenile-status-sijs',
				tsNs: 'services',
			},
			{
				id: 'cle6jfyq800ey9kag095k2r1i',
				tsKey: 'legalt-visa',
				tsNs: 'services',
			},
			{
				id: 'cle6jfyq800ez9kageqihlznm',
				tsKey: 'legalu-visa',
				tsNs: 'services',
			},
		],
	},
	{
		id: 'cle6jfym7000eag9k11npc5yb',
		tsKey: 'medical',
		tsNs: 'services',
		services: [
			{
				id: 'cle6jfyq800f09kag3brpub44',
				tsKey: 'medicalcovid-19-services',
				tsNs: 'services',
			},
			{
				id: 'cle6jfyq800f19kaggsw2a425',
				tsKey: 'medicaldental-care',
				tsNs: 'services',
			},
			{
				id: 'cle6jfyq800f29kagjx3zcp3m',
				tsKey: 'medicalhiv-and-sexual-health',
				tsNs: 'services',
			},
			{
				id: 'cle6jfyq800f39kagqj3md6li',
				tsKey: 'medicalmedical-clinics',
				tsNs: 'services',
			},
			{
				id: 'cle6jfyq800f49kagg7qyybzd',
				tsKey: 'medicalobgyn-services',
				tsNs: 'services',
			},
			{
				id: 'cle6jfyq800f59kagvlqkyu04',
				tsKey: 'medicalphysical-evaluations-for-asylum-claim',
				tsNs: 'services',
			},
			{
				id: 'cle6jfyq800f69kag9bq2a53e',
				tsKey: 'medicalphysical-evaluations-for-refugee-claim',
				tsNs: 'services',
			},
			{
				id: 'cle6jfyq900f79kagl8ljqa0n',
				tsKey: 'medicaltrans-health',
				tsNs: 'services',
			},
			{
				id: 'cle6jfyq900f89kagleage15m',
				tsKey: 'medicaltrans-health-gender-affirming-surgery',
				tsNs: 'services',
			},
			{
				id: 'cle6jfyq900f99kagwrqeyeme',
				tsKey: 'medicaltrans-health-hormone-and-surgery-letters',
				tsNs: 'services',
			},
			{
				id: 'cle6jfyq900fa9kagmkl6fwxl',
				tsKey: 'medicaltrans-health-hormone-therapy',
				tsNs: 'services',
			},
			{
				id: 'cle6jfyq900fb9kagr4w5s572',
				tsKey: 'medicaltrans-health-primary-care',
				tsNs: 'services',
			},
			{
				id: 'cle6jfyq900fc9kagkqwk5qfc',
				tsKey: 'medicaltrans-health-speech-therapy',
				tsNs: 'services',
			},
		],
	},
	{
		id: 'cle6jfynd000fag9k3yku4md8',
		tsKey: 'mental-health',
		tsNs: 'services',
		services: [
			{
				id: 'cle6jfyq900fd9kagqw49kxc2',
				tsKey: 'mental-healthbipoc-support-groups',
				tsNs: 'services',
			},
			{
				id: 'cle6jfyq900fe9kagp3msnwpa',
				tsKey: 'mental-healthhotlines',
				tsNs: 'services',
			},
			{
				id: 'cle6jfyq900ff9kagmyit2tlm',
				tsKey: 'mental-healthprivate-therapy-and-counseling',
				tsNs: 'services',
			},
			{
				id: 'cle6jfyq900fg9kagigqfje3c',
				tsKey: 'mental-healthpsychological-evaluations-for-asylum-claim',
				tsNs: 'services',
			},
			{
				id: 'cle6jfyq900fh9kaga1zbmlef',
				tsKey: 'mental-healthpsychological-evaluations-for-refugee-claim',
				tsNs: 'services',
			},
			{
				id: 'cle6jfyq900fi9kag4qlofuh2',
				tsKey: 'mental-healthsubstance-use',
				tsNs: 'services',
			},
			{
				id: 'cle6jfyq900fj9kagup9xgf4y',
				tsKey: 'mental-healthsupport-for-caregivers-of-trans-youth',
				tsNs: 'services',
			},
			{
				id: 'cle6jfyq900fk9kag8qhloboo',
				tsKey: 'mental-healthsupport-for-conversion-therapy-survivors',
				tsNs: 'services',
			},
			{
				id: 'cle6jfyq900fl9kagsvhx5x9i',
				tsKey: 'mental-healthsupport-groups',
				tsNs: 'services',
			},
			{
				id: 'cle6jfyq900fm9kagbvlxmptr',
				tsKey: 'mental-healthtrans-support-groups',
				tsNs: 'services',
			},
		],
	},
	{
		id: 'cle6jfyog000gag9kb0y63gu3',
		tsKey: 'sports-and-entertainment',
		tsNs: 'services',
		services: [],
	},
	{
		id: 'cle6jfyok000hag9k5j3h9zgp',
		tsKey: 'translation-and-interpretation',
		tsNs: 'services',
		services: [
			{
				id: 'cle6jfyq900fn9kagcsoo5hrr',
				tsKey: 'translation-and-interpretationgeneral-translation-and-interpretation',
				tsNs: 'services',
			},
			{
				id: 'cle6jfyq900fo9kag47qpruqu',
				tsKey: 'translation-and-interpretationfor-healthcare',
				tsNs: 'services',
			},
			{
				id: 'cle6jfyq900fp9kagfqjzc8yw',
				tsKey: 'translation-and-interpretationfor-legal-services',
				tsNs: 'services',
			},
		],
	},
	{
		id: 'cle6jfyoz000iag9k6p1j97d5',
		tsKey: 'transportation',
		tsNs: 'services',
		services: [
			{
				id: 'cle6jfyq900fq9kagtpk9g3is',
				tsKey: 'transportationtransit-passes-and-discounts',
				tsNs: 'services',
			},
			{
				id: 'cle6jfyq900fr9kagsislpx89',
				tsKey: 'transportationtransportation-assistance',
				tsNs: 'services',
			},
		],
	},
	{
		id: 'cle6jfyp9000jag9k40iy0w4e',
		tsKey: 'mail',
		tsNs: 'services',
		services: [
			{
				id: 'cle6jfyq900fs9kagmic2gf50',
				tsKey: 'mailmail',
				tsNs: 'services',
			},
		],
	},
]

const servicesList = mockServiceData.map((service) => ({
	...service,
	checked: false,
	services: serviceTags(service.services, false),
}))

function serviceTags(serviceTagArray: any, eventTarget?: boolean) {
	return serviceTagArray.map((serviceTag: any) => ({
		...serviceTag,
		checked: eventTarget ? eventTarget : false,
	}))
}
