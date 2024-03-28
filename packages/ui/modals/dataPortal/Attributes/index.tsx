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
	Skeleton,
	Stack,
	Text,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { type JSONSchemaType } from 'ajv'
import { useTranslation } from 'next-i18next'
import { forwardRef, useMemo, useRef, useState } from 'react'
import { FormProvider, useForm, useFormState } from 'react-hook-form'

import { type ApiOutput } from '@weareinreach/api'
import { generateId } from '@weareinreach/db/lib/idGen'
import { Button } from '~ui/components/core/Button'
import { trpc as api } from '~ui/lib/trpcClient'
import { ModalTitle } from '~ui/modals/ModalTitle'

import { Supplement } from './fields'
import { formSchema, type FormSchema } from './schema'
import { SelectionItem } from './SelectionItem'

const supplementDefaults = {
	boolean: false,
	geo: false,
	language: false,
	text: false,
	data: false,
} as const
type SupplementFieldsNeeded = { [K in keyof typeof supplementDefaults]: boolean }

const AttributeModalBody = forwardRef<HTMLButtonElement, AttributeModalProps>(
	({ restrictCategories, attachesTo, parentRecord, ...props }, ref) => {
		const { t } = useTranslation(['attribute', 'common'])
		const [opened, handler] = useDisclosure(false)

		const selectAttrRef = useRef<HTMLInputElement>(null)
		// #region tRPC
		const utils = api.useUtils()
		const [attrCat, setAttrCat] = useState<string | null>()
		const { data: attributesByCategory, ...attributesByCategoryApi } =
			api.fieldOpt.attributesByCategory.useQuery(undefined, {
				refetchOnWindowFocus: false,
				select: (data) => {
					return data.map(({ attributeId, attributeKey, ...rest }) => ({
						value: attributeId,
						label: t(attributeKey),
						tKey: attributeKey,
						...rest,
					}))
				},
			})

		const attributeCategories = useMemo(() => {
			return [
				...new Set(
					attributesByCategory
						?.filter(({ canAttachTo }) => {
							if (!attachesTo?.length) {
								return true
							}
							let match = false
							for (const item of canAttachTo) {
								if (attachesTo.includes(item)) {
									match = true
									break
								}
							}
							return match
						})
						.map(({ categoryName, categoryDisplay }) => {
							return JSON.stringify({
								value: categoryName,
								label: categoryDisplay,
							})
						})
				),
			].map((v) => {
				return JSON.parse(v) as { value: string; label: string }
			})
		}, [attributesByCategory, attachesTo])
		const [selectedAttr, setSelectedAttr] = useState<NonNullable<typeof attributesByCategory>[number] | null>(
			null
		)
		const [supplements, setSupplements] = useState<SupplementFieldsNeeded>(supplementDefaults)
		const [supplementSchema, setSupplementSchema] = useState<JSONSchemaType<unknown> | null>(null)
		const saveAttributes = api.organization.attachAttribute.useMutation()
		// #endregion

		// #region Handlers
		const form = useForm<FormSchema>({
			resolver: zodResolver(formSchema),
			mode: 'all',

			defaultValues: {
				id: generateId('attributeSupplement'),
				...parentRecord,
			},
		})
		const formState = useFormState({ control: form.control })

		const selectHandler = (e: string | null) => {
			if (e === null) {
				setSupplements(supplementDefaults)
				setSelectedAttr(null)
				form.resetField('attributeId')
				if (supplementSchema !== null) {
					setSupplementSchema(null)
				}
				return
			}
			const item = attributesByCategory?.find(({ value }) => value === e)
			if (item) {
				setSelectedAttr(item)
				const { requireBoolean, requireGeo, requireData, requireLanguage, requireText } = item
				/** Check if supplemental info required */
				if (requireBoolean || requireGeo || requireData || requireLanguage || requireText) {
					/** Handle if supplemental info is provided */
					const suppRequired: SupplementFieldsNeeded = {
						boolean: requireBoolean ?? false,
						geo: requireGeo ?? false,
						language: requireLanguage ?? false,
						text: requireText ?? false,
						data: requireData ?? false,
					}
					setSupplements(suppRequired)
					if (requireData && item.dataSchema) {
						setSupplementSchema(item.dataSchema)
					}

					// return
				}
				form.setValue('attributeId', item.value)
				selectAttrRef.current && (selectAttrRef.current.value = '')
			}
		}

		const submitHandler = () => {
			saveAttributes.mutate(form.getValues())
		}

		// #endregion

		// #region Title & Selected items display
		const modalTitle = <ModalTitle breadcrumb={{ option: 'close', onClick: handler.close }} />
		const needsSupplement = Object.values(supplements).includes(true)
		return (
			<FormProvider {...form}>
				<Modal title={modalTitle} opened={opened} onClose={() => handler.close()}>
					<Stack>
						<Stack>
							<Skeleton visible={attributesByCategoryApi.isLoading}>
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
							<MantineSelect
								data={
									!attrCat
										? []
										: (attributesByCategory ?? [])
												.filter(({ categoryName }) => categoryName === attrCat)
												.map(({ label, value }) => ({ label, value }))
								}
								value={selectedAttr?.value ?? null}
								label='Select Attribute'
								disabled={!attrCat || !attributesByCategory?.length}
								withinPortal
								itemComponent={SelectionItem}
								searchable={(attributesByCategory?.length ?? 0) > 10}
								ref={selectAttrRef}
								clearable
								onChange={selectHandler}
								inputContainer={(children) => (
									<Skeleton visible={!!attrCat && attributesByCategoryApi.isLoading} radius='md'>
										{children}
									</Skeleton>
								)}
							/>
						</Stack>
						{supplements.boolean && <Supplement.Boolean />}
						{supplements.text && <Supplement.Text />}
						{supplements.data && selectedAttr?.formSchema && (
							<Supplement.Data schema={selectedAttr.formSchema} />
						)}
						{supplements.language && <Supplement.Language />}
						{supplements.geo && <Supplement.Geo />}
						<Button onClick={form.handleSubmit(submitHandler)} type='submit'>
							{t('words.save', { ns: 'common' })}
						</Button>
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
	attachesTo?: ApiOutput['fieldOpt']['attributesByCategory'][number]['canAttachTo']
	parentRecord: { organizationId: string } | { serviceId: string } | { locationId: string }
}
