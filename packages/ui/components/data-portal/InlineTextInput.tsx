import {
	Box,
	createPolymorphicComponent,
	createStyles,
	rem,
	TextInput,
	type TextInputProps,
} from '@mantine/core'
import { forwardRef } from 'react'

const useStyles = createStyles((theme) => ({
	...theme.other.utilityFonts,
	...theme.other.headings,
}))
const useBaseStyles = createStyles((theme) => ({
	input: {
		// borderWidth: rem(1),
		border: `${rem(1)} dashed ${theme.other.colors.secondary.teal}`,
		backgroundColor: theme.fn.lighten(theme.other.colors.secondary.teal, 0.9),
		padding: `${rem(6)} ${rem(8)} !important`,
		height: 'unset',
		minHeight: 'unset',
		'&:focus, &:focus-within': {
			borderColor: theme.other.colors.secondary.black,
			borderWidth: rem(1),
			backgroundColor: theme.other.colors.secondary.white,
		},
		'&[data-isDirty=true]': {
			backgroundColor: theme.fn.lighten(theme.other.colors.secondary.teal, 0.6),
		},
	},
}))

const useFontSize = ({ fontSize, classNames }: InlineEditProps) => {
	const { classes } = useStyles()
	const { classes: baseClasses, cx } = useBaseStyles()
	const fontClass = fontSize ? classes[fontSize] : undefined
	return {
		...classNames,
		input: fontSize
			? cx(classNames?.input, fontClass, baseClasses.input)
			: cx(classNames?.input, baseClasses.input),
	}
}

const _InlineTextInput = forwardRef<HTMLInputElement, InlineEditProps>(
	({ fontSize, classNames, ...rest }, ref) => {
		const variant = useFontSize({ fontSize, ...rest })

		return <Box component={TextInput} classNames={variant} ref={ref} {...rest} />
	}
)
_InlineTextInput.displayName = 'InlineEdit'
export const InlineTextInput = createPolymorphicComponent<'input', InlineEditProps>(_InlineTextInput)

type FontStyles = ReturnType<typeof useStyles>['classes']
type FontSizes = keyof FontStyles

interface InlineEditProps extends TextInputProps {
	fontSize?: FontSizes
	/** Flag if background color should change to indicate that the field was edited */
	'data-isDirty'?: boolean
}
