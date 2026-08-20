import { Alert, Button, Checkbox, Divider, Group, Modal, Skeleton, Stack, Text, Title } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { useTranslation } from 'next-i18next/pages'
import { type ReactNode, useCallback, useMemo } from 'react'

import { type ApiOutput } from '@weareinreach/api'
import { useCustomVariant } from '~ui/hooks/useCustomVariant'
import { Icon } from '~ui/icon'
import { trpc as api } from '~ui/lib/trpcClient'
import { ModalTitle } from '~ui/modals/ModalTitle'

import { useFormContext } from './context'
import classes from './modals.module.css'

interface ModalProps {
	disabled: boolean
}
interface ServiceModalProps extends ModalProps {
	serviceTypes: NonNullable<ApiOutput['organization']['suggestionOptions']>['serviceTypes']
}

export const ServiceTypes = ({ disabled, serviceTypes }: ServiceModalProps) => {
	const form = useFormContext()
	const variants = useCustomVariant()
	const [modalOpen, modalHandler] = useDisclosure(false)
	const { t } = useTranslation(['suggestOrg', 'services'])
	const options = useMemo(
		() =>
			serviceTypes.map((item) => (
				<Checkbox key={item.id} label={t(item.tsKey, { ns: item.tsNs })} value={item.id} />
			)),
		[serviceTypes, t]
	)
	const selectedCountIcon = useMemo(() => {
		const selectedServices = form.values.serviceCategories?.length ?? 0
		return selectedServices > 0 ? <Text className={classes.count}>{selectedServices}</Text> : null
	}, [classes.count, form.values.serviceCategories?.length])

	return (
		<>
			<Modal
				opened={modalOpen}
				onClose={modalHandler.close}
				title={<ModalTitle breadcrumb={{ option: 'close', onClick: modalHandler.close }} />}
			>
				<Stack gap={24}>
					<Stack gap={16}>
						<Title order={2}>{t('modal.service-types-title')}</Title>
						<Text variant={variants.Text.darkGray}>{t('modal.service-types-sub')}</Text>
					</Stack>
					<Stack gap={0}>
						<Checkbox.Group {...form.getInputProps('serviceCategories')}>{options}</Checkbox.Group>
					</Stack>
					<Stack gap={20}>
						<Divider mt={16} />
						<Button variant={variants.Button.primaryLg} onClick={modalHandler.close}>
							{t('form.btn-save-changes')}
						</Button>
					</Stack>
				</Stack>
			</Modal>
			<Stack gap={16}>
				<Text variant={variants.Text.utility1}>{t('form.service-types')}</Text>
				<Button
					variant={variants.Button.secondarySm}
					disabled={disabled}
					onClick={modalHandler.open}
					w='fit-content'
				>
					<Group wrap='nowrap'>
						{t('form.btn-service')}
						{selectedCountIcon}
					</Group>
				</Button>
			</Stack>
		</>
	)
}

interface OrgQuickViewProps {
	opened: boolean
	onClose: () => void
	match: ApiOutput['organization']['getPotentialMatches'][number] | null
}

export const OrgQuickView = ({ opened, onClose, match }: OrgQuickViewProps) => {
	const { t } = useTranslation(['suggestOrg', 'common'])
	const variants = useCustomVariant()

	// We fetch the full data for the preview
	const { data, isLoading } = api.organization.forOrgPage.useQuery(
		{ slug: match?.slug ?? '', includeArchived: true },
		{ enabled: opened && !!match?.slug }
	)

	const primaryLocationId = useMemo(() => data?.locations?.[0]?.id, [data?.locations])

	return (
		<Modal
			opened={opened}
			onClose={onClose}
			title={<ModalTitle breadcrumb={{ option: 'close', onClick: onClose }} />}
			size='lg'
		>
			<Stack gap={32}>
				{match?.deleted && (
					<Alert color='orange' icon={<Icon icon='carbon:warning' />} title={t('modal.archived-alert-title')}>
						<Text size='sm'>{t('modal.archived-alert-body')}</Text>
					</Alert>
				)}

				<Skeleton visible={isLoading}>
					{data && (
						<Stack gap={24}>
							<Stack gap={8}>
								<Title order={2}>{data.name}</Title>
								{data.locations?.[0] && (
									<Text c='dimmed' size='md' fw={500}>
										{data.locations[0].city}, {data.locations[0].govDist?.abbrev}
									</Text>
								)}
							</Stack>
							{data.description && <Text size='sm'>{data.description.tsKey?.text}</Text>}
						</Stack>
					)}
				</Skeleton>
			</Stack>
		</Modal>
	)
}

interface CommunitiesModalProps extends ModalProps {
	communities: NonNullable<ApiOutput['organization']['suggestionOptions']>['communities']
}

