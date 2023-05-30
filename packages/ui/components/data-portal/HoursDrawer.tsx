import {
	ActionIcon,
	Box,
	type ButtonProps,
	Checkbox,
	createPolymorphicComponent,
	createStyles,
	Divider,
	Drawer,
	Group,
	rem,
	Select,
	Stack,
	Text,
	Title,
	UnstyledButton,
} from '@mantine/core'
import { TimeInput } from '@mantine/dates'
import { useDebouncedValue, useDisclosure } from '@mantine/hooks'
import { IconClock } from '@tabler/icons-react'
import { forwardRef, useEffect, useRef, useState } from 'react'
import timezones from 'timezones-list'
import { z } from 'zod'

import { type ApiOutput } from '@weareinreach/api'
import { Breadcrumb } from '~ui/components/core/Breadcrumb'
import { Button } from '~ui/components/core/Button'
import { useCustomVariant } from '~ui/hooks/useCustomVariant'
import { useOrgInfo } from '~ui/hooks/useOrgInfo'
import { Icon } from '~ui/icon'
import { trpc as api } from '~ui/lib/trpcClient'

const useStyles = createStyles((theme) => ({
	drawerContent: {
		borderRadius: `${rem(32)} 0 0 0`,
		minWidth: '40vw',
	},
	drawerBody: {
		padding: `${rem(40)} ${rem(32)}`,
		'&:not(:only-child)': {
			paddingTop: rem(40),
		},
	},
	addNewButton: {
		width: '100%',
		border: `${rem(1)} dashed ${theme.other.colors.secondary.teal}`,
		borderRadius: rem(8),
		padding: rem(12),
	},
	addNewText: {
		color: theme.other.colors.secondary.teal,
	},
}))

const FormSchema = z.object({
	id: z.string(),
	data: z
		.object({
			tz: z.string().nullable(),
			dayIndex: z.coerce.number().nullable(),
			start: z.coerce.date().nullable(),
			end: z.coerce.date().nullable(),
		})
		.partial(),
})

const schemaTransform = ({ id, data }: FormSchema) => ({
	id,
	data: {
		...data,
	},
})

const timezoneData = timezones.map((item, index) => {
	const { tzCode, ...rest } = item
	return {
		...rest,
		key: index,
		value: tzCode,
	}
})

const _HoursDrawer = forwardRef<HTMLButtonElement, HoursDrawerProps>(({ locationId, ...props }, ref) => {
	const [opened, handler] = useDisclosure(false)
	const [isSaved, setIsSaved] = useState(false)
	const [tzValue, setTzValue] = useState<string | null>(null)
	const { classes } = useStyles()
	const variants = useCustomVariant()

	const handleUpdate = () => {
		console.log(tzValue)
	}

	const timeRangeComponent = (title: string) => {
		return (
			<Stack>
				<Title order={3}>{title}</Title>
				<Group>
					<TimeInput
						label='Open time'
						ref={ref}
						rightSection={
							<ActionIcon onClick={() => ref.current.showPicker()}>
								<IconClock size='1rem' stroke={1.5} />
							</ActionIcon>
						}
						maw={200}
						mx='auto'
					/>
					<TimeInput
						label='Close time'
						ref={ref}
						rightSection={
							<ActionIcon onClick={() => ref.current.showPicker()}>
								<IconClock size='1rem' stroke={1.5} />
							</ActionIcon>
						}
						maw={200}
						mx='auto'
					/>
					<Checkbox value='1' checked={false} label='Open 24 Hours' />
				</Group>
				<UnstyledButton className={classes.addNewButton}>
					<Group noWrap spacing={8}>
						<Icon icon='carbon:add' className={classes.addNewText} height={24} />
						<Text variant={variants.Text.utility2} className={classes.addNewText}>
							Add time range
						</Text>
					</Group>
				</UnstyledButton>
				<Divider my='sm' />
			</Stack>
		)
	}

	return (
		<>
			<Drawer.Root onClose={handler.close} opened={opened} position='right'>
				<Drawer.Overlay />
				<Drawer.Content className={classes.drawerContent}>
					<Drawer.Header>
						<Group noWrap position='apart' w='100%'>
							<Breadcrumb option='close' onClick={handler.close} />
							<Button
								variant='primary-icon'
								leftIcon={<Icon icon={isSaved ? 'carbon:checkmark' : 'carbon:save'} />}
								onClick={handleUpdate}
							>
								Save
							</Button>
						</Group>
					</Drawer.Header>
					<Drawer.Body className={classes.drawerBody}>
						<Stack spacing={24} align='center'>
							<Title order={2}>Hours</Title>
							<Select
								value={tzValue}
								onChange={setTzValue}
								label='Select a timezone for this location'
								placeholder='Search for timezone'
								searchable
								nothingFound='No options'
								maxDropdownHeight={280}
								data={timezoneData}
							/>
							<Divider my='sm' />
						</Stack>
						{timeRangeComponent('Sunday')}
						{timeRangeComponent('Monday')}
						{timeRangeComponent('Tuesday')}
						{timeRangeComponent('Wednesday')}
						{timeRangeComponent('Thursday')}
						{timeRangeComponent('Friday')}
						{timeRangeComponent('Saturday')}
					</Drawer.Body>
				</Drawer.Content>
			</Drawer.Root>

			<Stack>
				<Box component='button' onClick={handler.open} ref={ref} {...props} />
			</Stack>
		</>
	)
})
_HoursDrawer.displayName = 'HoursDrawer'
export const HoursDrawer = createPolymorphicComponent<'button', HoursDrawerProps>(_HoursDrawer)

interface HoursDrawerProps extends ButtonProps {
	locationId?: string
}

type FormSchema = z.infer<typeof FormSchema>
