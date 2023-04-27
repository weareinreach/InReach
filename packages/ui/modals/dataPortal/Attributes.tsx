import {
	createPolymorphicComponent,
	type ButtonProps,
	Modal,
	Box,
	Stack,
	Select,
	Group,
	Text,
	Radio,
} from '@mantine/core'
import { useForm, zodResolver } from '@mantine/form'
import { useDisclosure } from '@mantine/hooks'
import { type ApiOutput } from '@weareinreach/api'
import { JsonInputOrNull } from '@weareinreach/api/schemas/common'
import Ajv from 'ajv'
import { useTranslation } from 'next-i18next'
import { forwardRef, useEffect, useState, useRef, type ComponentPropsWithoutRef } from 'react'
import { z } from 'zod'

import { Badge } from '~ui/components/core/Badge'
import { useCustomVariant } from '~ui/hooks'
import { Icon, isValidIcon } from '~ui/icon'
import { trpc as api } from '~ui/lib/trpcClient'

import { ModalTitle } from '../ModalTitle'

const formDataSchema = z.object({
	selected: z
		.object({
			value: z.string(),
			country: z.string().optional(),
			govDist: z.string().optional(),
			language: z.string().optional(),
			text: z.string().optional(),
			boolean: z.coerce.boolean().optional(),
			data: JsonInputOrNull.optional(),
		})
		.array(),
})

const SelectionItem = forwardRef<HTMLDivElement, SelectionItemProps>(({ icon, label, ...others }, ref) => {
	const { t } = useTranslation(['attribute'])
	const { requireBoolean, requireGeo, requireData, requireLanguage, requireText, ...props } = others
	return (
		<div ref={ref} {...props}>
			<Group
				sx={(theme) => ({
					alignItems: 'center',
					gap: theme.spacing.xs,
					padding: theme.spacing.xs,
					borderRadius: theme.radius.sm,
					// backgroundColor: theme.colors.gray[0],
					cursor: 'pointer',
					'&:hover': {
						backgroundColor: theme.other.colors.primary.lightGray,
					},
				})}
			>
				{icon && isValidIcon(icon) && <Icon icon={icon} width={18} />}
				{icon && !isValidIcon(icon) && <Text>{icon}</Text>}
				{label && label}
			</Group>
		</div>
	)
})
SelectionItem.displayName = 'SelectionItem'
interface SelectionItemProps extends ComponentPropsWithoutRef<'div'> {
	icon?: string
	label: string
	requireBoolean: boolean
	requireGeo: boolean
	requireData: boolean
	requireLanguage: boolean
	requireText: boolean
}

const supplementFields = {
	boolean: false,
	geo: false,
	language: false,
	text: false,
	data: false,
} as const
type SupplementFieldsNeeded = { [K in keyof typeof supplementFields]: boolean }

