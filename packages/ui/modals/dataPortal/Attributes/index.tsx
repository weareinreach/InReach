import { zodResolver } from '@hookform/resolvers/zod'
import {
	Box,
	type ButtonProps,
	Checkbox,
	createPolymorphicComponent,
	Select as MantineSelect,
	Modal,
	Skeleton,
	Stack,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { type TFunction, useTranslation } from 'next-i18next'
import { forwardRef, type ReactNode, useCallback, useEffect, useMemo, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'

import { type ApiOutput } from '@weareinreach/api'
import {
	attributeSupplementSchema,
	isAttributeSupplementSchema,
} from '@weareinreach/db/generated/attributeSupplementSchema'
import { generateId } from '@weareinreach/db/lib/idGen'
import { Button } from '~ui/components/core/Button'
import { useNewNotification } from '~ui/hooks/useNewNotification'
import { trpc as api } from '~ui/lib/trpcClient'
import { ModalTitle } from '~ui/modals/ModalTitle'

import { Supplement, type SupplementDataProps } from './fields'
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

const getDynamicSchema = (t: TFunction, dataSchemaName?: string) => {
	if (dataSchemaName && isAttributeSupplementSchema(dataSchemaName)) {
		const dynamicSchema = formSchema.extend({
			data: attributeSupplementSchema[dataSchemaName],
		})
		return dynamicSchema
	}

	return formSchema
}

type SelectedAttribute = NonNullable<ReturnType<typeof useAttributeData>['attributesByCategory']>[number]

interface AttributeFormProps {
	parentRecord: AttributeModalProps['parentRecord']
	selectedAttr: NonNullable<SelectedAttribute>
	onSave: (data: FormSchema) => void
	isLoading: boolean
}

const AttributeForm = ({ parentRecord, selectedAttr, onSave, isLoading }: AttributeFormProps) => {
	const { t } = useTranslation(['attribute', 'common'])

	const dynamicSchema = useMemo(
		() => getDynamicSchema(t, selectedAttr.dataSchemaName ?? undefined),
		[t, selectedAttr.dataSchemaName]
	)

	const form = useForm<FormSchema>({
		resolver: zodResolver(dynamicSchema),
		mode: 'all',
		defaultValues: {
			id: generateId('attributeSupplement'),
			...parentRecord,
			attributeId: selectedAttr.attributeId,
		},
	})

	const supplements = useMemo(() => {
		const needsSupplementalData = (item: NonNullable<SelectedAttribute>) => {
			const { requireBoolean, requireGeo, requireData, requireLanguage, requireText } = item
			const check = [requireBoolean, requireGeo, requireData, requireLanguage, requireText]
			return check.some(Boolean)
		}

		if (!needsSupplementalData(selectedAttr)) return supplementDefaults

		const { requireBoolean, requireGeo, requireData, requireLanguage, requireText } = selectedAttr
		return {
			boolean: requireBoolean ?? false,
			geo: requireGeo ?? false,
			language: requireLanguage ?? false,
			text: requireText ?? false,
			data: requireData ?? false,
		}
	}, [selectedAttr])

	return (
		<FormProvider {...form}>
			<Stack>
				{supplements.boolean && <Supplement.Boolean />}
				{supplements.text && <Supplement.Text />}
				{supplements.data && selectedAttr.formSchema && <Supplement.Data schema={selectedAttr.formSchema} />}
				{supplements.language && <Supplement.Language />}
				{supplements.geo && <Supplement.Geo />}
				<Button
					onClick={form.handleSubmit((formData) => {
						// Clean the data object before sending it to the backend
						const data = formData.data as Record<string, unknown> | undefined
						if (data) {
							for (const key in data) {
								if (data[key] === null || data[key] === undefined) {
									delete data[key]
								}
							}
						}
						onSave(formData)
					})}
					type='submit'
					loading={isLoading}
				>
					{t('words.save', { ns: 'common' })}
				</Button>
			</Stack>
		</FormProvider>
	)
}

const useAttributeData = (showInactiveAttribs: boolean, attachesTo: AttributeModalProps['attachesTo']) => {
	const { t } = useTranslation(['attribute'])
	const { data: attributesByCategory, ...attributesByCategoryApi } =
		api.fieldOpt.attributesByCategory.useQuery(
			{ attributeActive: !showInactiveAttribs /* categoryActive: !showInactiveCategories*/ },
			{
				refetchOnWindowFocus: false,
				select: (data) => {
					return data.map(({ attributeId, attributeKey, attributeActive, categoryActive, ...rest }) => ({
						value: attributeId,
						label: t(attributeKey),
						tKey: attributeKey,
						active: attributeActive && categoryActive,
						attributeId, // explicitly carry this over
						...rest,
					}))
				},
			}
		)

	const attributeCategories = useMemo(() => {
		if (!attributesByCategory) return []
		const categories = new Set<string>()
		const result: { value: string; label: string }[] = []

		attributesByCategory
			.filter(({ canAttachTo }) => {
				if (!attachesTo?.length) {
					return true
				}
				return canAttachTo.some((item) => attachesTo.includes(item))
			})
			.forEach(({ categoryName, categoryDisplay }) => {
				const key = JSON.stringify({ value: categoryName, label: categoryDisplay })
				if (!categories.has(key)) {
					categories.add(key)
					result.push(JSON.parse(key))
				}
			})
		return result
	}, [attributesByCategory, attachesTo])

	return { attributesByCategory, attributesByCategoryApi, attributeCategories }
}

const AttributeModalBody = forwardRef<HTMLButtonElement, AttributeModalProps>(
	({ restrictCategories: _restrictCategories, attachesTo, parentRecord, ...props }, ref) => {
		const { t } = useTranslation(['attribute', 'common'])
		const [opened, handler] = useDisclosure(false)
		const showAddedNotification = useNewNotification({ icon: 'added', displayText: 'Added Attribute' })
		const apiUtils = api.useUtils()
		const [attrCat, setAttrCat] = useState<string | null>()
		const [showInactiveAttribs, setShowInactiveAttribs] = useState(true)
		const { attributesByCategory, attributesByCategoryApi, attributeCategories } = useAttributeData(
			showInactiveAttribs,
			attachesTo
		)

		// #endregion
		const saveAttributes = api.organization.attachAttribute.useMutation({
			onSuccess: () => {
				if (parentRecord.serviceId) {
					apiUtils.service.forServiceEditDrawer.invalidate(parentRecord.serviceId)
				}
				showAddedNotification()
				handler.close()
			},
		})

		// #region Handlers
		const [selectedAttributeId, setSelectedAttributeId] = useState<string | null>(null)

		const selectedAttr = useMemo(
			() => attributesByCategory?.find(({ value }) => value === selectedAttributeId),
			[attributesByCategory, selectedAttributeId]
		)

		// #endregion

		// #region Title & Selected items display
		const modalTitle = <ModalTitle breadcrumb={{ option: 'close', onClick: handler.close }} />

		const inputContainerWithSkeleton = useCallback(
			(children: ReactNode) => (
				<Skeleton visible={!!attrCat && attributesByCategoryApi.isLoading} radius='md'>
					{children}
				</Skeleton>
			),
			[attrCat, attributesByCategoryApi.isLoading]
		)

		const handleCategorySelect = useCallback((e: string | null) => {
			// When category changes, clear the selected attribute
			setSelectedAttributeId(null as string | null)
			setAttrCat(e)
		}, [])

		const toggleShowInactiveAttribs = useCallback(() => setShowInactiveAttribs((prev) => !prev), [])

		return (
			<>
				<Modal title={modalTitle} opened={opened} onClose={handler.close}>
					<Stack>
						<Stack>
							<Skeleton visible={attributesByCategoryApi.isLoading}>
								<MantineSelect
									data={attributeCategories ?? []}
									label='Select Category'
									onChange={handleCategorySelect}
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
												.map(({ label, value, active }) => ({ label, value, active }))
								}
								label='Select Attribute'
								disabled={!attrCat || !attributesByCategory?.length}
								withinPortal
								itemComponent={SelectionItem}
								searchable={(attributesByCategory?.length ?? 0) > 10}
								clearable
								inputContainer={inputContainerWithSkeleton}
								value={selectedAttributeId}
								onChange={(value) => setSelectedAttributeId(value)}
							/>
							<Checkbox
								label='Show Inactive Attributes?'
								checked={showInactiveAttribs}
								onChange={toggleShowInactiveAttribs}
							/>
						</Stack>
						{selectedAttr && (
							<AttributeForm
								key={selectedAttr.value}
								parentRecord={parentRecord}
								selectedAttr={selectedAttr}
								onSave={saveAttributes.mutate}
								isLoading={saveAttributes.isLoading}
							/>
						)}
					</Stack>
				</Modal>
				<Box component='button' ref={ref} onClick={handler.open} {...props} />
			</>
		)
	}
)
AttributeModalBody.displayName = 'AttributeModal'

export const AttributeModal = createPolymorphicComponent<'button', AttributeModalProps>(AttributeModalBody)

export interface AttributeModalProps extends ButtonProps {
	restrictCategories?: string[]
	attachesTo?: ApiOutput['fieldOpt']['attributesByCategory'][number]['canAttachTo']
	parentRecord:
		| { organizationId: string; serviceId?: never; locationId?: never }
		| { serviceId: string; organizationId?: never; locationId?: never }
		| { locationId: string; serviceId?: never; organizationId?: never }
}
