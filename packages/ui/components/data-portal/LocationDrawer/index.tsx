import { zodResolver } from '@hookform/resolvers/zod'
import { Box, Drawer, Group, Stack, Title } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { useForm } from 'react-hook-form'
import { Checkbox, TextInput } from 'react-hook-form-mantine'

import { type TCreateSchema, ZCreateSchema } from '@weareinreach/api/router/location/mutation.create.schema'
import { Breadcrumb } from '~ui/components/core/Breadcrumb'
import { Button } from '~ui/components/core/Button'
import { Icon } from '~ui/icon'

export const LocationDrawer = () => {
	const [drawerOpened, drawerHandler] = useDisclosure(false)
	const form = useForm<TCreateSchema>({
		resolver: zodResolver(ZCreateSchema),
	})

	return (
		<>
			<Drawer.Root onClose={drawerHandler.close} opened={drawerOpened} position='right'>
				<Drawer.Overlay />
				<Drawer.Content>
					<Drawer.Header>
						<Group noWrap position='apart' w='100%'>
							<Breadcrumb option='close' onClick={drawerHandler.close} />
							<Button
								variant='primary-icon'
								leftIcon={<Icon icon={isSaved ? 'carbon:checkmark' : 'carbon:save'} />}
								onClick={handleUpdate}
								loading={updateLocation.isLoading}
								disabled={!form.isDirty()}
							>
								Save
							</Button>
						</Group>
					</Drawer.Header>
					<Drawer.Body>
						<Stack spacing={24} align='center'>
							<Title order={2}>Add new location</Title>

							<TextInput label='Display name' required control={form.control} name='name' />

							<Checkbox label='This location is NOT visitable' control={form.control} name='notVisitable' />
						</Stack>
					</Drawer.Body>
				</Drawer.Content>
			</Drawer.Root>
			<Box component={Button} onClick={drawerHandler.open} />
		</>
	)
}
