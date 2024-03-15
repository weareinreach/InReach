import {
	type CheckboxGroupProps as $CheckboxGroupProps,
	Checkbox,
	createStyles,
	Group,
	LoadingOverlay,
	Popover,
	rem,
	ScrollArea,
	Text,
	UnstyledButton,
} from '@mantine/core'
import { useDisclosure, useListState } from '@mantine/hooks'
import compare from 'just-compare'
import { type CSSProperties, useCallback, useEffect, useMemo } from 'react'
import { type FieldValues, useController, type UseControllerProps, useWatch } from 'react-hook-form'

import { Icon } from '~ui/icon'

import { useStyles } from './styles'

export const MultiSelectPopover = <T extends FieldValues>({
	name,
	control,
	defaultValue,
	rules,
	shouldUnregister,
	onChange,
	data,
	label,
	style,
	labelClassName,
	fullWidth,
	indicateWhenDirty,
	...props
}: MultiSelectPopoverProps<T>) => {
	const {
		field: { value, onChange: fieldOnChange, ...field },
		fieldState,
	} = useController<T>({
		name,
		control,
		defaultValue,
		rules,
		shouldUnregister,
	})
	const selectedItems = useWatch({ name, control })
	const selected = selectedItems?.length ?? 0

	const [opened, menuHandler] = useDisclosure()
	const { classes, cx } = useStyles({ selectedCount: selected, dimmed: Boolean(labelClassName) })

	const selectedCountIcon = <Text className={classes.count}>{selected}</Text>

	return (
		<>
			<Popover
				opened={opened}
				onClose={() => {
					menuHandler.close()
				}}
				trapFocus
				withinPortal
			>
				<LoadingOverlay visible={data === undefined} />
				<Popover.Target>
					<UnstyledButton
						onClick={menuHandler.toggle}
						className={cx({ [classes.button]: true, [classes.indicateDirty]: indicateWhenDirty })}
						style={style}
						w={fullWidth ? '100%' : undefined}
						data-isDirty={fieldState.isDirty}
					>
						<Group noWrap position='apart' spacing={16}>
							<Group noWrap spacing={8}>
								{selectedCountIcon}
								<Text style={{ display: 'inline-block' }} className={labelClassName}>
									{label}
								</Text>
							</Group>
							<Icon icon={opened ? 'carbon:chevron-up' : 'carbon:chevron-down'} height={24} />
						</Group>
					</UnstyledButton>
				</Popover.Target>
				<Popover.Dropdown>
					<ScrollArea.Autosize
						mah={250}
						placeholder={null}
						// TODO: Typescript wants these two properties all of a sudden -- why?
						onPointerEnterCapture={undefined}
						onPointerLeaveCapture={undefined}
					>
						<Checkbox.Group
							error={fieldState.error?.message}
							value={value}
							label={label}
							onChange={(e) => {
								fieldOnChange(e)
								onChange?.(e)
							}}
							{...field}
						>
							{data?.map((props, index) => <Checkbox key={props.value} {...props} />)}
						</Checkbox.Group>
					</ScrollArea.Autosize>
				</Popover.Dropdown>
			</Popover>
		</>
	)
}
//)
MultiSelectPopover.displayName = 'MultiSelectPopover (hook form)'
export interface MultiSelectPopoverProps<T extends FieldValues> extends UseControllerProps<T> {
	data?: {
		value: string
		label: string
		[k: string]: string
	}[]
	label: string
	value?: string[]
	onChange?: (value: string[]) => void
	style?: CSSProperties
	labelClassName?: string
	fullWidth?: boolean
	indicateWhenDirty?: boolean
}
