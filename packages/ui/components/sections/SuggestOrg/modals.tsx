import { Title, Text, Checkbox, Modal, Stack, Divider, Button } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { useTranslation } from 'next-i18next'

import { useCustomVariant } from '~ui/hooks'
import { ModalTitle } from '~ui/modals'

import { useFormContext } from './context'

interface ModalProps {
	disabled: boolean
}

export const ServiceTypes = ({ disabled }: ModalProps) => {
	const form = useFormContext()
	const variants = useCustomVariant()
	const [open, handler] = useDisclosure(false)
	const { t } = useTranslation(['suggestOrg', 'services'])
	const options = Array.isArray(form.values.formOptions?.serviceTypes)
		? form.values.formOptions?.serviceTypes.map((item, i) => (
				<Checkbox
					key={item.id}
					label={t(item.tsKey, { ns: item.tsNs })}
					{...form.getInputProps(`formOptions.serviceTypes.${i}.id`)}
				/>
		  ))
		: null

	return (
		<>
			<Modal
				opened={open}
				onClose={() => handler.close()}
				title={<ModalTitle breadcrumb={{ option: 'close', onClick: () => handler.close() }} />}
				scrollAreaComponent={Modal.NativeScrollArea}
			>
				<Stack spacing={24}>
					<Stack spacing={16}>
						<Title order={2}>{t('modal.service-types-title')}</Title>
						<Text variant={variants.Text.darkGray}>{t('modal.service-types-sub')}</Text>
					</Stack>
					<Stack spacing={0}>
						<Checkbox.Group {...form.getInputProps('serviceCategories')}>{options}</Checkbox.Group>
					</Stack>
					<Stack spacing={20}>
						<Divider mt={16} />
						<Button variant={variants.Button.primaryLg} onClick={() => handler.close()}>
							{t('form.btn-save-changes')}
						</Button>
					</Stack>
				</Stack>
			</Modal>
			<Stack spacing={16}>
				<Text variant={variants.Text.utility1}>{t('form.service-types')}</Text>
				<Button
					variant={variants.Button.secondarySm}
					disabled={disabled}
					onClick={() => handler.open()}
					w='fit-content'
				>
					{t('form.btn-service')}
				</Button>
			</Stack>
		</>
	)
}

export const Communities = ({ disabled }: ModalProps) => {
	const form = useFormContext()
	const variants = useCustomVariant()
	const [open, handler] = useDisclosure(false)
	const { t } = useTranslation(['suggestOrg', 'attribute'])
	const selectedCurr = form.values.communityFocus ?? []
	const childRecords = form.values.formOptions?.communities.flatMap(({ children }) => children)
	const unique = (ids: string[]) => [...new Set(ids)]
	const hasChildren = (parentId: string) =>
		form.values.formOptions.communities.find(({ id, children }) => id === parentId && children.length)

	const getChildIds = (parentId: string) => {
		const parentRecord = form.values.formOptions.communities.find(({ id }) => id === parentId)
		if (!parentRecord) return []
		return parentRecord.children.map(({ id }) => id)
	}

	const selectedChildren = (parentId: string, all?: boolean, none?: boolean): boolean => {
		const parentRecord = form.values.formOptions.communities.find(({ id }) => id === parentId)
		if (!parentRecord || !hasChildren(parentId)) return false
		if (all) {
			const allChecked = parentRecord.children.every(({ id }) => selectedCurr.includes(id))
			return allChecked
		}
		if (none) {
			const noneChecked = parentRecord.children.every(({ id }) => !selectedCurr.includes(id))
			return noneChecked
		}
		return Boolean(
			!selectedChildren(parentId, true) && parentRecord.children.some(({ id }) => selectedCurr.includes(id))
		)
	}
	const toggleCategory = (parentId: string) => {
		const parentRecord = form.values.formOptions.communities.find(({ id }) => id === parentId)
		if (!parentRecord) return
		const childIds = getChildIds(parentId)
		if (selectedChildren(parentId, true)) {
			//  all selected -> deselect all
			console.log('toggle all')
			form.setFieldValue(
				'communityFocus',
				selectedCurr.filter((id) => !childIds.includes(id))
			)
			return
		}
		form.setFieldValue('communityFocus', unique([...selectedCurr, ...childIds]))
		return
	}

	const options = Array.isArray(form.values.formOptions?.communities)
		? form.values.formOptions?.communities.map((item, par) => {
				if (item.children.length) {
					const indeterminate = selectedChildren(item.id)
					const checked = selectedChildren(item.id, true)
					return (
						<div key={`${item.id}-${par}`}>
							<Checkbox
								label={`${item.icon} ${t(item.tsKey, { ns: item.tsNs })}`}
								indeterminate={indeterminate}
								checked={checked}
								onClick={() => toggleCategory(item.id)}
								onChange={() => {}}
							/>
							<Checkbox.Group
								{...form.getInputProps('communityFocus')}
								inputContainer={(children) => <Stack spacing={4}>{children}</Stack>}
							>
								{item.children.map((child, i) => (
									<Checkbox
										key={`${child.id}-${par}-${i}`}
										label={t(child.tsKey, { ns: child.tsNs })}
										pl={40}
										{...form.getInputProps(`formOptions.communities.${par}.children.${i}.id`)}
									/>
								))}
							</Checkbox.Group>
						</div>
					)
				}

				return (
					<div key={`${item.id}-${par}`}>
						<Checkbox.Group
							{...form.getInputProps('communityFocus')}
							inputContainer={(children) => <Stack spacing={4}>{children}</Stack>}
						>
							<Checkbox
								key={`${item.id}-${par}-item`}
								label={`${item.icon} ${t(item.tsKey, { ns: item.tsNs })}`}
								{...form.getInputProps(`formOptions.communities.${par}.id`)}
							/>
						</Checkbox.Group>
					</div>
				)
		  })
		: null

	return (
		<>
			<Modal
				opened={open}
				onClose={() => handler.close()}
				title={<ModalTitle breadcrumb={{ option: 'close', onClick: () => handler.close() }} />}
				scrollAreaComponent={Modal.NativeScrollArea}
			>
				<Stack spacing={24}>
					<Stack spacing={16}>
						<Title order={2}>{t('modal.community-title')}</Title>
						<Text variant={variants.Text.darkGray}>{t('modal.community-sub')}</Text>
					</Stack>
					<Stack spacing={4}>{options}</Stack>
					<Stack spacing={20}>
						<Divider mt={16} />
						<Button variant={variants.Button.primaryLg} onClick={() => handler.close()}>
							{t('form.btn-save-changes')}
						</Button>
					</Stack>
				</Stack>
			</Modal>
			<Stack spacing={16}>
				<Text variant={variants.Text.utility1}>{t('form.community-focus')}</Text>
				<Button
					variant={variants.Button.secondarySm}
					disabled={disabled}
					onClick={() => handler.open()}
					w='fit-content'
				>
					{t('form.btn-community')}
				</Button>
			</Stack>
		</>
	)
}
