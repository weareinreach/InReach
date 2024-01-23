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
import { type ComponentPropsWithoutRef, forwardRef, type ReactElement, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Checkbox, Select, TextInput } from 'react-hook-form-mantine'
import { z } from 'zod'

import { prefixedId } from '@weareinreach/api/schemas/idPrefix'
import { generateId } from '@weareinreach/db/lib/idGen'
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
	id: prefixedId('orgSocialMedia'),
	username: z.string(),
	url: z.string(),
	published: z.boolean(),
	deleted: z.boolean(),
	serviceId: z.string(),
	organizationId: prefixedId('organization').nullable(),
	orgLocationId: prefixedId('orgLocation').nullable(),
	orgLocationOnly: z.boolean(),
	service: z.object({
		id: prefixedId('socialMediaService'),
		name: z.string(),
		logoIcon: z.string(),
	}),
})
type FormSchema = z.infer<typeof FormSchema>
interface ItemProps extends ComponentPropsWithoutRef<'div'> {
	value: string
	label: string
	icon: ReactElement
}
const SelectItem = forwardRef<HTMLDivElement, ItemProps>(({ value, label, icon, ...props }, ref) => (
	<div ref={ref} {...props}>
		<Group noWrap spacing={12}>
			{icon} {label}
		</Group>
	</div>
))
SelectItem.displayName = 'SelectItem'

const _SocialMediaDrawer = forwardRef<HTMLButtonElement, SocialMediaDrawerProps>(
	({ id, createNew, ...props }, ref) => {
		const socialId = createNew ? generateId('orgSocialMedia') : id
		const { data, isFetching } = api.orgSocialMedia.forEditDrawer.useQuery({ id: socialId })
		const [drawerOpened, drawerHandler] = useDisclosure(false)
		const [modalOpened, modalHandler] = useDisclosure(false)
		const { classes } = useStyles()
		const { control, handleSubmit, formState, reset, getValues } = useForm<FormSchema>({
			resolver: zodResolver(FormSchema),
			values: data,
		})
		const apiUtils = api.useUtils()
		const { data: services } = api.orgSocialMedia.getServiceTypes.useQuery(undefined, {
			select: (data) =>
				data
					? data.map(({ id, name, logoIcon }) => ({ value: id, label: name, icon: <Icon icon={logoIcon} /> }))
					: [],
			placeholderData: [],
		})

		const { isDirty: formIsDirty } = formState
		const [isSaved, setIsSaved] = useState(formIsDirty)

		const databaseUpdate = api.orgSocialMedia.update.useMutation({
			onSettled: (data) => {
				apiUtils.orgSocialMedia.forEditDrawer.invalidate()
				apiUtils.orgSocialMedia.forContactInfoEdits.invalidate()
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
									databaseUpdate.mutate({ id: socialId, data })
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
										loading={databaseUpdate.isLoading}
										disabled={!formState.isDirty}
										type='submit'
									>
										{isSaved ? 'Saved' : 'Save'}
									</Button>
								</Group>
							</Drawer.Header>
							<Drawer.Body>
								<LoadingOverlay visible={isFetching && !createNew} />
								<Stack spacing={24} align='center'>
									<Title order={2}>{`${createNew ? 'Add New' : 'Edit'} Social Media`}</Title>
									<Stack spacing={24} align='flex-start' w='100%'>
										<Select
											label='Service'
											required
											name='serviceId'
											control={control}
											data={services ?? []}
											itemComponent={SelectItem}
										/>
										<TextInput label='Website URL' required name='url' control={control} />
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
											loading={databaseUpdate.isLoading}
											onClick={() => {
												databaseUpdate.mutate(
													{ id: socialId, data: getValues() },
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
	}
)
_SocialMediaDrawer.displayName = 'WebsiteDrawer'

export const SocialMediaDrawer = createPolymorphicComponent<'button', SocialMediaDrawerProps>(
	_SocialMediaDrawer
)

type SocialMediaDrawerProps = SocialMediaExisting | SocialMediaNew

interface SocialMediaExisting {
	id: string
	createNew?: never
}
interface SocialMediaNew {
	id?: never
	createNew: true
}
