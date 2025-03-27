import { type TFunction } from 'next-i18next'

import { accessInstructions } from '@weareinreach/db/zod_util/attributeSupplement'
import { type PassedDataObject } from '~ui/components/data-display/ContactInfo/types'

import {
	type AdditionalAttribOutput,
	type CostAttribOutput,
	type EligAgeAttribOutput,
	type EligOtherAttribOutput,
	type LangAttribOutput,
	processAdditionalAttrib,
	processCostAttrib,
	processEligAgeAttrib,
	processEligOtherAttrib,
	processEmailAccess,
	processLangAttrib,
	processLinkAccess,
	processPhoneAccess,
	processPublicTransit,
	processSrvFocusAttrib,
	processTargetPopAttrib,
	type PublicTransitOutput,
	type SrvFocusAttribOutput,
	type TargetPopAttribOutput,
} from './processors'
import { type AccessDetailsAPI, type AttributesAPI, type LocationsAPI } from './types'

export const processAccessInstructions = ({
	accessDetails,
	locations,
	t,
	locale = 'en',
}: {
	accessDetails: AccessDetailsAPI
	locations: LocationsAPI
	t: TFunction
	locale: string
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
			continue
		}
		const { access_type } = parsed.data
		switch (access_type) {
			case 'publicTransit': {
				const publicTransitItem = processPublicTransit(item, t, locale)
				if (publicTransitItem) {
					output.publicTransit.push(publicTransitItem)
				}
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
		atCapacity: false,
		eligibility: {
			requirements: [],
		},
		lang: [],
		misc: [],
		miscWithIcons: [],
	}
	for (const attribute of attributes) {
		const namespace = attribute.tsKey.split('.').shift() as string

		switch (namespace) {
			/** Clients served */
			case 'srvfocus': {
				const srvFocusItem = processSrvFocusAttrib(attribute, t, locale, isEditMode)
				if (srvFocusItem) {
					output.clientsServed.srvfocus.push(srvFocusItem)
				}
				break
			}
			/** Target Population & Eligibility Requirements */
			case 'tpop': {
				const tpopItem = processTargetPopAttrib(attribute, t, locale)
				if (tpopItem) {
					output.clientsServed.targetPop.push(tpopItem)
				}
				break
			}

			case 'eligibility': {
				const type = attribute.tsKey.split('.').pop() as string
				switch (type) {
					case 'elig-age': {
						const eligAgeItem = processEligAgeAttrib(attribute, t, locale)

						if (eligAgeItem && !output.eligibility.age) {
							output.eligibility.age = eligAgeItem
						}

						// TODO: Do something to ensure that only one of these attributes is set

						break
					}
					case 'other':
					case 'other-describe': {
						const eligOtherItem = processEligOtherAttrib(attribute, t, locale)
						if (eligOtherItem) {
							output.eligibility.requirements.push(eligOtherItem)
						}
						break
					}
					default: {
						output.eligibility.requirements.push({
							id: attribute.supplementId,
							active: attribute.active,
							childProps: { children: t(attribute.tsKey, { ns: attribute.tsNs, lng: locale }) },
							editable: false,
						})
					}
				}

				break
			}
			case 'cost': {
				const costItem = processCostAttrib(attribute, t, locale)
				if (costItem) {
					output.cost.push(costItem)
				}
				break
			}

			case 'lang': {
				const langItem = processLangAttrib(attribute, t, locale)
				if (langItem) {
					output.lang.push(langItem)
				}
				break
			}
			case 'additional': {
				const additionalItem = processAdditionalAttrib(attribute, t, locale, isEditMode)
				if (additionalItem?.badgeProps) {
					output.miscWithIcons.push(additionalItem)
				}
				if (additionalItem?.detailProps) {
					output.misc.push(additionalItem)
				}
				if (additionalItem?.atCapacity) {
					output.atCapacity = additionalItem?.atCapacity
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
	publicTransit: PublicTransitOutput[]
}
interface AttributesOutput {
	directEmail?: string
	directPhone?: string
	directWebsite?: string
	cost: CostAttribOutput[]
	lang: LangAttribOutput[]
	clientsServed: {
		srvfocus: SrvFocusAttribOutput[]
		targetPop: TargetPopAttribOutput[]
	}
	atCapacity: boolean
	eligibility: {
		age?: EligAgeAttribOutput
		requirements: EligOtherAttribOutput[]
	}
	misc: AdditionalAttribOutput[]
	miscWithIcons: AdditionalAttribOutput[]
}
