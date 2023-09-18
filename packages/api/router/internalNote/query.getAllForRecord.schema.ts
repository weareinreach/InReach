import { z } from 'zod'

import { prefixedId } from '~api/schemas/idPrefix'

const nonEmptyString = z
	.string()
	.transform((val) => (String(val).trim() === '' ? undefined : String(val).trim()))

export const ZGetAllForRecordSchema = z.union([
	z.object({ attributeId: prefixedId('attribute') }),
	z.object({ attributeCategoryId: prefixedId('attributeCategory') }),
	z.object({ attributeSupplementId: prefixedId('attributeSupplement') }),
	z.object({ attributeSupplementDataSchemaId: prefixedId('attributeSupplementDataSchema') }),
	z.object({ countryId: prefixedId('country') }),
	z.object({ govDistId: prefixedId('govDist') }),
	z.object({ govDistTypeId: prefixedId('govDistType') }),
	z.object({ languageId: prefixedId('language') }),
	z.object({ organizationId: prefixedId('organization') }),
	z.object({ orgEmailId: prefixedId('orgEmail') }),
	z.object({ orgHoursId: prefixedId('orgHours') }),
	z.object({ orgLocationId: prefixedId('orgLocation') }),
	z.object({ orgPhoneId: prefixedId('orgPhone') }),
	z.object({ orgPhotoId: prefixedId('orgPhoto') }),
	z.object({ orgReviewId: prefixedId('orgReview') }),
	z.object({ orgServiceId: prefixedId('orgService') }),
	z.object({ orgSocialMediaId: prefixedId('orgSocialMedia') }),
	z.object({ orgWebsiteId: prefixedId('orgWebsite') }),
	z.object({ outsideApiId: prefixedId('outsideAPI') }),
	z.object({ permissionId: prefixedId('permission') }),
	z.object({ phoneTypeId: prefixedId('phoneType') }),
	z.object({ serviceCategoryId: prefixedId('serviceCategory') }),
	z.object({ serviceTagId: prefixedId('serviceTag') }),
	z.object({ socialMediaLinkId: prefixedId('socialMediaLink') }),
	z.object({ socialMediaServiceId: prefixedId('socialMediaService') }),
	z.object({ sourceId: prefixedId('source') }),
	z.object({ suggestionId: prefixedId('suggestion') }),
	z.object({ outsideAPIServiceService: nonEmptyString }),
	z.object({ translationKey: nonEmptyString, translationNs: nonEmptyString }),
	z.object({ translationNamespaceName: nonEmptyString }),
])
export type TGetAllForRecordSchema = z.infer<typeof ZGetAllForRecordSchema>
