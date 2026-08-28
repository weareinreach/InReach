import { Box, createPolymorphicComponent, TextInput, type TextInputProps } from '@mantine/core'
import { forwardRef } from 'react'

import { cx } from '~ui/lib/cx'

import classes from './InlineTextInput.module.css'

const useFontSize = ({ fontSize, classNames }: InlineEditProps) => {
	const fontClass = fontSize ? classes[fontSize] : undefined
	// `classNames` can be the theme-callback form here, but this component is only ever given a
	// plain object - narrow past the function form rather than supporting it.
	const inputClassNames = typeof classNames === 'function' ? undefined : classNames
	return {
		...inputClassNames,
		input: fontSize
			? cx(inputClassNames?.input, fontClass, classes.input)
			: cx(inputClassNames?.input, classes.input),
	}
}

const _InlineTextInput = forwardRef<HTMLInputElement, InlineEditProps>(
	({ fontSize, classNames: _classNames, ...rest }, ref) => {
		const variant = useFontSize({ fontSize, ...rest })

		return <Box component={TextInput} classNames={variant} ref={ref} {...rest} />
	}
)
_InlineTextInput.displayName = 'InlineEdit'
export const InlineTextInput = createPolymorphicComponent<'input', InlineEditProps>(_InlineTextInput)

type FontSizes = 'utility1' | 'utility2' | 'utility3' | 'utility4' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'

interface InlineEditProps extends TextInputProps {
	fontSize?: FontSizes
	/** Flag if background color should change to indicate that the field was edited */
	'data-isdirty'?: boolean
}