export const Communities = ({ disabled, communities }: CommunitiesModalProps) => {
	const form = useFormContext()
	const variants = useCustomVariant()
	const [modalOpen, modalHandler] = useDisclosure(false)
	const { t } = useTranslation(['suggestOrg', 'attribute'])
	const selectedCurr = useMemo(() => form.values.communityFocus ?? [], [form.values.communityFocus])
	const unique = (ids: string[]) => [...new Set(ids)]
	const selectedCountIcon = useMemo(() => {
		const selectedItems = form.values.communityFocus?.length ?? 0
		return selectedItems > 0 ? <Text className={classes.count}>{selectedItems}</Text> : null
	}, [classes.count, form.values.communityFocus?.length])

	const hasChildren = useCallback(
		(parentId: string) => communities.find(({ id, children }) => id === parentId && children.length),
		[communities]
	)

	const getChildIds = useCallback(
		(parentId: string) => {
			const parentRecord = communities.find(({ id }) => id === parentId)
			return parentRecord?.children.map(({ id }) => id) ?? []
		},
		[communities]
	)

	const selectedChildren = useCallback(
		(parentId: string, all?: boolean, none?: boolean): boolean => {
			const parentRecord = communities.find(({ id }) => id === parentId)
			if (!parentRecord || !hasChildren(parentId)) {
				return false
			}
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
		},
		[communities, hasChildren, selectedCurr]
	)
	const toggleCategory = useCallback(
		(parentId: string) => {
			const parentRecord = communities.find(({ id }) => id === parentId)
			if (!parentRecord) {
				return void 0
			}
			const childIds = getChildIds(parentId)
			if (selectedChildren(parentId, true)) {
				//  all selected -> deselect all
				form.setFieldValue(
					'communityFocus',
					selectedCurr.filter((id) => !childIds.includes(id))
				)
				return void 0
			}
			form.setFieldValue('communityFocus', unique([...selectedCurr, ...childIds]))
			return void 0
		},
		[communities, form, getChildIds, selectedChildren, selectedCurr]
	)
	const handleCategoryToggle = useCallback((id: string) => () => toggleCategory(id), [toggleCategory])

	const wrapInStack = useCallback((children: ReactNode) => <Stack gap={4}>{children}</Stack>, [])

	const options = useMemo(
		() =>
			communities.map((item, par) => {
				if (item.children.length) {
					const indeterminate = selectedChildren(item.id)
					const checked = selectedChildren(item.id, true)
					return (
						<div key={`${item.id}-${par}`}>
							<Checkbox
								label={`${item.icon} ${t(item.tsKey, { ns: item.tsNs })}`}
								indeterminate={indeterminate}
								checked={checked}
								onClick={handleCategoryToggle(item.id)}
								// onChange={() => noop}
							/>
							<Checkbox.Group {...form.getInputProps('communityFocus')} inputContainer={wrapInStack}>
								{item.children.map((child, i) => (
									<Checkbox
										key={`${child.id}-${par}-${i}`}
										label={t(child.tsKey, { ns: child.tsNs })}
										pl={40}
										value={child.id}
									/>
								))}
							</Checkbox.Group>
						</div>
					)
				}

				return (
					<div key={`${item.id}-${par}`}>
						<Checkbox.Group {...form.getInputProps('communityFocus')} inputContainer={wrapInStack}>
							<Checkbox
								key={`${item.id}-${par}-item`}
								label={`${item.icon} ${t(item.tsKey, { ns: item.tsNs })}`}
								value={item.id}
							/>
						</Checkbox.Group>
					</div>
				)
			}),
		[communities, form, handleCategoryToggle, selectedChildren, t, wrapInStack]
	)

	return (
		<>
			<Modal
				opened={modalOpen}
				onClose={modalHandler.close}
				title={<ModalTitle breadcrumb={{ option: 'close', onClick: modalHandler.close }} />}
			>
				<Stack gap={24}>
					<Stack gap={16}>
						<Title order={2}>{t('modal.community-title')}</Title>
						<Text variant={variants.Text.darkGray}>{t('modal.community-sub')}</Text>
					</Stack>
					<Stack gap={4}>{options}</Stack>
					<Stack gap={20}>
						<Divider mt={16} />
						<Button variant={variants.Button.primaryLg} onClick={modalHandler.close}>
							{t('form.btn-save-changes')}
						</Button>
					</Stack>
				</Stack>
			</Modal>
			<Stack gap={16}>
				<Text variant={variants.Text.utility1}>{t('form.community-focus')}</Text>
				<Button
					variant={variants.Button.secondarySm}
					disabled={disabled}
					onClick={modalHandler.open}
					w='fit-content'
				>
					<Group wrap='nowrap'>
						{t('form.btn-community')}
						{selectedCountIcon}
					</Group>
				</Button>
			</Stack>
		</>
	)
}
