import { Text } from '@mantine/core'
import { forwardRef, useContext } from 'react'
import reactStringReplace from 'react-string-replace'

import { FormContext } from './context'
import { useStyles } from './styles'

const matchText = (
	result: string,
	textToMatch: string | undefined | null,
	classes: ReturnType<typeof useStyles>['classes']
) => {
	if (!textToMatch) {
		return result
	}
	const matcher = new RegExp(`(${textToMatch})`, 'ig')
	const replaced = reactStringReplace(result, matcher, (match, i) => (
		<span key={i} className={classes.matchedText}>
			{match}
		</span>
	))
	return replaced
}

export const AutoCompleteItem = forwardRef<HTMLDivElement, AutocompleteItemProps>(
	({ value, subheading, placeId: _placeId, ...others }: AutocompleteItemProps, ref) => {
		const { classes, cx } = useStyles()
		const form = useContext(FormContext)
		if (!form) {
			return null
		}
		return (
			<div ref={ref} {...others}>
				<Text className={classes.unmatchedText} truncate>
					{matchText(value, form.values.data?.street1 ?? '', classes)}
				</Text>
				<Text className={cx(classes.unmatchedText, classes.secondLine)} truncate>
					{subheading}
				</Text>
			</div>
		)
	}
)
AutoCompleteItem.displayName = 'AutoCompleteItem'

export interface AutocompleteItemProps {
	value: string
	name?: string
	subheading?: string
	placeId?: string
}
