import { Text } from '@mantine/core'
import { forwardRef } from 'react'

export const CountryItem = forwardRef<HTMLDivElement, CountryItemProps>(({ label, flag, ...props }, ref) => {
	return (
		<div ref={ref} {...props}>
			<Text>{`${flag} ${label}`}</Text>
		</div>
	)
})
CountryItem.displayName = 'CountryItem'

export interface CountryItemProps {
	value: string
	label: string
	flag: string
}
