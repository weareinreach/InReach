import { Checkbox, createStyles, Group, Popover, rem, ScrollArea, Text, UnstyledButton } from '@mantine/core'
import { useDisclosure, useListState } from '@mantine/hooks'
import compare from 'just-compare'
import { useCallback, useEffect, useMemo } from 'react'

import { Icon } from '~ui/icon'

const useStyles = createStyles((theme, { selectedCount }: { selectedCount: number }) => ({
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
		opacity: selectedCount < 1 ? 0 : 1,
	},
	button: {
		padding: `${rem(14)} ${rem(16)}`,
		backgroundColor: theme.other.colors.secondary.white,
		borderRadius: rem(8),
		border: `${theme.other.colors.tertiary.coolGray} ${rem(1)} solid`,
		height: rem(48),
	},
}))

export const MultiSelectPopover = ({ data, label, value, onChange }: MultiSelectPopoverProps) => {
	const [opened, menuHandler] = useDisclosure()
	const initialItems = data.map((item) => ({ ...item, checked: value?.includes(item.value) ?? false }))
	const [items, itemHandlers] = useListState(initialItems)
	const selected = items.filter(({ checked }) => checked).length
	const { classes } = useStyles({ selectedCount: selected })

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

	useEffect(() => {
		handleChange()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [currentValues])

	return (
		<>
			<Popover opened={opened} onClose={menuHandler.close}>
				<Popover.Target>
					<UnstyledButton onClick={menuHandler.toggle} className={classes.button}>
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
	data: {
		value: string
		label: string
		[k: string]: string
	}[]
	label: string
	value?: string[]
	onChange?: (value: string[]) => void
}
