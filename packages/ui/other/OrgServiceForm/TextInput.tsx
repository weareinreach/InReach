import {
	createStyles,
	Textarea,
	type TextareaProps,
	TextInput,
	type TextInputProps,
	type useMantineTheme,
} from '@mantine/core'

const useStyles = createStyles((theme) => ({
	...theme.other.utilityFonts,
	...theme.headings.sizes,
}))

const useFontSize = ({ fontSize, classNames }: SingleLineTextProps | MultiLineTextProps) => {
	const { classes } = useStyles()
	return {
		classNames,
		input: fontSize ? classes[fontSize as string] : undefined,
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
export const SingleLineTextField = ({ fontSize, ...props }: SingleLineTextProps) => {
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
export const MultiLineTextField = ({ fontSize, ...props }: MultiLineTextProps) => {
	const variant = useFontSize({ fontSize, ...props })

	return <Textarea {...props} classNames={variant} />
}

type headingSizes = keyof ReturnType<typeof useMantineTheme>['headings']['sizes']
type utilitySizes = keyof ReturnType<typeof useMantineTheme>['other']['utilityFonts']
type fontSize = headingSizes | utilitySizes

interface SingleLineTextProps extends TextInputProps {
	fontSize?: fontSize
}

interface MultiLineTextProps extends TextareaProps {
	fontSize?: fontSize
}
