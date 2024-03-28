import { type TFunction } from 'next-i18next'
import { type ReactNode } from 'react'

import { type ApiOutput } from '@weareinreach/api'
import { attributeSupplementSchema } from '@weareinreach/db/generated/attributeSupplementSchema'
import { accessInstructions } from '@weareinreach/db/zod_util/attributeSupplement'
import { AlertMessage } from '~ui/components/core/AlertMessage'
import { Badge } from '~ui/components/core/Badge'
import { Section } from '~ui/components/core/Section'
import { type PassedDataObject } from '~ui/components/data-display/ContactInfo/types'
import { getFreeText } from '~ui/hooks/useFreeText'
import { isValidIcon } from '~ui/icon'

import { ModalText } from './ModalText'

type AccessDetailsAPI =
	| ApiOutput['service']['forServiceModal']['accessDetails']
	| ApiOutput['service']['forServiceEditDrawer']['accessDetails']

type LocationsAPI =
	| ApiOutput['service']['forServiceModal']['locations']
	| ApiOutput['service']['forServiceEditDrawer']['locations']

type AttributesAPI =
	| ApiOutput['service']['forServiceModal']['attributes']
	| ApiOutput['service']['forServiceEditDrawer']['attributes']

export const processAccessInstructions = ({
	accessDetails,
	locations,
	t,
}: {
	accessDetails: AccessDetailsAPI
	locations: LocationsAPI
	t: TFunction
}): AccessInstructionsOutput => {
	const output: AccessInstructionsOutput = {
		getHelp: {
			phones: [],
			emails: [],
			websites: [],
			socialMedia: [],
		},
		publicTransit: null,
	}

	for (const item of accessDetails) {
		const { data, text, supplementId: id } = item
		const parsed = accessInstructions.getAll().safeParse(data)
		if (parsed.success) {
			const { access_type, access_value } = parsed.data
			switch (access_type) {
				case 'publicTransit': {
					if (!text) break
					const { key, options } = getFreeText(text)
					output.publicTransit = <ModalText key={id}>{t(key, options)}</ModalText>
					break
				}
				case 'email': {
					if (access_value)
						output.getHelp.emails.push({
							id,
							title: null,
							description: null,
							email: access_value,
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
					const country = locations.find(({ location }) => Boolean(location.country))?.location?.country?.cca2
					if (!country) break
					if (access_value)
						output.getHelp.phones.push({
							id,
							number: access_value,
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
					if (access_value)
						output.getHelp.websites.push({
							id,
							description: null,
							isPrimary: false,
							// orgLocationId: null,
							orgLocationOnly: false,
							url: access_value,
						})
				}
			}
		}
	}

	return output
}

export const processAttributes = ({
	attributes,
	locale = 'en',
	t,
}: {
	attributes: AttributesAPI
	locale: string
	t: TFunction
}): AttributesOutput => {
	const output: AttributesOutput = {
		clientsServed: {
			srvfocus: [],
			targetPop: [],
		},
		cost: [],
		eligibility: {
			requirements: [],
			freeText: [],
		},
		lang: [],
		misc: [],
		miscWithIcons: [],
	}
	for (const attribute of attributes) {
		const { tsKey, icon, tsNs, supplementId: id } = attribute
		const namespace = tsKey.split('.').shift() as string

		switch (namespace) {
			/** Clients served */
			case 'srvfocus': {
				if (typeof icon === 'string' && attribute._count.parents === 0) {
					output.clientsServed.srvfocus.push(
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
						const { data } = attribute
						const parsed = attributeSupplementSchema.numMinMaxOrRange.safeParse(data)
						if (!parsed.success) break
						const { min, max } = parsed.data
						const context = min && max ? 'range' : min ? 'min' : 'max'
						output.eligibility.age = (
							<ModalText key={id}>{t('service.elig-age', { ns: 'common', context, min, max })}</ModalText>
						)
						break
					}
					case 'other-describe': {
						const { text } = attribute
						if (!text) break
						const { key, options } = getFreeText(text)
						output.clientsServed.targetPop.push(<ModalText key={id}>{t(key, options)}</ModalText>)

						break
					}
				}

				break
			}
			case 'cost': {
				if (!isValidIcon(icon)) break
				const costDetails: {
					price?: number | string
					description: ReactNode[]
				} = { description: [] }

				const { text, data } = attribute
				if (text) {
					const { key, options } = getFreeText(text)
					costDetails.description.push(<ModalText key={id}>{t(key, options)}</ModalText>)
				}
				const parsed = attributeSupplementSchema.currency.safeParse(data)
				if (parsed.success) {
					const { cost, currency } = parsed.data
					costDetails.price = new Intl.NumberFormat(locale, {
						style: 'currency',
						currency: currency ?? undefined,
					}).format(cost)
				}

				const { price, description } = costDetails
				output.cost.push(
					<Badge.Attribute key={id} icon={icon} style={{ justifyContent: 'start' }}>
						{t(tsKey, { price, ns: tsNs })}
					</Badge.Attribute>
				)

				if (description.length > 0)
					output.cost.push(
						<Section.Sub key={id} title={t('service.cost-details')}>
							{description}
						</Section.Sub>
					)
				break
			}

			case 'lang': {
				const { language } = attribute
				if (!language) break
				const { languageName } = language
				output.lang.push(languageName)
				break
			}
			case 'additional': {
				if (tsKey.includes('at-capacity'))
					output.atCapacity = <AlertMessage textKey={'service.at-capacity'} iconKey='information' />
				else {
					isValidIcon(icon)
						? output.miscWithIcons.push(
								<Badge.Attribute key={id} icon={icon}>
									{t(tsKey, { ns: tsNs })}
								</Badge.Attribute>
							)
						: output.misc.push(t(tsKey, { ns: tsNs }))
				}
				break
			}
			default: {
				break
			}
		}
	}
	return output
}
interface AccessInstructionsOutput {
	getHelp: PassedDataObject
	publicTransit: ReactNode
}
interface AttributesOutput {
	directEmail?: string
	directPhone?: string
	directWebsite?: string
	cost: ReactNode[]
	lang: string[]
	clientsServed: {
		srvfocus: ReactNode[]
		targetPop: ReactNode[]
	}
	atCapacity?: ReactNode
	eligibility: {
		age?: ReactNode
		requirements: string[]
		freeText: ReactNode[]
	}
	misc: string[]
	miscWithIcons: ReactNode[]
}
