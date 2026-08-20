import {
	Box,
	Button,
	type ButtonProps,
	createPolymorphicComponent,
	Modal,
	Stack,
	Text,
	Textarea,
	TextInput,
	Title,
} from '@mantine/core'
import { schemaResolver, useForm } from '@mantine/form'
import { useDisclosure } from '@mantine/hooks'
import { useTranslation } from 'next-i18next/pages'
import { forwardRef } from 'react'
import z from 'zod'

import { ModalTitle } from '~ui/modals'

import classes from './index.module.css'

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
		validate: schemaResolver(schema, { sync: true }),
	})

	const { t } = useTranslation()
	const [opened, { open, close }] = useDisclosure()

	return (
		<>
			<Modal
				title={<ModalTitle breadcrumb={{ option: 'close', onClick: close }} />}
				opened={opened}
				onClose={close}
			>
				<Stack gap={24}>
					<Stack gap={8}>
						<Title ta='center' order={2}>
							{t('alert-message')}
						</Title>
						<Text ta='center' c='black' className={classes.utility4Text}>
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
							classNames={{ required: classes.requiredAsterisk }}
							withAsterisk
							label={t('message_text')}
							placeholder={t('alert-message-instructions') as string}
							{...form.getInputProps('text')}
							minRows={5}
							maxRows={5}
							autosize
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
