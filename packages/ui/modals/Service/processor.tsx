import { type TFunction } from 'next-i18next'
import { type ReactNode } from 'react'

import { attributeSupplementSchema } from '@weareinreach/db/generated/attributeSupplementSchema'
import { accessInstructions } from '@weareinreach/db/zod_util/attributeSupplement'
import { AlertMessage } from '~ui/components/core/AlertMessage'
import { Badge } from '~ui/components/core/Badge'
import { Section } from '~ui/components/core/Section'
import { type PassedDataObject } from '~ui/components/data-display/ContactInfo/types'
import { getFreeText } from '~ui/hooks/useFreeText'
import { isValidIcon } from '~ui/icon'

import { ModalText } from './ModalText'
import {
	type CostAttribOutput,
	type EligAgeAttribOutput,
	type EligOtherAttribOutput,
	processCostAttrib,
	processEligAgeAttrib,
	processEligOtherAttrib,
	processEmailAccess,
	processLinkAccess,
	processPhoneAccess,
	processPublicTransit,
	processSrvFocusAttrib,
	processTargetPopAttrib,
	type PublicTransitReturn,
	type SrvFocusAttribOutput,
	type TargetPopAttribOutput,
} from './processors'
import { type AccessDetailsAPI, type AttributesAPI, type LocationsAPI } from './types'

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
		publicTransit: [],
	}

	for (const item of accessDetails) {
		const parsed = accessInstructions.getAll().safeParse(item.data)
		if (!parsed.success) {
			break
		}
		const { access_type } = parsed.data
		switch (access_type) {
			case 'publicTransit': {
				output.publicTransit.push(processPublicTransit(item, t))
				break
			}
			case 'email': {
				const processedEmail = processEmailAccess(item)
				if (processedEmail) {
					output.getHelp.emails.push(processedEmail)
				}
				break
			}
			case 'phone': {
				const processedPhone = processPhoneAccess(item, locations)
				if (processedPhone) {
					output.getHelp.phones.push(processedPhone)
				}
				break
			}
			case 'link':
			case 'file': {
				const processedLink = processLinkAccess(item)
				if (processedLink) {
					output.getHelp.websites.push(processedLink)
				}
				break
			}
		}
	}

	return output
}

export const processAttributes = ({
	attributes,
	locale = 'en',
	t,
	isEditMode = false,
}: {
	attributes: AttributesAPI
	locale: string
	t: TFunction
	isEditMode?: boolean
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
				const srvFocusItem = processSrvFocusAttrib(attribute, t, isEditMode)
				console.log(srvFocusItem, attribute)
				if (srvFocusItem) {
					output.clientsServed.srvfocus.push(srvFocusItem)
				}
				break
			}
			/** Target Population & Eligibility Requirements */
			case 'tpop': {
				const tpopItem = processTargetPopAttrib(attribute, t)
				if (tpopItem) {
					output.clientsServed.targetPop.push(tpopItem)
				}
				break
			}

			case 'eligibility': {
				const type = tsKey.split('.').pop() as string
				switch (type) {
					case 'elig-age': {
						const eligAgeItem = processEligAgeAttrib(attribute, t)
						if (!eligAgeItem) {
							break
						}
						if (!output.eligibility.age) {
							output.eligibility.age = eligAgeItem
						}
						// TODO: Do something to ensure that only one of these attributes is set

						break
					}
					case 'other':
					case 'other-describe': {
						const eligOtherItem = processEligOtherAttrib(attribute, t)
						if (eligOtherItem) {
							output.eligibility.requirements.push(eligOtherItem)
						}
						break
					}
					default: {
						output.eligibility.requirements.push({
							id: attribute.supplementId,
							active: attribute.active,
							childProps: { children: t(attribute.tsKey, { ns: attribute.tsNs }) },
							editable: false,
						})
					}
				}

				break
			}
			case 'cost': {
				const costItem = processCostAttrib(attribute, t, locale)
				console.log(costItem, attribute)
				if (costItem) {
					output.cost.push(costItem)
				}
				break
			}

			case 'lang': {
				const { language } = attribute
				if (!language) {
					break
				}
				const { languageName } = language
				output.lang.push(languageName)
				break
			}
			case 'additional': {
				if (tsKey.includes('at-capacity')) {
					output.atCapacity = <AlertMessage textKey={'service.at-capacity'} iconKey='information' />
				} else {
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
	publicTransit: PublicTransitReturn[]
}
interface AttributesOutput {
	directEmail?: string
	directPhone?: string
	directWebsite?: string
	cost: CostAttribOutput[]
	lang: string[]
	clientsServed: {
		srvfocus: SrvFocusAttribOutput[]
		targetPop: TargetPopAttribOutput[]
	}
	atCapacity?: ReactNode
	eligibility: {
		age?: EligAgeAttribOutput
		requirements: EligOtherAttribOutput[]
		freeText: ReactNode[]
	}
	misc: string[]
	miscWithIcons: ReactNode[]
}
