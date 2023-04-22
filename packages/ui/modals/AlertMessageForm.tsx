import {
	Box,
	Button,
	ButtonProps,
	Modal,
	Stack,
	Text,
	Textarea,
	TextInput,
	Title,
	createPolymorphicComponent,
} from '@mantine/core'
import { useForm, zodResolver } from '@mantine/form'
import { useDisclosure } from '@mantine/hooks'
import { forwardRef } from 'react'
import { useTranslation } from 'react-i18next'
import z from 'zod'

import { ModalTitle } from './ModalTitle'

const schema = z.object({
	title: z.string().optional(),
	text: z.string().min(1, 'no-empty-text'),
})

const AlertMessageBody = forwardRef<HTMLButtonElement, Props>((props, ref) => {
	const { orgName, ...rest } = props

	const form = useForm({
		initialValues: {
			title: '',
			text: '',
		},
		validate: zodResolver(schema),
	})

	const { t } = useTranslation()
	const [opened, { open, close }] = useDisclosure()

	return (
		<>
			<Modal
				title={<ModalTitle breadcrumb={{ option: 'close', onClick: () => close() }} />}
				opened={opened}
				onClose={close}
			>
				<Stack spacing={24}>
					<Stack>
						<Title ta='center' order={2}>
							{t('alert-message')}
						</Title>
						<Text ta='center' color='black' sx={(theme) => theme.other.utilityFonts.utility4}>
							{`${t('organization')}: ${orgName}`}
						</Text>
					</Stack>
					<Stack>
						<TextInput
							label={t('message_title')}
							placeholder={t('alert-title-instructions') as string}
							{...form.getInputProps('title')}
						/>
						<Textarea
							sx={(theme) => ({
								'& .mantine-Textarea-required': { color: theme.other.colors.secondary.black },
							})}
							withAsterisk
							label={t('message_text')}
							placeholder={t('alert-message-instructions') as string}
							{...form.getInputProps('text')}
						/>
					</Stack>
					<Button radius='md' size='lg' color='secondary' disabled={!form.isValid()}>
						{t('save-changes')}
					</Button>
				</Stack>
			</Modal>
			<Box component='button' onClick={open} ref={ref} {...rest} />
		</>
	)
})

AlertMessageBody.displayName = 'AlertMessageModal'

export const AlertMessageModal = createPolymorphicComponent<HTMLButtonElement, Props>(AlertMessageBody)

type Props = {
	orgName: string
} & ButtonProps
