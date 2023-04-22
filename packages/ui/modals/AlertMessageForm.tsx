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
	createStyles,
} from '@mantine/core'
import { useForm, zodResolver } from '@mantine/form'
import { useDisclosure } from '@mantine/hooks'
import { forwardRef } from 'react'
import { useTranslation } from 'react-i18next'
import z from 'zod'

import { Icon } from 'icon'

import { Button as CustomButton } from '../components/core'

const schema = z.object({
	title: z.string().optional(),
	text: z.string().min(1, 'no-empty-text'),
})

const useStyles = createStyles((theme) => ({
	customButton: {
		'&.mantine-Button-root': {
			padding: '10px 8px',
			borderColor: 'white',
		},
		'& .mantine-Button-inner': {
			display: 'flex',
			gap: 4,
		},
		'& .mantine-Button-leftIcon': {
			marginRight: 0,
		},
	},
}))

const AlertMessageBody = forwardRef<HTMLButtonElement, Props>((props, ref) => {
	const { orgName, ...rest } = props
	const { classes } = useStyles()

	const form = useForm({
		initialValues: {
			title: '',
			text: '',
		},
		validate: zodResolver(schema),
	})

	const { t } = useTranslation()
	const [opened, { open, close }] = useDisclosure()

	const BackButton = (
		<CustomButton
			onClick={close}
			className={classes.customButton}
			variant='secondary-icon'
			leftIcon={<Icon style={{ margin: 0 }} icon='carbon:close' />}
		>
			{t('close')}
		</CustomButton>
	)

	return (
		<>
			<Modal title={BackButton} opened={opened} onClose={close}>
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
