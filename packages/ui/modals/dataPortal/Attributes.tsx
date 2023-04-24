import {
	createPolymorphicComponent,
	type ButtonProps,
	Modal,
	Box,
	Stack,
	Select,
	Group,
	Text,
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { useDisclosure } from '@mantine/hooks'
import { type ApiOutput } from '@weareinreach/api'
import { useTranslation } from 'next-i18next'
import { forwardRef, useState, useRef, type ComponentPropsWithoutRef } from 'react'

import { Badge } from '~ui/components/core/Badge'
import { useCustomVariant } from '~ui/hooks'
import { Icon, isValidIcon } from '~ui/icon'
import { trpc as api } from '~ui/lib/trpcClient'

import { ModalTitle } from '../ModalTitle'

const SelectionItem = forwardRef<HTMLDivElement, SelectionItemProps>(({ icon, label, ...others }, ref) => {
	const { t } = useTranslation(['attribute'])
	return (
		<div ref={ref} {...others}>
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
}

const AttributeModalBody = forwardRef<HTMLButtonElement, AttributeModalProps>(
	({ restrictCategories, ...props }, ref) => {
		const { t } = useTranslation(['attribute'])
		const [opened, handler] = useDisclosure(false)
		const [attrCat, setAttrCat] = useState<string | undefined>()
		const form = useForm<FormData>({ initialValues: { attributes: [], categories: [], selected: [] } })
		const utils = api.useContext()
		const selectAttrRef = useRef<HTMLInputElement>(null)

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
							requireCountry,
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
							requireCountry,
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
		const modalTitle = <ModalTitle breadcrumb={{ option: 'close', onClick: () => handler.close() }} />

		const selectHandler = (e: string | null) => {
			if (e === null) return

			const item = form.values.attributes?.find(({ value }) => value === e)
			if (item) {
				const { requireBoolean, requireCountry, requireData, requireLanguage, requireText } = item
				if (requireBoolean || requireCountry || requireData || requireLanguage || requireText) return

				form.setFieldValue('selected', [...form.values.selected, item])
				form.setFieldValue(
					'attributes',
					form.values.attributes?.filter(({ value }) => value !== e)
				)
				selectAttrRef.current && (selectAttrRef.current.value = '')
			}
		}
		const removeHandler = (e: string) => {
			form.setFieldValue(
				'selected',
				form.values.selected?.filter(({ value }) => value !== e)
			)
			utils.fieldOpt.attributesByCategory.invalidate()
		}

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
	selected: {
		value: string
		label: string
		icon?: string
		iconBg?: string
		variant?: ApiOutput['fieldOpt']['attributesByCategory'][0]['badgeRender']
		country?: string
		govDist?: string
		language?: string
		text?: string
		boolean?: boolean
		data?: object
	}[]
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
		requireCountry?: boolean
		requireBoolean?: boolean
		requireData?: boolean
	}[]
}
