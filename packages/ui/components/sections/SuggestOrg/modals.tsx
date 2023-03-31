import { Title, Text, Checkbox, Modal, Stack, Divider, Button } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { useTranslation } from 'next-i18next'

import { useCustomVariant } from '~ui/hooks'
import { ModalTitle } from '~ui/modals'

import { useFormContext } from './context'

export const ServiceTypes = () => {
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
						<Checkbox.Group {...form.getInputProps('data.serviceCategories')}>{options}</Checkbox.Group>
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
				<Button variant={variants.Button.secondarySm} onClick={() => handler.open()} w='fit-content'>
					{t('form.btn-service')}
				</Button>
			</Stack>
		</>
	)
}

export const Communities = () => {
	const form = useFormContext()
	const variants = useCustomVariant()
	const [open, handler] = useDisclosure(false)
	const { t } = useTranslation(['suggestOrg', 'attribute'])
	const selectedCurr = form.values.data?.communityFocus ?? []
	const childRecords = form.values.formOptions.communities.flatMap(({ children }) => children)
	const unique = (ids: string[]) => [...new Set(ids)]
	const hasChildren = (parentId: string) =>
		form.values.formOptions.communities.find(({ id, children }) => id === parentId && children.length)
	const valueMap = new Map(childRecords.map(({ id }) => [id, false]))

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
				'data.communityFocus',
				selectedCurr.filter((id) => !childIds.includes(id))
			)
			return
		}
		form.setFieldValue('data.communityFocus', unique([...selectedCurr, ...childIds]))
		return
	}

	const options = Array.isArray(form.values.formOptions?.communities)
		? form.values.formOptions?.communities.map((item, par) => {
				if (item.children.length) {
					const indeterminate = selectedChildren(item.id)
					const checked = selectedChildren(item.id, true)
					return (
						<>
							<Checkbox
								key={item.id}
								label={`${item.icon} ${t(item.tsKey, { ns: item.tsNs })}`}
								indeterminate={indeterminate}
								checked={checked}
								onClick={() => toggleCategory(item.id)}
							/>
							<Checkbox.Group
								{...form.getInputProps('data.communityFocus')}
								inputContainer={(children) => <Stack spacing={4}>{children}</Stack>}
							>
								{item.children.map((child, i) => (
									<Checkbox
										key={`${child.id}-${i}`}
										label={t(child.tsKey, { ns: child.tsNs })}
										pl={40}
										{...form.getInputProps(`formOptions.communities.${par}.children.${i}.id`)}
									/>
								))}
							</Checkbox.Group>
						</>
					)
				}

				return (
					<Checkbox.Group
						key={item.id}
						{...form.getInputProps('data.communityFocus')}
						inputContainer={(children) => <Stack spacing={4}>{children}</Stack>}
					>
						<Checkbox
							key={item.id}
							label={`${item.icon} ${t(item.tsKey, { ns: item.tsNs })}`}
							{...form.getInputProps(`formOptions.communities.${par}.id`)}
						/>
					</Checkbox.Group>
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
				<Button variant={variants.Button.secondarySm} onClick={() => handler.open()} w='fit-content'>
					{t('form.btn-community')}
				</Button>
			</Stack>
		</>
	)
}