const AttributeModalBody = forwardRef<HTMLButtonElement, AttributeModalProps>(
	({ restrictCategories, ...props }, ref) => {
		const { t } = useTranslation(['attribute'])
		const [opened, handler] = useDisclosure(false)
		const [attrCat, setAttrCat] = useState<string | undefined>()
		const [supplements, setSupplements] = useState<SupplementFieldsNeeded>(supplementFields)
		const form = useForm<FormData>({
			initialValues: { attributes: [], categories: [], selected: [], supplement: undefined },
			validate: zodResolver(formDataSchema),
		})
		const selectAttrRef = useRef<HTMLInputElement>(null)
		// #region tRPC
		const utils = api.useContext()
		const { data: categories, isSuccess: categorySuccess } = api.fieldOpt.attributeCategories.useQuery(
			restrictCategories,
			{
				refetchOnWindowFocus: false,
				onSuccess: (data) => {
					if (data.length === 1 && data[0]?.tag) {
						setAttrCat(data[0].tag)
					} else {
						form.setFieldValue(
							'categories',
							data.map(({ id, icon, intDesc, name, tag }) => ({ value: tag, label: name }))
						)
					}
				},
			}
		)
		const { data: attributes, isSuccess: attributeSuccess } = api.fieldOpt.attributesByCategory.useQuery(
			attrCat,
			{
				enabled: Boolean(attrCat),
				refetchOnWindowFocus: false,
				onSuccess: (data) => {
					const selected = form.values.selected?.map(({ value }) => value) ?? []
					const items = data.map(
						({
							attributeId,
							attributeKey,
							icon,
							iconBg,
							badgeRender,
							requireBoolean,
							requireGeo,
							requireData,
							requireLanguage,
							requireText,
						}) => ({
							value: attributeId,
							label: t(attributeKey, { ns: 'attribute' }),
							icon: icon ?? undefined,
							iconBg: iconBg ?? undefined,
							variant: badgeRender ?? undefined,
							requireBoolean,
							requireGeo,
							requireData,
							requireLanguage,
							requireText,
						})
					)
					form.setFieldValue(
						'attributes',
						items.filter(({ value }) => !selected.includes(value))
					)
				},
			}
		)
		// #endregion

		// #region Handlers
		const selectHandler = (e: string | null) => {
			if (e === null) return

			const item = form.values.attributes?.find(({ value }) => value === e)

			if (item) {
				const { requireBoolean, requireGeo, requireData, requireLanguage, requireText } = item
				/** Check if supplemental info required */
				if (requireBoolean || requireGeo || requireData || requireLanguage || requireText) {
					console.log('eval handler', form.values.supplement)
					const { boolean, countryId, govDistId, languageId, text, data } = form.values.supplement ?? {}
					/** Handle if supplemental info is provided */

					if (!form.values.supplement) {
						console.log('init supp handler')
						const suppRequired: SupplementFieldsNeeded = {
							boolean: requireBoolean ?? false,
							geo: requireGeo ?? false,
							language: requireLanguage ?? false,
							text: requireText ?? false,
							data: requireData ?? false,
						}
						setSupplements(suppRequired)

						form.setFieldValue('supplement', {
							attributeId: item.value,
							schema: requireData ? item.dataSchema : undefined,
						})

						return
					}
				}
				const { label, value, icon, iconBg, variant } = item
				form.setFieldValue('selected', [...form.values.selected, { label, value, icon, iconBg, variant }])
				form.setFieldValue(
					'attributes',
					form.values.attributes?.filter(({ value }) => value !== e)
				)
				selectAttrRef.current && (selectAttrRef.current.value = '')
			}
		}
		const handleSupplement = (e: NonNullable<FormData['supplement']>) => {
			const item = form.values.attributes?.find(({ value }) => value === e.attributeId)
			if (!item) return
			const { requireBoolean, requireGeo, requireData, requireLanguage, requireText } = item
			const { boolean, countryId, govDistId, languageId, text, data } = e ?? {}
			if (
				(requireBoolean && boolean !== undefined) ||
				(requireGeo && (countryId || govDistId)) ||
				(requireLanguage && languageId) ||
				(requireText && text) ||
				(requireData && data)
			) {
				console.log('handler after supp')
				const { value, label, icon, iconBg, variant } = item
				setSupplements(supplementFields)
				form.setValues({
					selected: [
						...form.values.selected,
						{
							value,
							label,
							icon,
							iconBg,
							variant,
							countryId,
							govDistId,
							languageId,
							text,
							boolean,
							data,
						},
					],
					attributes: form.values.attributes?.filter(({ value }) => value !== e.attributeId),
					supplement: undefined,
				})

				// clear out supplement store
				return
			}
		}

		const removeHandler = (e: string) => {
			form.setFieldValue(
				'selected',
				form.values.selected?.filter(({ value }) => value !== e)
			)
			utils.fieldOpt.attributesByCategory.invalidate()
		}
		// #endregion

		// #region Title & Selected items display
		const modalTitle = <ModalTitle breadcrumb={{ option: 'close', onClick: () => handler.close() }} />
		const selectedItems = form.values.selected?.map(({ label, icon, variant, value, iconBg }) => {
			switch (variant) {
				case 'ATTRIBUTE': {
					return (
						<Group key={value} spacing={4}>
							<Badge variant='attribute' tsNs='attribute' tsKey={label} icon={icon ?? ''} />
							<Icon icon='carbon:close-filled' onClick={() => removeHandler(value)} />
						</Group>
					)
				}
				case 'COMMUNITY': {
					return (
						<Group key={value} spacing={4}>
							<Badge variant='community' tsKey={label} icon={icon ?? ''} />
							<Icon icon='carbon:close-filled' onClick={() => removeHandler(value)} />
						</Group>
					)
				}
				case 'LEADER': {
					return (
						<Group key={value} spacing={4}>
							<Badge variant='leader' tsKey={label} icon={icon ?? ''} iconBg={iconBg ?? ''} />
							<Icon icon='carbon:close-filled' onClick={() => removeHandler(value)} />
						</Group>
					)
				}
				case 'LIST': {
					return (
						<Group key={value} spacing={4}>
							<Text>{t(label)}</Text>
							<Icon icon='carbon:close-filled' onClick={() => removeHandler(value)} />
						</Group>
					)
				}
			}
		})
		// #endregion

		// #region Supplement data entry
		const SuppBoolean = () => (
			<Radio.Group
				value={
					form.values.supplement?.boolean === undefined
						? undefined
						: form.values.supplement.boolean
						? 'true'
						: 'false'
				}
				onChange={(e) => {
					// form.setFieldValue('supplement.boolean', e === 'true' ? true : false)
					form.values.supplement?.attributeId &&
						handleSupplement({
							attributeId: form.values.supplement.attributeId,
							boolean: e === 'true' ? true : false,
						})
				}}
			>
				<Group>
					<Radio value='true' label='True/Yes' />
					<Radio value='false' label='False/No' />
				</Group>
			</Radio.Group>
		)
		console.log(supplements)
		console.log(form.values)
		//#endregion

		/** Validate supplement data against defined JSON schema */
		useEffect(() => {
			const { data, schema } = form.values.supplement ?? {}
			if (data && schema) {
				const ajv = new Ajv()
				const validate = ajv.compile(schema)
				const validData = validate(data)
				if (!validData && validate.errors) {
					form.setFieldError(
						'supplement.data',
						validate.errors.map(({ message }) => message)
					)
				}
			}
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, [form.values.supplement])

		return (
			<>
				<Modal title={modalTitle} opened={opened} onClose={() => handler.close()}>
					<Stack>
						<Group>{selectedItems}</Group>
						<Stack>
							{form.values.categories?.length && (
								<Select
									data={form.values.categories}
									onChange={(e) => (e ? setAttrCat(e) : undefined)}
									withinPortal
									searchable
								/>
							)}
							<Select
								data={form.values.attributes}
								disabled={!Boolean(form.values.attributes?.length)}
								withinPortal
								itemComponent={SelectionItem}
								searchable={form.values.attributes?.length > 10}
								ref={selectAttrRef}
								// {...form.getInputProps('selected')}
								onChange={selectHandler}
							/>
						</Stack>
						{supplements.boolean && <SuppBoolean />}
					</Stack>
				</Modal>
				<Box component='button' ref={ref} onClick={() => handler.open()} {...props} />
			</>
		)
	}
)
AttributeModalBody.displayName = 'AttributeModal'

export const AttributeModal = createPolymorphicComponent<'button', AttributeModalProps>(AttributeModalBody)

export interface AttributeModalProps extends ButtonProps {
	restrictCategories?: string[]
}

interface FormData {
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
