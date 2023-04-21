import { createPolymorphicComponent, type ButtonProps, Modal, Box, Stack, Select, Group } from '@mantine/core'
import { useForm } from '@mantine/form'
import { useDisclosure } from '@mantine/hooks'
import { useTranslation } from 'next-i18next'
import { forwardRef, useState } from 'react'

import { useCustomVariant } from '~ui/hooks'
import { trpc as api } from '~ui/lib/trpcClient'

import { ModalTitle } from '../ModalTitle'

const AttributeModalBody = forwardRef<HTMLButtonElement, AttributeModalProps>(
	({ restrictCategories, ...props }, ref) => {
		const { t } = useTranslation(['attribute'])
		const [opened, handler] = useDisclosure(false)
		const [attrCat, setAttrCat] = useState<string | undefined>()
		const form = useForm<FormData>({ initialValues: { attributes: [], categories: [], selected: [] } })

		const { data: categories, isSuccess: categorySuccess } = api.fieldOpt.attributeCategories.useQuery(
			restrictCategories,
			{
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
				onSuccess: (data) =>
					form.setFieldValue(
						'attributes',
						data.map(({ attributeId, attributeKey, icon, badgeRender }) => ({
							value: attributeId,
							label: attributeKey,
							icon: icon ?? undefined,
							variant: badgeRender ?? undefined,
						}))
					),
			}
		)

		const modalTitle = <ModalTitle breadcrumb={{ option: 'close', onClick: () => handler.close() }} />

		return (
			<>
				<Modal title={modalTitle} opened={opened} onClose={() => handler.close()}>
					<Stack>
						<Group></Group>
						<Stack>
							{form.values.categories?.length && (
								<Select
									data={form.values.categories}
									onChange={(e) => (e ? setAttrCat(e) : undefined)}
									withinPortal
								/>
							)}
							<Select
								data={form.values.attributes}
								disabled={!Boolean(form.values.attributes?.length)}
								withinPortal
								{...form.getInputProps('selected')}
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
		variant?: string
	}[]
	categories: {
		value: string
		label: string
	}[]
	attributes: {
		value: string
		label: string
		icon?: string
		variant?: string
	}[]
}
