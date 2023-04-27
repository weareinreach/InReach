import { createFormContext } from '@mantine/form'
import { type ApiOutput } from '@weareinreach/api'

export const [AttributeModalFormProvider, useFormContext, useForm] = createFormContext<FormData>()

export interface FormData {
	/** Data to get submitted back to API */
	selected: {
		value: string
		label: string
		icon?: string
		iconBg?: string
		variant?: ApiOutput['fieldOpt']['attributesByCategory'][0]['badgeRender']
		countryId?: string
		govDistId?: string
		languageId?: string
		text?: string
		boolean?: boolean
		data?: object
	}[]
	/** Store for when supplemental info needed */
	supplement?: {
		attributeId: string
		boolean?: boolean
		countryId?: string
		govDistId?: string
		languageId?: string
		text?: string
		data?: object
		schema?: object
	}
	/** API data (selection items) */
	categories: {
		value: string
		label: string
	}[]
	attributes: {
		value: string
		label: string
		icon?: string
		iconBg?: string
		variant?: ApiOutput['fieldOpt']['attributesByCategory'][0]['badgeRender']
		requireText?: boolean
		requireLanguage?: boolean
		requireGeo?: boolean
		requireBoolean?: boolean
		requireData?: boolean
		dataSchema?: object
	}[]
}
