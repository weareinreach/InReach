import {
	Checkbox,
	NumberInput,
	Radio,
	ScrollArea,
	useMantineTheme,
	Title,
	Text,
	Select,
	createStyles,
	rem,
} from '@mantine/core'
import { useTranslation } from 'next-i18next'
import { forwardRef, useState } from 'react'

import { useCustomVariant } from '~ui/hooks'
import { Icon } from '~ui/icon'
import { trpc as api } from '~ui/lib/trpcClient'

import { useUserSurveyFormContext } from './context'

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

	const [selectedId, setSelectedId] = useState('')

	const handleRadioChange = (event: string) => {
		form.setFieldValue('immigrationId', event)
		setSelectedId(event)
	}

	return (
		<>
			{TitleSubtitle('survey.question-1-title', 'survey.question-subtitle')}
			<ScrollArea h={336} offsetScrollbars className={classes.scroll}>
				<Radio.Group value={selectedId} onChange={handleRadioChange} className={classes.answerContainer}>
					{surveyOptions?.immigration.map((item, index) => {
						return (
							<Radio
								label={t(item.tsKey, { ns: 'user' })}
								key={item.id}
								value={item.id}
								checked={selectedId === item.id}
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
interface ItemProps extends React.ComponentPropsWithoutRef<'div'> {
	cca2: string
	id: string
	tsKey: string
	tsNs: string
	label: string
}

const SelectItem = forwardRef<HTMLDivElement, ItemProps>(
	({ cca2, id, tsKey, tsNs, label, ...others }: ItemProps, ref) => {
		const { t } = useTranslation('country')
		const variants = useCustomVariant()
		const { classes } = useSelectItemStyles()

		return (
			<div className={classes.singleLine} ref={ref} {...others}>
				<Text variant={variants.Text.utility2} size='sm'>
					{t(label, { ns: 'country' })}
				</Text>
			</div>
		)
	}
)
SelectItem.displayName = 'Selection Item'

export const FormCountry = () => {
	const { data: surveyOptions, status } = api.user.surveyOptions.useQuery()
	const { t } = useTranslation('common')
	const { classes } = useStyles()
	const form = useUserSurveyFormContext()

	const countryData = surveyOptions?.countries.map(function (ele) {
		return { ...ele, value: t(ele.tsKey, { ns: 'country' }), label: t(ele.tsKey, { ns: 'country' }) }
	}) as { value: string; label: string; tsKey: string; id: string; tsNs: string; cca2: string }[]

	const handleCountrySelect = (event: string) => {
		let countryObj = countryData?.find((item) => item.label === event)
		form.setFieldValue('countryOriginId', countryObj?.id)
	}

	return (
		<>
			{TitleSubtitle('survey.question-2-title', 'survey.question-subtitle')}
			<ScrollArea h={336} offsetScrollbars className={classes.scroll}>
				<Select
					placeholder={t('survey.question-2-placeholder') as string}
					itemComponent={SelectItem}
					icon={<Icon icon='carbon:search' />}
					data={countryData}
					searchable
					maxDropdownHeight={325}
					dropdownComponent='div'
					styles={{ rightSection: { display: 'none' } }}
					filter={(value, item) =>
						item &&
						item.label &&
						(item.label.toLowerCase().includes((value || '').toLowerCase().trim()) ||
							item.tsKey.toLowerCase().includes((value || '').toLowerCase().trim()))
					}
					onChange={handleCountrySelect}
				/>
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

	const handleCheckboxChange = (event: []) => {
		form.setFieldValue('identifyIds', event)
	}

	return (
		<>
			{TitleSubtitle('survey.question-3-title', 'survey.question-subtitle')}
			<ScrollArea h={336} offsetScrollbars className={classes.scroll}>
				<Checkbox.Group onChange={handleCheckboxChange} className={classes.answerContainer}>
					{surveyOptions?.sog.map((item, index) => {
						return (
							<Checkbox value={item.id} checked={false} label={t(item.tsKey, { ns: 'user' })} key={item.id} />
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

	const handleCheckboxChange = (event: []) => {
		form.setFieldValue('ethnicityIds', event)
	}

	return (
		<>
			{TitleSubtitle('survey.question-4-title', 'survey.question-subtitle')}
			<ScrollArea h={336} offsetScrollbars className={classes.scroll}>
				<Checkbox.Group onChange={handleCheckboxChange} className={classes.answerContainer}>
					{surveyOptions?.ethnicity.map((item, index) => {
						return (
							<Checkbox value={item.id} checked={false} label={t(item.tsKey, { ns: 'user' })} key={item.id} />
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
				error={t('survey.birthyear-req-value', { year1: minYear, year2: maxYear }) as string}
				{...form.getInputProps('birthYear')}
			/>
		</>
	)
}
// birthyear component end
