import { zodResolver } from '@hookform/resolvers/zod'
import {
	Box,
	createPolymorphicComponent,
	createStyles,
	Drawer,
	Group,
	LoadingOverlay,
	Modal,
	rem,
	Stack,
	Text,
	Title,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { forwardRef, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Checkbox, TextInput } from 'react-hook-form-mantine'
import { z } from 'zod'

import { Breadcrumb } from '~ui/components/core/Breadcrumb'
import { Button } from '~ui/components/core/Button'
import { Icon } from '~ui/icon'
import { trpc as api } from '~ui/lib/trpcClient'

const useStyles = createStyles((theme) => ({
	drawerContent: {
		borderRadius: `${rem(32)} 0 0 0`,
		minWidth: '40vw',
	},
}))

const FormSchema = z.object({
	url: z.string().url(),
	description: z.string().optional(),
	published: z.boolean(),
	deleted: z.boolean(),
})
type FormSchema = z.infer<typeof FormSchema>
const _WebsiteDrawer = forwardRef<HTMLButtonElement, WebsiteDrawerProps>(({ id, ...props }, ref) => {
	const { data, isFetching } = api.orgWebsite.forEditDrawer.useQuery({ id })
	const [drawerOpened, drawerHandler] = useDisclosure(false)
	const [modalOpened, modalHandler] = useDisclosure(false)
	const { classes } = useStyles()
	const { control, handleSubmit, formState, reset, getValues } = useForm<FormSchema>({
		resolver: zodResolver(FormSchema),
		values: data,
		defaultValues: data,
	})
	const apiUtils = api.useUtils()

	const { isDirty: formIsDirty } = formState
	const [isSaved, setIsSaved] = useState(formIsDirty)

	const siteUpdate = api.orgWebsite.update.useMutation({
		onSettled: (data) => {
			apiUtils.orgWebsite.forEditDrawer.invalidate()
			apiUtils.orgWebsite.forContactInfoEdit.invalidate()
			reset(data)
		},
		onSuccess: () => {
			setIsSaved(true)
		},
	})
	useEffect(() => {
		if (isSaved && formIsDirty) {
			setIsSaved(false)
		}
	}, [formIsDirty, isSaved])
	const handleClose = () => {
		if (formState.isDirty) {
			return modalHandler.open()
		} else {
			return drawerHandler.close()
		}
	}
	return (
		<>
			<Drawer.Root
				onClose={handleClose}
				opened={drawerOpened}
				position='right'
				zIndex={10001}
				keepMounted={false}
			>
				<Drawer.Overlay />
				<Drawer.Content className={classes.drawerContent}>
					<form
						onSubmit={handleSubmit(
							(data) => {
								siteUpdate.mutate({ id, data })
							},
							(error) => console.error(error)
						)}
					>
						<Drawer.Header>
							<Group noWrap position='apart' w='100%'>
								<Breadcrumb option='close' onClick={handleClose} />
								<Button
									variant='primary-icon'
									leftIcon={<Icon icon={isSaved ? 'carbon:checkmark' : 'carbon:save'} />}
									loading={siteUpdate.isLoading}
									disabled={!formState.isDirty}
									type='submit'
								>
									{isSaved ? 'Saved' : 'Save'}
								</Button>
							</Group>
						</Drawer.Header>
						<Drawer.Body>
							<LoadingOverlay visible={isFetching} />
							<Stack spacing={24} align='center'>
								<Title order={2}>Edit Website</Title>
								<Stack spacing={24} align='flex-start' w='100%'>
									<TextInput label='Website URL' required name='url' control={control} />
									<TextInput label='Description' name='description' control={control} />
									<Stack>
										<Checkbox label='Published' name='published' control={control} />
										<Checkbox label='Deleted' name='deleted' control={control} />
									</Stack>
								</Stack>
							</Stack>
						</Drawer.Body>
						<Modal opened={modalOpened} onClose={modalHandler.close} title='Unsaved Changes' zIndex={10002}>
							<Stack align='center'>
								<Text>You have unsaved changes</Text>
								<Group noWrap>
									<Button
										variant='primary-icon'
										leftIcon={<Icon icon='carbon:save' />}
										loading={siteUpdate.isLoading}
										onClick={() => {
											siteUpdate.mutate(
												{ id, data: getValues() },
												{
													onSuccess: () => {
														modalHandler.close()
														drawerHandler.close()
													},
												}
											)
										}}
									>
										Save
									</Button>
									<Button
										variant='secondaryLg'
										onClick={() => {
											reset()
											modalHandler.close()
											drawerHandler.close()
										}}
									>
										Discard
									</Button>
								</Group>
							</Stack>
						</Modal>
					</form>
				</Drawer.Content>
			</Drawer.Root>
			<Stack>
				<Box component='button' onClick={drawerHandler.open} ref={ref} {...props} />
			</Stack>
		</>
	)
})
_WebsiteDrawer.displayName = 'WebsiteDrawer'

export const WebsiteDrawer = createPolymorphicComponent<'button', WebsiteDrawerProps>(_WebsiteDrawer)

interface WebsiteDrawerProps {
	id: string
}
