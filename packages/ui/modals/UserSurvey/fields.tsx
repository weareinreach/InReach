import {
	Box,
	TextInput,
	Checkbox,
	NumberInput,
	Radio,
	ScrollArea,
	useMantineTheme,
	Title,
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
import { trpc as api } from '~ui/lib/trpcClient'

import { useUserSurveyFormContext } from './context'

const useStyles = createStyles((theme) => ({
	answerContainer: {
		height: '336px',
	},
	scroll: {
		width: '100%',
	},
}))

export const TitleSubtitle = (t1: string, t2: string) => {
	const variants = useCustomVariant()
	const { t } = useTranslation('common')

	return (
		<>
			<Title order={2}>{t(t1)}</Title>
			<Text variant={variants.Text.darkGray}>{t(t2)}</Text>
		</>
	)
}

//immigration component start
export const FormImmigration = () => {
	const { data: surveyOptions, status } = api.user.surveyOptions.useQuery()
	const { t } = useTranslation('common')
	const { classes } = useStyles()
	const form = useUserSurveyFormContext()

	return (
		<>
			{TitleSubtitle('survey.question-1-title', 'survey.question-subtitle')}
			<ScrollArea h={336} offsetScrollbars className={classes.scroll}>
				<Radio.Group value='selected' className={classes.answerContainer}>
					{surveyOptions?.immigration.map((item, index) => {
						return (
							<Radio
								label={t(item.tsKey, { ns: 'user' })}
								key={item.id}
								value={item.id}
								// {...form.getInputProps(`${categoryId}.${index}.checked`, { type: 'checkbox' })}
							/>
						)
					})}
				</Radio.Group>
			</ScrollArea>
		</>
	)
}
//immigration component end

//countries component start
export const FormCountries = () => {
	const { data: surveyOptions, status } = api.user.surveyOptions.useQuery()
	const { t } = useTranslation('common')
	const { classes } = useStyles()
	const form = useUserSurveyFormContext()

	return (
		<>
			{TitleSubtitle('survey.question-2-title', 'survey.question-subtitle')}
			<ScrollArea h={336} offsetScrollbars className={classes.scroll}>
				<Radio.Group value='selected' className={classes.answerContainer}>
					<Stack>
						{surveyOptions?.countries.map((item, index) => {
							return (
								<Radio
									label={t(item.tsKey, { ns: 'user' })}
									key={item.id}
									value={item.id}
									// {...form.getInputProps(`${categoryId}.${index}.checked`, { type: 'checkbox' })}
								/>
							)
						})}
					</Stack>
				</Radio.Group>
			</ScrollArea>
		</>
	)
}
//countries component end

//identity component start
export const FormIdentity = () => {
	const { data: surveyOptions, status } = api.user.surveyOptions.useQuery()
	const { t } = useTranslation('common')
	const { classes } = useStyles()
	const form = useUserSurveyFormContext()

	return (
		<>
			{TitleSubtitle('survey.question-3-title', 'survey.question-subtitle')}
			<ScrollArea h={336} offsetScrollbars className={classes.scroll}>
				<Checkbox.Group className={classes.answerContainer}>
					{surveyOptions?.sog.map((item, index) => {
						return (
							<Checkbox
								value={item.id}
								checked={false}
								label={t(item.tsKey, { ns: 'user' })}
								key={item.id}

								// {...form.getInputProps(`${categoryId}.${index}.checked`, { type: 'checkbox' })}
							/>
						)
					})}
				</Checkbox.Group>
			</ScrollArea>
		</>
	)
}
//identify component end

//ethnicity component start
export const FormEthnicity = () => {
	const { data: surveyOptions, status } = api.user.surveyOptions.useQuery()
	const { t } = useTranslation('common')
	const { classes } = useStyles()
	const form = useUserSurveyFormContext()

	return (
		<>
			{TitleSubtitle('survey.question-4-title', 'survey.question-subtitle')}
			<ScrollArea h={336} offsetScrollbars className={classes.scroll}>
				<Checkbox.Group className={classes.answerContainer}>
					{surveyOptions?.ethnicity.map((item, index) => {
						return (
							<Checkbox
								value={item.id}
								checked={false}
								label={t(item.tsKey, { ns: 'user' })}
								key={item.id}

								// {...form.getInputProps(`${categoryId}.${index}.checked`, { type: 'checkbox' })}
							/>
						)
					})}
				</Checkbox.Group>
			</ScrollArea>
		</>
	)
}
//ethnicity component end

// birthyear component start
export const FormBirthyear = () => {
	const { t } = useTranslation('common')
	const { classes } = useStyles()
	const form = useUserSurveyFormContext()

	const maxYear = new Date().getFullYear()
	const minYear = maxYear - 100

	return (
		<>
			{TitleSubtitle('survey.question-5-title', 'survey.question-subtitle')}
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
		</>
	)
}
// birthyear component end
