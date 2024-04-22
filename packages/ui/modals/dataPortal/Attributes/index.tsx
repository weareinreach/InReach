import { zodResolver } from '@hookform/resolvers/zod'
import {
	Box,
	type ButtonProps,
	createPolymorphicComponent,
	Select as MantineSelect,
	Modal,
	Skeleton,
	Stack,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { useTranslation } from 'next-i18next'
import { forwardRef, type ReactNode, useCallback, useMemo, useRef, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'

import { type ApiOutput } from '@weareinreach/api'
import { generateId } from '@weareinreach/db/lib/idGen'
import { Button } from '~ui/components/core/Button'
import { useNewNotification } from '~ui/hooks/useNewNotification'
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
	({ restrictCategories: _restrictCategories, attachesTo, parentRecord, ...props }, ref) => {
		const { t } = useTranslation(['attribute', 'common'])
		const [opened, handler] = useDisclosure(false)
		const showAddedNotification = useNewNotification({ icon: 'added', displayText: 'Added Attribute' })
		const selectAttrRef = useRef<HTMLInputElement>(null)
		// #region tRPC
		const apiUtils = api.useUtils()
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

		const needsSupplementalData = useCallback((item: NonNullable<typeof attributesByCategory>[number]) => {
			const { requireBoolean, requireGeo, requireData, requireLanguage, requireText } = item

			const check = [requireBoolean, requireGeo, requireData, requireLanguage, requireText]

			return check.some(Boolean)
		}, [])

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
		const saveAttributes = api.organization.attachAttribute.useMutation({
			onSuccess: () => {
				if (parentRecord.serviceId) {
					apiUtils.service.forServiceEditDrawer.invalidate(parentRecord.serviceId)
				}
				form.reset({
					id: generateId('attributeSupplement'),
					...parentRecord,
				})
				setSelectedAttr(null)
				setSupplements(supplementDefaults)
				showAddedNotification()
				handler.close()
			},
		})

		// const formState = useFormState({ control: form.control })

		const selectHandler = useCallback(
			(e: string | null) => {
				if (e === null) {
					setSupplements(supplementDefaults)
					setSelectedAttr(null)
					form.resetField('attributeId')
					return
				}
				const item = attributesByCategory?.find(({ value }) => value === e)
				if (item) {
					setSelectedAttr(item)
					const { requireBoolean, requireGeo, requireData, requireLanguage, requireText } = item
					/** Check if supplemental info required */
					if (needsSupplementalData(item)) {
						/** Handle if supplemental info is provided */
						const suppRequired: SupplementFieldsNeeded = {
							boolean: requireBoolean ?? false,
							geo: requireGeo ?? false,
							language: requireLanguage ?? false,
							text: requireText ?? false,
							data: requireData ?? false,
						}
						setSupplements(suppRequired)
					}
					form.setValue('attributeId', item.value)
					selectAttrRef.current && (selectAttrRef.current.value = '')
				}
			},
			[attributesByCategory, form, needsSupplementalData]
		)

		const submitHandler = () => {
			saveAttributes.mutate(form.getValues())
		}

		// #endregion

		// #region Title & Selected items display
		const modalTitle = <ModalTitle breadcrumb={{ option: 'close', onClick: handler.close }} />
		// const needsSupplement = Object.values(supplements).includes(true)

		const inputContainerWithSkeleton = useCallback(
			(children: ReactNode) => (
				<Skeleton visible={!!attrCat && attributesByCategoryApi.isLoading} radius='md'>
					{children}
				</Skeleton>
			),
			[attrCat, attributesByCategoryApi.isLoading]
		)

		const handleCategorySelect = useCallback(
			(e: string | null) => {
				setAttrCat(e)
				if (selectedAttr) {
					setSelectedAttr(null)
				}
			},
			[selectedAttr]
		)

		return (
			<FormProvider {...form}>
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
								inputContainer={inputContainerWithSkeleton}
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
				<Box component='button' ref={ref} onClick={handler.open} {...props} />
			</FormProvider>
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
