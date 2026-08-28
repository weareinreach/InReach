import {
	Box,
	type ButtonProps,
	createPolymorphicComponent,
	Group,
	Modal,
	Stack,
	Text,
	TextInput,
	Title,
} from '@mantine/core'
import { schemaResolver, useForm } from '@mantine/form'
import { useDisclosure } from '@mantine/hooks'
import { useTranslation } from 'next-i18next/pages'
import { forwardRef, useCallback, useMemo } from 'react'
import { z } from 'zod'

import { type ApiOutput } from '@weareinreach/api'
import { Breadcrumb } from '~ui/components/core/Breadcrumb'
import { Button } from '~ui/components/core/Button'
import { useCustomVariant, useNewNotification, useScreenSize } from '~ui/hooks'
import { trpc as api } from '~ui/lib/trpcClient'

const FormSchema = z.object({
	name: z.string(),
})
const CreateNewListModalBody = forwardRef<HTMLButtonElement, CreateNewListModalBodyProps>(
	({ organizationId, serviceId, itemId, resourceName, component, closeMenuOnClick, ...props }, ref) => {
		const { t } = useTranslation('common')
		const variants = useCustomVariant()
		const [opened, handler] = useDisclosure(false)
		const utils = api.useUtils()
		const { isMobile } = useScreenSize()
		const form = useForm<FormProps>({
			validate: schemaResolver(FormSchema, { sync: true }),
			validateInputOnBlur: true,
			// Without this, `name` starts `undefined` and the TextInput below renders uncontrolled until
			// the user types, tripping React's uncontrolled-to-controlled input warning.
			initialValues: { name: '' },
		})

		const newListNotification = useNewNotification({
			icon: 'added',
			displayText: t('list.created', { name: form.values.name }),
		})
		const resourceSavedNotification = useNewNotification({
			icon: 'heartFilled',
			displayText: t('list.added', { name: form.values.name }),
		})
		const errorNotification = useNewNotification({
			icon: 'warning',
			displayText: t('error-generic'),
		})

		/**
		 * Optimistically add a placeholder list to the `getAll` cache so it shows up instantly, before the server
		 * confirms creation. The real `invalidate()` in `onSuccess` reconciles it with the actual record.
		 */
		const insertOptimisticList = (name: string) => {
			const previousLists = utils.savedList.getAll.getData()
			utils.savedList.getAll.setData(undefined, (old = []) => [
				...old,
				{
					id: `optimistic-${Date.now()}`,
					name,
					updatedAt: new Date(),
					_count: { organizations: 0, services: 0, sharedWith: 0 },
				},
			])
			return { previousLists }
		}
		const rollbackOptimisticList = (previousLists?: ApiOutput['savedList']['getAll']) => {
			if (previousLists) {
				utils.savedList.getAll.setData(undefined, previousLists)
			}
			errorNotification()
		}

		const createListOnly = api.savedList.create.useMutation({
			onMutate: async ({ name }) => {
				await utils.savedList.getAll.cancel()
				return insertOptimisticList(name)
			},
			onSuccess: async () => {
				await utils.savedList.getAll.invalidate()
				newListNotification()
				handler.close()
			},
			onError: (_err, _variables, context) => {
				rollbackOptimisticList(context?.previousLists)
			},
		})
		const createListAndSaveItem = api.savedList.createAndSaveItem.useMutation({
			onMutate: async ({ name }) => {
				await utils.savedList.getAll.cancel()
				return insertOptimisticList(name)
			},
			onSuccess: async (
				_,
				{ organizationId: savedOrgId, serviceId: savedServiceId, itemId: savedItemId }
			) => {
				await Promise.all([
					utils.savedList.getAll.invalidate(),
					utils.savedList.isSaved.invalidate(savedItemId ?? savedServiceId ?? savedOrgId),
				])
				newListNotification()
				resourceSavedNotification()
				handler.close()
			},
			onError: (_err, _variables, context) => {
				rollbackOptimisticList(context?.previousLists)
			},
		})
		const isLoading = createListOnly.isPending || createListAndSaveItem.isPending

		const createHandler = useCallback(() => {
			const { name } = form.getTransformedValues()

			if (itemId || organizationId || serviceId) {
				createListAndSaveItem.mutate({ name, itemId, serviceId, organizationId })
			} else {
				createListOnly.mutate({ name })
			}
		}, [createListAndSaveItem, createListOnly, form, itemId, organizationId, serviceId])

		const modalTitle = useMemo(
			() => (
				<Group justify='space-between' align='center' wrap='nowrap'>
					<Box maw='70%' style={{ overflow: 'hidden' }}>
						<Breadcrumb option='close' onClick={handler.close} />
					</Box>
				</Group>
			),
			[handler]
		)

		return (
			<>
				<Modal title={modalTitle} opened={opened} onClose={handler.close} fullScreen={isMobile}>
					<Stack align='center' gap={24}>
						<Title order={2}>{t('list.create-new')}</Title>
						<Text variant={variants.Text.utility4darkGray}>{t('list.create-new-sub')}</Text>
						<TextInput
							label={t('list.name')}
							placeholder={t('list.new-list-placeholder')}
							required
							{...form.getInputProps('name')}
						/>
						<Text variant={variants.Text.utility4darkGray}>{t('list.create-new-sub2')}</Text>
						<Button
							onClick={createHandler}
							variant='primary-icon'
							fullWidth
							loading={isLoading}
							disabled={!form.isValid()}
						>
							{t('list.create-new')}
						</Button>
					</Stack>
				</Modal>
				<Box
					component={component || 'button'}
					ref={ref}
					{...props}
					// Ensure we don't accidentally pass a 'false' that blocks the menu close
					closeMenuOnClick={closeMenuOnClick}
					onClick={(event: React.MouseEvent) => {
						// 1. If there's an onClick passed from the parent (like Mantine Menu), run it
						props.onClick?.(event)

						// 2. Open the modal!
						// We use a small timeout to let the Menu's "closing" state finish
						// so it doesn't fight the Modal for focus.
						setTimeout(() => {
							handler.open()
						}, 50)
					}}
				/>
			</>
		)
	}
)

CreateNewListModalBody.displayName = 'CreateNewListModal'

export const CreateNewList = createPolymorphicComponent<'button', CreateNewListModalBodyProps>(
	CreateNewListModalBody
)

export type CreateNewListModalBodyProps = CreateAndSave | CreateOnly

interface CreateAndSave extends Omit<ButtonProps, 'onClick'> {
	organizationId?: string
	serviceId?: string
	itemId?: string
	resourceName?: string
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	component?: any
	closeMenuOnClick?: boolean
	onClick?: React.MouseEventHandler
}
interface CreateOnly extends Omit<ButtonProps, 'onClick'> {
	organizationId?: never
	serviceId?: never
	itemId?: never
	resourceName?: never
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	component?: any
	closeMenuOnClick?: boolean
	onClick?: React.MouseEventHandler
}

type FormProps = {
	name: string
}
