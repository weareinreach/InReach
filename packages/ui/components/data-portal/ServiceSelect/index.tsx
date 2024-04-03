import { Box, type BoxProps, createStyles, Drawer, Group, rem, Stack, Title } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { useTranslation } from 'next-i18next'
import { type FieldValues, type UseControllerProps, useFormState } from 'react-hook-form'
import { Checkbox } from 'react-hook-form-mantine'

import { Breadcrumb } from '~ui/components/core/Breadcrumb'
import { trpc as api } from '~ui/lib/trpcClient'

const useStyles = createStyles((theme) => ({
	drawerContent: {
		borderRadius: `${rem(32)} 0 0 0`,
		minWidth: '40vw',
	},
	checkboxLabel: theme.other.utilityFonts.utility2,
	box: {
		backgroundColor: theme.fn.lighten(theme.other.colors.secondary.teal, 0.9),
		width: '100%',
		padding: rem(8),
		// margin: rem(-8),
		borderRadius: rem(8),
		'&[data-isDirty=true]': {
			backgroundColor: theme.fn.lighten(theme.other.colors.secondary.teal, 0.6),
		},
		...theme.fn.hover({ cursor: 'pointer' }),
	},
}))
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
	const { classes } = useStyles()
	const { t } = useTranslation('services')
	const form = useFormState({ control, name })

	const serviceGroups = data ? (
		<Checkbox.Group {...{ name, control, defaultValue, rules, shouldUnregister }}>
			<Stack spacing={16}>
				{data.map((category) => (
					<Stack spacing={8} key={category.tsKey}>
						<Title order={3}>{t(category.tsKey)}</Title>
						<Stack spacing={0}>
							{category.services.map((service) => (
								<Checkbox.Item
									pl={16}
									size='xs'
									key={`${category.tsKey}-${service.id}`}
									value={service.id}
									label={t(service.tsKey)}
									classNames={{
										label: classes.checkboxLabel,
									}}
								/>
							))}
						</Stack>
					</Stack>
				))}
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
						<Group noWrap position='apart' w='100%'>
							<Breadcrumb option='close' onClick={handler.close} />
						</Group>
					</Drawer.Header>
					<Drawer.Body>
						<Stack align='center' pt={40} spacing={40}>
							<Title order={2}>Select Service Tags</Title>
							{serviceGroups}
						</Stack>
					</Drawer.Body>
				</Drawer.Content>
			</Drawer.Root>
			<Box onClick={handler.open} className={classes.box} data-isDirty={form.isDirty} {...props} />
		</>
	)
}

export interface ServiceSelectProps<T extends FieldValues> extends UseControllerProps<T>, BoxProps {}
