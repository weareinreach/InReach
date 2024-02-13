/* eslint-disable @typescript-eslint/no-unused-vars */
import { DevTool } from '@hookform/devtools'
import { zodResolver } from '@hookform/resolvers/zod'
import {
	Box,
	type ButtonProps,
	createPolymorphicComponent,
	Group,
	Select as MantineSelect,
	Modal,
	Select,
	Skeleton,
	Stack,
	Text,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import Ajv from 'ajv'
import { useTranslation } from 'next-i18next'
import { type ComponentPropsWithoutRef, forwardRef, useEffect, useRef, useState } from 'react'
import { FormProvider, useFieldArray, useForm } from 'react-hook-form'

import { Badge } from '~ui/components/core/Badge'
import { Button } from '~ui/components/core/Button'
import { Icon, isValidIcon } from '~ui/icon'
import { trpc as api } from '~ui/lib/trpcClient'
import { ModalTitle } from '~ui/modals/ModalTitle'

import { Supplement } from './fields'
import { formSchema, type FormSchema } from './schema'
import { SelectionItem } from './SelectionItem'
import { type SupplementEventHandler } from './types'

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

		const form = useForm<FormSchema>({
			resolver: zodResolver(formSchema),
		})
		const selectAttrRef = useRef<HTMLInputElement>(null)
		// #region tRPC
		const utils = api.useUtils()
		const { data: attributeCategories, ...attributeCategoriesApi } =
			api.fieldOpt.attributeCategories.useQuery(restrictCategories, {
				refetchOnWindowFocus: false,
				select: (data) => data.map(({ name, tag }) => ({ value: tag, label: name })),
			})
		const [attrCat, setAttrCat] = useState<string | null>()

		const { data: attributesByCategory, ...attributesByCategoryApi } =
			api.fieldOpt.attributesByCategory.useQuery(attrCat ?? '', {
				enabled: Boolean(attrCat),
				refetchOnWindowFocus: false,
				select: (data) =>
					data.map(
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
						}) => ({
							value: attributeId,
							label: t(attributeKey),
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
					),
			})

		const [selectedAttr, setSelectedAttr] = useState<NonNullable<typeof attributesByCategory>[number] | null>(
			null
		)
		const [supplements, setSupplements] = useState<SupplementFieldsNeeded>(supplementFields)
		const saveAttributes = api.organization.attachAttribute.useMutation()
		// #endregion
		console.log({ attrCat, selectedAttr, supplements })
		// #region Handlers
		const selectHandler = (e: string | null) => {
			console.log(e)
			if (e === null) return setSelectedAttr(null)
			const item = attributesByCategory?.find(({ value }) => value === e)
			if (item) {
				setSelectedAttr(item)
				const { requireBoolean, requireGeo, requireData, requireLanguage, requireText } = item
				/** Check if supplemental info required */
				if (requireBoolean || requireGeo || requireData || requireLanguage || requireText) {
					// const { boolean, countryId, govDistId, languageId, text, data } = form.values.supplement ?? {}
					/** Handle if supplemental info is provided */

					// if (!form.values.supplement) {
					console.log('init supp handler', item)
					const suppRequired: SupplementFieldsNeeded = {
						boolean: requireBoolean ?? false,
						geo: requireGeo ?? false,
						language: requireLanguage ?? false,
						text: requireText ?? false,
						data: requireData ?? false,
					}
					setSupplements(suppRequired)

					return
					// }
				}
				form.setValue('attributeId', item.value)
				// const { label, value, icon, iconBg, variant, tKey } = item
				// form.setFieldValue('selected', [
				// 	...form.values.selected,
				// 	{ label, value, icon, iconBg, variant, tKey },
				// ])
				// form.setFieldValue(
				// 	'attributes',
				// 	form.values.attributes?.filter(({ value }) => value !== e)
				// )
				selectAttrRef.current && (selectAttrRef.current.value = '')
			}
		}
		const handleSupplement = (e: SupplementEventHandler) => {
			const item = attributesByCategory?.find(({ value }) => value === e.attributeId)
			if (!item) return
			const { requireBoolean, requireGeo, requireData, requireLanguage, requireText } = item
			const { boolean, countryId, govDistId, languageId, text, data } = e ?? {}
			console.log('🚀 ~ file: index.tsx:219 ~ handleSupplement ~ e:', e)

			if (
				(requireBoolean && boolean !== undefined) ||
				(requireGeo && (countryId || govDistId)) ||
				(requireLanguage && languageId) ||
				(requireText && text) ||
				(requireData && data)
			) {
				console.log('handler after supp')
				const { value, label, icon, iconBg, variant, tKey } = item
				// clear state
				setSupplements(supplementFields)

				// form.setValues({
				// 	selected: [
				// 		...form.values.selected,
				// 		{
				// 			value,
				// 			label,
				// 			icon,
				// 			iconBg,
				// 			variant,
				// 			countryId,
				// 			govDistId,
				// 			languageId,
				// 			text,
				// 			boolean,
				// 			data,
				// 			tKey,
				// 		},
				// 	],
				// 	attributes: form.values.attributes?.filter(({ value }) => value !== e.attributeId),
				// 	supplement: undefined,
				// })

				// clear out supplement store
				return
			}
		}

		const removeHandler = (e: string) => {
			// form.setFieldValue(
			// 	'selected',
			// 	form.values.selected?.filter(({ value }) => value !== e)
			// )
			utils.fieldOpt.attributesByCategory.invalidate()
		}

		const submitHandler = () => {
			//TODO: [IN-871] Create submit handler - convert tRPC organization.attachAttribute to be able to handle multiple items & accept org, serv, loc
		}

		// #endregion

		// #region Title & Selected items display
		const modalTitle = <ModalTitle breadcrumb={{ option: 'close', onClick: handler.close }} />
		// const selectedItems = form.values.selected?.map(({ label, icon, variant, value, iconBg, tKey, data }) => {
		// 	switch (variant) {
		// 		case 'ATTRIBUTE': {
		// 			return (
		// 				<Group key={value} spacing={4}>
		// 					<Badge variant='attribute' tsNs='attribute' tsKey={tKey} icon={icon ?? ''} />
		// 					<Icon icon='carbon:close-filled' onClick={() => removeHandler(value)} />
		// 				</Group>
		// 			)
		// 		}
		// 		case 'COMMUNITY': {
		// 			return (
		// 				<Group key={value} spacing={4}>
		// 					<Badge variant='community' tsKey={tKey} icon={icon ?? ''} />
		// 					<Icon icon='carbon:close-filled' onClick={() => removeHandler(value)} />
		// 				</Group>
		// 			)
		// 		}
		// 		case 'LEADER': {
		// 			return (
		// 				<Group key={value} spacing={4}>
		// 					<Badge variant='leader' tsKey={tKey} icon={icon ?? ''} iconBg={iconBg ?? ''} />
		// 					<Icon icon='carbon:close-filled' onClick={() => removeHandler(value)} />
		// 				</Group>
		// 			)
		// 		}
		// 		case 'LIST': {
		// 			return (
		// 				<Group key={value} spacing={4}>
		// 					<Text>{t(tKey, { ns: 'attribute', context: 'range', ...data })}</Text>
		// 					<Icon icon='carbon:close-filled' onClick={() => removeHandler(value)} />
		// 				</Group>
		// 			)
		// 		}
		// 	}
		// })
		// #endregion

		/** Validate supplement data against defined JSON schema */
		// useEffect(() => {
		// 	const { data, schema } = form.values.supplement ?? {}
		// 	if (data && schema) {
		// 		const ajv = new Ajv()
		// 		const validate = ajv.compile(schema as object)
		// 		const validData = validate(data)
		// 		if (!validData && validate.errors) {
		// 			form.setFieldError(
		// 				'supplement.data',
		// 				validate.errors.map(({ message }) => message)
		// 			)
		// 		}
		// 	}
		// 	// eslint-disable-next-line react-hooks/exhaustive-deps
		// }, [form.values.supplement])

		const needsSupplement = Object.values(supplements).includes(true)
		return (
			<FormProvider {...form}>
				<Modal title={modalTitle} opened={opened} onClose={() => handler.close()}>
					<Stack>
						{/* <Group>{selectedItems}</Group> */}
						<Stack>
							<Skeleton visible={attributeCategoriesApi.isLoading}>
								<MantineSelect
									data={attributeCategories ?? []}
									label='Select Category'
									onChange={(e) => {
										setAttrCat(e)
										if (selectedAttr) {
											setSelectedAttr(null)
										}
									}}
									withinPortal
									searchable
									clearable
								/>
							</Skeleton>
							{true && (
								// <Skeleton visible={!!attrCat && attributesByCategoryApi.isLoading}>
								<MantineSelect
									data={
										!attrCat ? [] : (attributesByCategory ?? []).map(({ label, value }) => ({ label, value }))
									}
									value={selectedAttr?.value ?? null}
									label='Select Attribute'
									disabled={!attrCat || !attributesByCategory?.length}
									withinPortal
									itemComponent={SelectionItem}
									searchable={(attributesByCategory?.length ?? 0) > 10}
									ref={selectAttrRef}
									clearable
									// {...form.getInputProps('selected')}
									onChange={selectHandler}
									inputContainer={(children) => (
										<Skeleton visible={!!attrCat && attributesByCategoryApi.isLoading} radius='md'>
											{children}
										</Skeleton>
									)}
								/>
								// </Skeleton>
							)}
						</Stack>
						{supplements.boolean && <Supplement.Boolean />}
						{supplements.text && <Supplement.Text />}
						{supplements.data && selectedAttr?.dataSchemaName && (
							<Supplement.Data schema={selectedAttr.dataSchemaName} />
						)}
						{supplements.language && <Supplement.Language />}
						{supplements.geo && <Supplement.Geo />}
						{!needsSupplement && <Button>{t('words.save', { ns: 'common' })}</Button>}
					</Stack>
				</Modal>
				<Box component='button' ref={ref} onClick={() => handler.open()} {...props} />
				<DevTool control={form.control} placement='top-left' />
			</FormProvider>
		)
	}
)
AttributeModalBody.displayName = 'AttributeModal'

export const AttributeModal = createPolymorphicComponent<'button', AttributeModalProps>(AttributeModalBody)

export interface AttributeModalProps extends ButtonProps {
	restrictCategories?: string[]
}
