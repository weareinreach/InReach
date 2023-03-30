import { Title, Text, Checkbox, Modal, Stack, Divider, Button } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { useTranslation } from 'next-i18next'

import { useCustomVariant } from '~ui/hooks'
import { ModalTitle } from '~ui/modals'

import { useFormContext } from './context'

export const ServiceTypes = () => {
	const formContext = useFormContext()
	const variants = useCustomVariant()
	const [open, handler] = useDisclosure(false)
	const { t } = useTranslation(['suggestOrg', 'services'])
	const options = Array.isArray(formContext.values.formOptions?.serviceTypes)
		? formContext.values.formOptions?.serviceTypes.map((item, i) => (
				<Checkbox
					key={item.id}
					label={t(item.tsKey, { ns: item.tsNs })}
					{...formContext.getInputProps(`formOptions.serviceTypes.${i}.id`)}
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
						<Checkbox.Group {...formContext.getInputProps('data.serviceCategories')}>
							{options}
						</Checkbox.Group>
					</Stack>
					<Stack spacing={20}>
						<Divider mt={16} />
						<Button variant={variants.Button.primaryLg} onClick={() => handler.close()}>
							{t('form.btn-save-changes')}
						</Button>
					</Stack>
				</Stack>
			</Modal>
			<Stack spacing={0}>
				<Text variant={variants.Text.utility1}>{t('form.service-types')}</Text>
				<Button variant={variants.Button.secondarySm} onClick={() => handler.open()}>
					{t('form.btn-service')}
				</Button>
			</Stack>
		</>
	)
}

export const Communities = () => {
	const formContext = useFormContext()
	const variants = useCustomVariant()
	const [open, handler] = useDisclosure(false)
	const { t } = useTranslation(['suggestOrg', 'attribute'])

	return <></>
}
