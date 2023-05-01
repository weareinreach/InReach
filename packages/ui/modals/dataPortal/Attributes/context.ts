import { createFormContext } from '@mantine/form'
import { type ApiOutput } from '@weareinreach/api'

export const [AttributeModalFormProvider, useFormContext, useForm] = createFormContext<FormData>()

export interface FormData {
	/** Data to get submitted back to API */
	selected: {
		value: string
		label: string
		tKey: string
		interpolationValues?: ApiOutput['fieldOpt']['attributesByCategory'][0]['interpolationValues']
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
		subDistId?: string
		languageId?: string
		text?: string
		data?: object
		schemaName?: ApiOutput['fieldOpt']['attributesByCategory'][0]['dataSchemaName']
		schema?: ApiOutput['fieldOpt']['attributesByCategory'][0]['dataSchema']
	}
	/** API data (selection items) */
	categories: {
		value: string
		label: string
	}[]
	attributes: {
		value: string
		label: string
		tKey: string
		interpolationValues?: ApiOutput['fieldOpt']['attributesByCategory'][0]['interpolationValues']
		icon?: string
		iconBg?: string
		variant?: ApiOutput['fieldOpt']['attributesByCategory'][0]['badgeRender']
		requireText?: boolean
		requireLanguage?: boolean
		requireGeo?: boolean
		requireBoolean?: boolean
		requireData?: boolean
		dataSchemaName?: ApiOutput['fieldOpt']['attributesByCategory'][0]['dataSchemaName']
		dataSchema?: ApiOutput['fieldOpt']['attributesByCategory'][0]['dataSchema']
	}[]
}
