/* eslint-disable react/no-unescaped-entities */
import {
	Stack,
	Text,
	TextInput,
	Title,
	useMantineTheme,
	Group,
	type ButtonProps,
	Modal,
	Box,
	createPolymorphicComponent,
} from '@mantine/core'
import { useForm, zodResolver } from '@mantine/form'
import { useDisclosure } from '@mantine/hooks'
import { useTranslation } from 'next-i18next'
import { forwardRef } from 'react'
import { z } from 'zod'

import { Button } from '~ui/components/core'
import { useCustomVariant, useNewNotification } from '~ui/hooks'
import { trpc as api } from '~ui/lib/trpcClient'

import { ModalTitle } from './ModalTitle'

const FormSchema = z.object({
	name: z.string(),
})
export const CreateNewListModalBody = forwardRef<HTMLButtonElement, CreateNewListModalBodyProps>(
	(props, ref) => {
		const { t } = useTranslation('common')
		const variants = useCustomVariant()
		const theme = useMantineTheme()
		const [opened, handler] = useDisclosure(false)
		const utils = api.useContext()
		const form = useForm<FormProps>({
			validate: zodResolver(FormSchema),
			validateInputOnBlur: true,
		})

		const newListNotification = useNewNotification({
			icon: 'added',
			displayText: t('list.created', { name: form.values.name }),
		})
		const resourceSavedNotification = useNewNotification({
			icon: 'heartFilled',
			displayText: t('list.added', { name: form.values.name }),
		})

		const createListOnly = api.savedList.create.useMutation({
			onSuccess: () => {
				newListNotification()
				utils.savedList.getAll.invalidate()
				handler.close()
			},
		})
		const createListAndSaveItem = api.savedList.createAndSaveItem.useMutation({
			onSuccess: (_, { organizationId, serviceId }) => {
				newListNotification()
				resourceSavedNotification()
				utils.savedList.getAll.invalidate()
				utils.savedList.isSaved.invalidate(serviceId ?? organizationId)
				handler.close()
			},
		})
		const isLoading = createListOnly.isLoading || createListAndSaveItem.isLoading

		const createHandler = () => {
			const { organizationId, serviceId } = props
			const { name } = form.values
			if (organizationId || serviceId) {
				createListAndSaveItem.mutate({ name, serviceId, organizationId })
			} else {
				createListOnly.mutate({ name })
			}
		}

		const modalTitle = <ModalTitle breadcrumb={{ option: 'close', onClick: () => handler.close() }} />

		return (
			<>
				<Modal title={modalTitle} opened={opened} onClose={() => handler.close()}>
					<Stack align='center' spacing={24}>
						<Title order={2}>{t('list.create-new')}</Title>
						<Text variant={variants.Text.utility4darkGray}>{t('list.create-new-sub')}</Text>
						<TextInput
							label={t('list.name')}
							placeholder={t('list.new-list-placeholder') as string}
							required
							{...form.getInputProps('name')}
						/>
						<Text variant={variants.Text.utility4darkGray}>{t('list.create-new-sub2')}</Text>
						<Button
							onClick={() => createHandler()}
							variant='primary-icon'
							fullWidth
							loaderPosition='center'
							loading={isLoading}
							disabled={!form.isValid()}
						>
							{t('list.create-new')}
						</Button>
					</Stack>
				</Modal>
				<Box component='button' ref={ref} onClick={() => handler.open()} {...props} />
			</>
		)
	}
)

CreateNewListModalBody.displayName = 'CreateNewListModal'

export const CreateNewList = createPolymorphicComponent<'button', CreateNewListModalBodyProps>(
	CreateNewListModalBody
)

export type CreateNewListModalBodyProps = CreateAndSave | CreateOnly

interface CreateAndSave extends ButtonProps {
	organizationId?: string
	serviceId?: string
	resourceName?: string
}
interface CreateOnly extends ButtonProps {
	organizationId?: never
	serviceId?: never
	resourceName?: never
}

type FormProps = {
	name: string
}
