import { zodResolver } from '@hookform/resolvers/zod'
import {
	Box,
	createPolymorphicComponent,
	createStyles,
	Drawer,
	Group,
	rem,
	Stack,
	Title,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { forwardRef } from 'react'
import { useForm } from 'react-hook-form'
import { Checkbox, TextInput } from 'react-hook-form-mantine'
import { z } from 'zod'

import { Breadcrumb } from '~ui/components/core/Breadcrumb'
import { Button } from '~ui/components/core/Button'
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
	const [opened, handler] = useDisclosure(true)
	const { classes } = useStyles()
	const { control, handleSubmit } = useForm<FormSchema>({
		resolver: zodResolver(FormSchema),
		values: data,
		defaultValues: data,
	})
	const apiUtils = api.useContext()
	const siteUpdate = api.orgWebsite.update.useMutation({
		onSettled: () => apiUtils.orgWebsite.forContactInfo.invalidate(),
	})
	return (
		<>
			<Drawer.Root onClose={handler.close} opened={opened} position='right'>
				<Drawer.Overlay />
				<Drawer.Content className={classes.drawerContent}>
					<form
						onSubmit={handleSubmit(
							(data) => siteUpdate.mutate({ id: '', data }),
							(error) => console.error(error)
						)}
					>
						<Drawer.Header>
							<Group noWrap position='apart' w='100%'>
								<Breadcrumb option='close' onClick={handler.close} />
							</Group>
						</Drawer.Header>
						<Drawer.Body>
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
					</form>
				</Drawer.Content>
			</Drawer.Root>
			<Stack>
				<Box component='button' onClick={handler.open} ref={ref} {...props} />
			</Stack>
		</>
	)
})
_WebsiteDrawer.displayName = 'WebsiteDrawer'

export const WebsiteDrawer = createPolymorphicComponent<'button', WebsiteDrawerProps>(_WebsiteDrawer)

interface WebsiteDrawerProps {
	id: string
}
