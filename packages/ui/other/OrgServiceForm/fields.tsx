import {
	TextInput,
	TextInputProps,
	Textarea,
	TextareaProps,
	createStyles,
	useMantineTheme,
} from '@mantine/core'

import { useEditFormContext } from './context'

const useStyles = createStyles((theme) => ({
	...theme.other.utilityFonts,
	...(theme.headings.sizes as any),
}))

export const SingleLineTextField = ({ tContext, fieldName, fontSize, ...props }: SingleLineTextProps) => {
	const form = useEditFormContext()
	const { classes } = useStyles()
	const classNames = {
		...props.classNames,
		input: fontSize ? classes[fontSize] : undefined,
	}

	return <TextInput {...props} {...form.getInputProps(fieldName)} classNames={classNames} />
}

export const MultiLineTextField = ({ tContext, fieldName, ...props }: MultiLineTextProps) => {
	const form = useEditFormContext()

	return <Textarea {...props} {...form.getInputProps(fieldName)} />
}

type headingSizes = keyof ReturnType<typeof useMantineTheme>['headings']['sizes']
type utilitySizes = keyof ReturnType<typeof useMantineTheme>['other']['utilityFonts']

type TextField = {
	tContext: string
	fieldName: string
}

interface SingleLineTextProps extends TextInputProps, TextField {
	fontSize?: headingSizes | utilitySizes
}

interface MultiLineTextProps extends TextareaProps, TextField {}
