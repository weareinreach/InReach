import {
	Checkbox,
	type CheckboxGroupProps,
	createStyles,
	Group,
	Popover,
	rem,
	ScrollArea,
	Text,
	UnstyledButton,
} from '@mantine/core'
import { type UseFormReturnType } from '@mantine/form'
import { useDisclosure } from '@mantine/hooks'
import { forwardRef, useState } from 'react'

import { Icon } from '~ui/icon'

const useStyles = createStyles((theme) => ({
	count: {
		...theme.other.utilityFonts.utility1,
		background: theme.other.colors.secondary.black,
		borderRadius: '100%',
		color: theme.other.colors.secondary.white,
		width: rem(24),
		height: rem(24),
		textAlign: 'center',
		display: 'inline-block',
		verticalAlign: 'center',
		lineHeight: 1.5,
	},
	button: {
		padding: `${rem(14)} ${rem(16)}`,
		backgroundColor: theme.other.colors.secondary.white,
		borderRadius: rem(8),
		border: `${theme.other.colors.tertiary.coolGray} ${rem(1)} solid`,
		height: rem(48),
	},
}))

export const MultiSelectPopover = forwardRef<HTMLDivElement, MultiSelectPopoverProps>(
	({ checkboxGroupProps, data, label, useFormContextHook, formField, ...props }, ref) => {
		const [opened, handler] = useDisclosure(false)
		const [selected, setSelected] = useState(checkboxGroupProps?.value?.length ?? 0)
		const { classes } = useStyles()
		const { onChange, ...rest } = checkboxGroupProps ?? {}

		const selectedCountIcon = <Text className={classes.count}>{selected}</Text>
		const form = useFormContextHook()

		return (
			<>
				<Popover
					opened={opened}
					onClose={handler.close}
					withinPortal
					// middlewares={{ inline: true, flip: true, shift: true }}
				>
					<Popover.Target popupType='listbox'>
						<UnstyledButton onClick={handler.toggle} className={classes.button}>
							<Group noWrap position='apart' spacing={16}>
								<Group noWrap spacing={8}>
									{selectedCountIcon}
									<Text style={{ display: 'inline-block' }}>{label}</Text>
								</Group>
								<Icon icon={opened ? 'carbon:chevron-up' : 'carbon:chevron-down'} height={24} />
							</Group>
						</UnstyledButton>
					</Popover.Target>
					<Popover.Dropdown>
						<ScrollArea.Autosize mah={250}>
							<Checkbox.Group
								ref={ref}
								{...form.getInputProps(formField)}
								onChange={(val) => {
									setSelected(val.length)
									form.getInputProps(formField).onChange(val)
								}}
								{...rest}
							>
								{data.map(({ value, label }) => (
									<Checkbox key={value} {...{ value, label }} />
								))}
							</Checkbox.Group>
						</ScrollArea.Autosize>
					</Popover.Dropdown>
				</Popover>
			</>
		)
	}
)
MultiSelectPopover.displayName = 'MultiSelectPopover'
interface MultiSelectPopoverProps {
	checkboxGroupProps?: Omit<CheckboxGroupProps, 'children'>
	data: {
		value: string
		label: string
		[k: string]: string
	}[]
	label: string
	useFormContextHook: () => UseFormReturnType<any>
	formField: string
}
