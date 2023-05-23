import {
	createStyles,
	rem,
	Textarea,
	type TextareaProps,
	TextInput,
	type TextInputProps,
} from '@mantine/core'

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
		},
		'&[data-isDirty=true]': {
			backgroundColor: theme.other.colors.primary.lightGray,
		},
	},
}))

const useFontSize = ({ fontSize, classNames }: SingleLineTextProps | MultiLineTextProps) => {
	const { classes } = useStyles()
	const { classes: baseClasses, cx } = useBaseStyles()
	return {
		...classNames,
		input: fontSize ? cx(classes[fontSize], baseClasses.input) : baseClasses.input,
	}
}

/**
 * Components works like TextInput. To use one of the variant fonts pass a string like 'h1', 'h2', 'utility1',
 * etc to the fontSize prop.
 *
 * @param props - TextInputProps
 * @param props.fontSize - HeadingSizes | utilitySizes
 * @returns JSX.Element
 */
export const InlineTextInput = ({ fontSize, ...props }: SingleLineTextProps) => {
	const variant = useFontSize({ fontSize, ...props })

	return <TextInput {...props} classNames={variant} />
}

/**
 * Component works like Textarea. To use one of the variant fonts pass a string like 'h1', 'h2', 'utility1',
 * etc to the fontSize prop.
 *
 * @param props - TextareaProps
 * @param props.fontSize - HeadingSizes | utilitySizes
 * @returns JSX.Element
 */
export const InlineTextarea = ({ fontSize, ...props }: MultiLineTextProps) => {
	const variant = useFontSize({ fontSize, ...props })

	return <Textarea {...props} classNames={variant} />
}

type FontSizes = keyof ReturnType<typeof useStyles>['classes']

interface SingleLineTextProps extends TextInputProps {
	fontSize?: FontSizes
	/** Flag if background color should change to indicate that the field was edited */
	'data-isDirty'?: boolean
}

interface MultiLineTextProps extends TextareaProps {
	fontSize?: FontSizes
	'data-isDirty'?: boolean
}
