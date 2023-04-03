import {
	Box,
	PasswordInput,
	Popover,
	Progress,
	TextInput,
	Checkbox,
	NumberInput,
	useMantineTheme,
	Text,
	Select,
	Stack,
	Autocomplete,
	createStyles,
	rem,
} from '@mantine/core'
import { useDebouncedValue } from '@mantine/hooks'
import { attributesByCategory } from '@weareinreach/api/generated/attributesByCategory'
import { languageList } from '@weareinreach/api/generated/languages'
import { useTranslation } from 'next-i18next'
import { ComponentPropsWithRef, forwardRef, useState } from 'react'
import { number } from 'zod'

import { useCustomVariant } from '~ui/hooks'
import { Icon } from '~ui/icon'
import { trpc as api } from '~ui/lib/trpcClient'

import { useUserSurveyFormContext } from './context'

const useLocationStyles = createStyles((theme) => ({
	autocompleteWrapper: {
		padding: 0,
		borderBottom: `${rem(1)} solid ${theme.other.colors.tertiary.coolGray}`,
	},
}))

const useSelectItemStyles = createStyles((theme) => ({
	singleLine: {
		borderBottom: `${rem(1)} solid ${theme.other.colors.tertiary.coolGray}`,
		padding: `${theme.spacing.sm} ${theme.spacing.xl}`,
		alignItems: 'center',
		'&:hover': {
			backgroundColor: theme.other.colors.primary.lightGray,
			cursor: 'pointer',
		},
		'&:last-child': {
			borderBottom: 'none',
		},
	},
	twoLines: {
		padding: `${theme.spacing.sm} ${theme.spacing.xl}`,
		'&:hover': {
			backgroundColor: theme.other.colors.primary.lightGray,
			cursor: 'pointer',
		},
	},
}))

const useStyles = createStyles((theme) => ({
	answerContainer: {
		height: '336px',
	},
}))

const SelectItemSingleLine = forwardRef<HTMLDivElement, SingleItemSelectProps>(
	({ label, ...others }, ref) => {
		const variants = useCustomVariant()
		const { classes } = useSelectItemStyles()
		return (
			<div className={classes.singleLine} ref={ref} {...others}>
				<Text variant={variants.Text.utility2}>{label}</Text>
			</div>
		)
	}
)
SelectItemSingleLine.displayName = 'Selection Item'

const SelectItemTwoLines = forwardRef<HTMLDivElement, ItemProps>(({ label, description, ...others }, ref) => {
	const variants = useCustomVariant()
	const { classes } = useSelectItemStyles()
	return (
		<Stack ref={ref} spacing={4} {...others} className={classes.twoLines}>
			<Text variant={variants.Text.utility1}>{label}</Text>
			<Text variant={variants.Text.utility4darkGray}>{description}</Text>
		</Stack>
	)
})
SelectItemTwoLines.displayName = 'Selection Item'

export const FormBirthyear = () => {
	const { t } = useTranslation('common')
	const { classes } = useStyles()
	const form = useUserSurveyFormContext()
	const theme = useMantineTheme()

	const maxYear = new Date().getFullYear()
	const minYear = maxYear - 100

	return (
		<NumberInput
			className={classes.answerContainer}
			label={t('survey.question-5-label')}
			defaultValue=''
			hideControls
			min={minYear}
			max={maxYear}
			placeholder={t('survey.question-5-placeholder') as string}
			{...form.getInputProps('birthYear')}
			error={t('survey.birthyear-req-value', { year1: minYear, year2: maxYear }) as string}
		/>
	)
}

interface ItemProps extends ComponentPropsWithRef<'div'> {
	label: string
	description: string
}

type SingleItemSelectProps = {
	value: string
	label: string
	placeId?: string
}
