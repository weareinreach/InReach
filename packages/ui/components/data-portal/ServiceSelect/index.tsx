import { Box, type BoxProps, Drawer, Group, Stack, Title } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { useTranslation } from 'next-i18next/pages'
import { type ReactNode } from 'react'
import { type FieldValues, type UseControllerProps, useFormState } from 'react-hook-form'
import { Checkbox } from 'react-hook-form-mantine'

import { Breadcrumb } from '~ui/components/core/Breadcrumb'
import { Icon } from '~ui/icon'
import { trpc as api } from '~ui/lib/trpcClient'

import classes from './index.module.css'

export const ServiceSelect = <T extends FieldValues>({
	name,
	control,
	defaultValue,
	rules,
	shouldUnregister,
	...props
}: ServiceSelectProps<T>) => {
	const [opened, handler] = useDisclosure(false)
	const { data } = api.component.ServiceSelect.useQuery()
	const { t } = useTranslation('services')
	const form = useFormState({ control, name })

	const serviceGroups = data ? (
		<Checkbox.Group {...{ name, control, defaultValue, rules, shouldUnregister }}>
			<Stack gap={16}>
				{data.map((category) => {
					if (category.services.length === 0) {
						return null
					}
					return (
						<Stack gap={8} key={category.tsKey}>
							<Group>
								<Title order={3}>{t(category.tsKey)}</Title>
								{!category.active && <Icon icon='carbon:view-off' />}
							</Group>
							<Stack gap={0}>
								{category.services.map((service) => (
									<Checkbox.Item
										pl={16}
										size='xs'
										key={`${category.tsKey}-${service.id}`}
										value={service.id}
										label={
											<Group>
												{t(service.tsKey)} {!service.active && <Icon icon='carbon:view-off' />}
											</Group>
										}
										classNames={{
											label: classes.checkboxLabel,
										}}
									/>
								))}
							</Stack>
						</Stack>
					)
				})}
			</Stack>
		</Checkbox.Group>
	) : null

	return (
		<>
			<Drawer.Root
				onClose={handler.close}
				opened={opened}
				position='right'
				zIndex={10001}
				keepMounted={false}
			>
				<Drawer.Overlay />
				<Drawer.Content className={classes.drawerContent}>
					<Drawer.Header>
						<Group wrap='nowrap' justify='space-between' w='100%'>
							<Breadcrumb option='close' onClick={handler.close} />
						</Group>
					</Drawer.Header>
					<Drawer.Body>
						<Stack align='center' pt={40} gap={40}>
							<Title order={2}>Select Service Tags</Title>
							{serviceGroups}
						</Stack>
					</Drawer.Body>
				</Drawer.Content>
			</Drawer.Root>
			<Box onClick={handler.open} className={classes.box} data-isdirty={form.isDirty} {...props} />
		</>
	)
}

export interface ServiceSelectProps<T extends FieldValues> extends UseControllerProps<T>, BoxProps {
	children?: ReactNode
}
