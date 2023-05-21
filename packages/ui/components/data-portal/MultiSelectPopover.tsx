import {
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

import { Icon } from '~ui/icon'

const useStyles = createStyles(
	(theme, { selectedCount, dimmed }: { selectedCount: number; dimmed: boolean }) => ({
		count: {
			...theme.other.utilityFonts.utility1,
			background: dimmed ? theme.other.colors.secondary.darkGray : theme.other.colors.secondary.black,
			borderRadius: '100%',
			color: theme.other.colors.secondary.white,
			width: rem(24),
			height: rem(24),
			textAlign: 'center',
			display: 'inline-block',
			verticalAlign: 'center',
			lineHeight: 1.5,
			opacity: selectedCount < 1 ? 0 : 1,
		},
		button: {
			padding: `${rem(14)} ${rem(16)}`,
			backgroundColor: theme.other.colors.secondary.white,
			borderRadius: rem(8),
			border: `${theme.other.colors.tertiary.coolGray} ${rem(1)} solid`,
			height: rem(48),
		},
	})
)

export const MultiSelectPopover = ({
	data,
	label,
	value,
	style,
	labelClassName,
	onChange,
	fullWidth,
}: MultiSelectPopoverProps) => {
	const [opened, menuHandler] = useDisclosure()
	const initialItems = useMemo(
		() => data?.map((item) => ({ ...item, checked: value?.includes(item.value) ?? false })) ?? [],
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[data]
	)

	const [items, itemHandlers] = useListState(initialItems)
	useEffect(() => {
		if (items.length === 0 && initialItems.length !== 0) {
			itemHandlers.setState(initialItems)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [initialItems])

	const selected = items.filter(({ checked }) => checked).length

	const { classes, cx } = useStyles({ selectedCount: selected, dimmed: Boolean(labelClassName) })

	const selectedCountIcon = <Text className={classes.count}>{selected}</Text>

	const currentValues = useMemo(
		() => items.filter(({ checked }) => checked).map(({ value }) => value),
		[items]
	)

	const handleChange = useCallback(() => {
		if (typeof onChange === 'function' && !compare(value?.sort(), currentValues.sort())) {
			onChange(currentValues)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [currentValues, value])

	return (
		<>
			<Popover
				opened={opened}
				onClose={() => {
					menuHandler.close()
					handleChange()
				}}
				trapFocus
				withinPortal
			>
				<LoadingOverlay visible={data === undefined} />
				<Popover.Target>
					<UnstyledButton
						onClick={menuHandler.toggle}
						className={classes.button}
						style={style}
						w={fullWidth ? '100%' : undefined}
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
					<ScrollArea.Autosize mah={250}>
						{items.map((props, index) => (
							<Checkbox
								key={props.value}
								{...props}
								onChange={(e) => itemHandlers.setItemProp(index, 'checked', e.currentTarget.checked)}
							/>
						))}
					</ScrollArea.Autosize>
				</Popover.Dropdown>
			</Popover>
		</>
	)
}
//)
MultiSelectPopover.displayName = 'MultiSelectPopover'
export interface MultiSelectPopoverProps {
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
}
