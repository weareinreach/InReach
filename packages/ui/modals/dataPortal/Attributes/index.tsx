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
	TextInput,
} from '@mantine/core'
import { zodResolver } from '@mantine/form'
import { useDisclosure } from '@mantine/hooks'
import Ajv from 'ajv'
import { useTranslation } from 'next-i18next'
import { forwardRef, useEffect, useState, useRef, type ComponentPropsWithoutRef } from 'react'
import { z } from 'zod'
import { JsonInputOrNull } from '@weareinreach/api/schemas/common'

import { Badge } from '~ui/components/core/Badge'
import { useCustomVariant } from '~ui/hooks'
import { Icon, isValidIcon } from '~ui/icon'
import { trpc as api } from '~ui/lib/trpcClient'

import { useForm, type FormData, AttributeModalFormProvider } from './context'
import { SuppBoolean, SuppText, SuppData } from './fields'
import { ModalTitle } from '../../ModalTitle'

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
		const { t } = useTranslation(['attribute', 'common'])
		const [opened, handler] = useDisclosure(false)
		const [attrCat, setAttrCat] = useState<string | undefined>()
		const [supplements, setSupplements] = useState<SupplementFieldsNeeded>(supplementFields)
		const form = useForm({
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
							interpolationValues,
							icon,
							iconBg,
							badgeRender,
							requireBoolean,
							requireGeo,
							requireData,
							requireLanguage,
							requireText,
							dataSchemaName,
							dataSchema,
							attributeName,
						}) => ({
							value: attributeId,
							label: attributeName,
							tKey: attributeKey,
							interpolationValues,
							icon: icon ?? undefined,
							iconBg: iconBg ?? undefined,
							variant: badgeRender ?? undefined,
							requireBoolean,
							requireGeo,
							requireData,
							requireLanguage,
							requireText,
							dataSchemaName,
							dataSchema,
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
						console.log('init supp handler', item)
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
							schemaName: requireData ? item.dataSchemaName : undefined,
						})

						return
					}
				}
				const { label, value, icon, iconBg, variant, tKey } = item
				form.setFieldValue('selected', [
					...form.values.selected,
					{ label, value, icon, iconBg, variant, tKey },
				])
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
				const { value, label, icon, iconBg, variant, tKey } = item
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
							tKey,
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
		const selectedItems = form.values.selected?.map(({ label, icon, variant, value, iconBg, tKey }) => {
			switch (variant) {
				case 'ATTRIBUTE': {
					return (
						<Group key={value} spacing={4}>
							<Badge variant='attribute' tsNs='attribute' tsKey={tKey} icon={icon ?? ''} />
							<Icon icon='carbon:close-filled' onClick={() => removeHandler(value)} />
						</Group>
					)
				}
				case 'COMMUNITY': {
					return (
						<Group key={value} spacing={4}>
							<Badge variant='community' tsKey={tKey} icon={icon ?? ''} />
							<Icon icon='carbon:close-filled' onClick={() => removeHandler(value)} />
						</Group>
					)
				}
				case 'LEADER': {
					return (
						<Group key={value} spacing={4}>
							<Badge variant='leader' tsKey={tKey} icon={icon ?? ''} iconBg={iconBg ?? ''} />
							<Icon icon='carbon:close-filled' onClick={() => removeHandler(value)} />
						</Group>
					)
				}
				case 'LIST': {
					return (
						<Group key={value} spacing={4}>
							<Text>{t(tKey)}</Text>
							<Icon icon='carbon:close-filled' onClick={() => removeHandler(value)} />
						</Group>
					)
				}
			}
		})
		// #endregion

		/** Validate supplement data against defined JSON schema */
		useEffect(() => {
			const { data, schema } = form.values.supplement ?? {}
			if (data && schema) {
				const ajv = new Ajv()
				const validate = ajv.compile(schema as object)
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
		console.log(form.values)
		return (
			<>
				<Modal title={modalTitle} opened={opened} onClose={() => handler.close()}>
					<AttributeModalFormProvider form={form}>
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
							{supplements.boolean && (
								<SuppBoolean
									handler={(e) => {
										form.values.supplement?.attributeId &&
											handleSupplement({
												attributeId: form.values.supplement.attributeId,
												boolean: e === 'true' ? true : false,
											})
									}}
								/>
							)}
							{supplements.text && (
								<SuppText
									handler={() =>
										form.values.supplement?.attributeId &&
										handleSupplement({
											attributeId: form.values.supplement.attributeId,
											text: form.values.supplement?.text,
										})
									}
								/>
							)}
							{supplements.data && form.values.supplement?.schemaName && (
								<SuppData handler={() => {}} schema={form.values.supplement.schemaName} />
							)}
						</Stack>
					</AttributeModalFormProvider>
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
