import {
	Autocomplete,
	Box,
	type ButtonProps,
	Checkbox,
	createPolymorphicComponent,
	createStyles,
	Divider,
	Drawer,
	Group,
	Radio,
	rem,
	Select,
	Stack,
	Text,
	TextInput,
	Title,
	UnstyledButton,
} from '@mantine/core'
import { ActionIcon } from '@mantine/core'
import { TimeInput } from '@mantine/dates'
import { useForm, zodResolver } from '@mantine/form'
import { useDebouncedValue, useDisclosure } from '@mantine/hooks'
import { IconClock } from '@tabler/icons-react'
import compact from 'just-compact'
import filterObject from 'just-filter-object'
import { useTranslation } from 'next-i18next'
import { forwardRef, useEffect, useRef, useState } from 'react'
import reactStringReplace from 'react-string-replace'
import timezones from 'timezones-list'
import { z } from 'zod'

import { title } from 'process'

import { type ApiOutput } from '@weareinreach/api'
import { boolOrNull, transformNullString } from '@weareinreach/api/schemas/common'
import { Breadcrumb } from '~ui/components/core/Breadcrumb'
import { Button } from '~ui/components/core/Button'
import { isExternal, Link } from '~ui/components/core/Link'
import { useCustomVariant } from '~ui/hooks/useCustomVariant'
import { useOrgInfo } from '~ui/hooks/useOrgInfo'
import { Icon } from '~ui/icon'
import { createWktFromLatLng } from '~ui/lib/geotools'
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
	unmatchedText: {
		...theme.other.utilityFonts.utility2,
		color: theme.other.colors.secondary.darkGray,
		display: 'block',
	},
	secondLine: { ...theme.other.utilityFonts.utility4, color: theme.other.colors.secondary.darkGray },
	matchedText: {
		color: theme.other.colors.secondary.black,
	},
	radioLabel: {
		...theme.other.utilityFonts.utility4,
	},
	radioButton: {
		height: rem(16),
		width: rem(16),
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
	return {
		...item,
		key: index,
		value: item.tzCode,
	}
})

const _HoursDrawer = forwardRef<HTMLButtonElement, HoursDrawerProps>(({ locationId, ...props }, ref) => {
	const [opened, handler] = useDisclosure(false)
	const [_search, setSearch] = useState<string>('')
	const [search] = useDebouncedValue(_search, 200)
	const [results, setResults] = useState<ApiOutput['geo']['autocomplete']['results']>()
	const [isSaved, setIsSaved] = useState(false)
	const form = useForm<FormSchema>({
		validate: zodResolver(FormSchema),
		initialValues: { id: '', data: { accessible: {} } },
		transformValues: FormSchema.transform(schemaTransform).parse,
	})
	const { id: organizationId, slug: orgSlug } = useOrgInfo()
	const { t } = useTranslation(['attribute', 'country', 'gov-dist'])
	const { classes, cx } = useStyles()
	const variants = useCustomVariant()
	const apiUtils = api.useContext()

	const timeRangeComponent = (title: string) => {
		// const ref = useRef(null)
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
							>
								Save
							</Button>
						</Group>
					</Drawer.Header>
					<Drawer.Body className={classes.drawerBody}>
						<Stack spacing={24} align='center'>
							<Title order={2}>Hours</Title>
							<Select
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
