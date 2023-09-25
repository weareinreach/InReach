import { Group, Text } from '@mantine/core'
import { type ComponentPropsWithoutRef, forwardRef } from 'react'

import { type ApiOutput } from '@weareinreach/api'

export const CountrySelectItem = forwardRef<HTMLDivElement, CountrySelectItem>(
	({ data, value, label, ...props }, ref) => {
		const { name } = data
		return (
			<Group ref={ref} {...props} w='100%' noWrap>
				<Text>{label}</Text>
				<Text>{name}</Text>
			</Group>
		)
	}
)
CountrySelectItem.displayName = 'CountrySelectItem'

type CountryList = ApiOutput['fieldOpt']['countries']
export interface CountrySelectItem extends ComponentPropsWithoutRef<'div'> {
	label: string
	value: string
	data: Pick<CountryList[number], 'name' | 'cca2'>
}
