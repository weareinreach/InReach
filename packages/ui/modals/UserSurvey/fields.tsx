import {
	Checkbox,
	NumberInput,
	Radio,
	ScrollArea,
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
	checkIcon: { paddingLeft: rem(4), color: theme.other.colors.secondary.black },
	selected: {},
	singleLine: {
		borderBottom: `${rem(1)} solid ${theme.other.colors.tertiary.coolGray}`,
		padding: `${theme.spacing.sm} ${theme.spacing.xl}`,
		alignItems: 'center',
		display: 'flex',

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

interface ItemProps extends React.ComponentPropsWithoutRef<'div'> {
	cca2: string
	id: string
	tsKey: string
	tsNs: string
	label: string
	selected?: boolean
}

const SelectItem = forwardRef<HTMLDivElement, ItemProps>(
	({ cca2, id, tsKey, tsNs, label, selected, ...others }, ref) => {
		const variants = useCustomVariant()
		const { classes, cx } = useSelectItemStyles()

		return (
			<div
				className={selected ? cx(classes.singleLine, classes.selected) : classes.singleLine}
				ref={ref}
				{...others}
			>
				<Text variant={variants.Text.utility2} size='sm'>
					{label}
				</Text>
				{selected && <Icon icon='carbon:checkmark-filled' height={rem(20)} className={classes.checkIcon} />}
			</div>
		)
	}
)
SelectItem.displayName = 'Selection Item'

export const FormCountry = () => {
	const [selectOptions, setSelectOptions] = useState<{ label: string; value: string }[]>([])
	api.user.surveyOptions.useQuery(undefined, {
		onSuccess: (data) =>
			setSelectOptions(
				data.countries.map(({ id, tsKey, tsNs }) => ({
					value: id,
					label: t(tsKey, { ns: tsNs }) satisfies string,
				}))
			),
	})
	const { t } = useTranslation(['common', 'country'])
	const { classes } = useStyles()
	const form = useUserSurveyFormContext()

	const handleCountrySelect = (event: string) => {
		form.setFieldValue('countryOriginId', event)
	}

	return (
		<>
			{TitleSubtitle('survey.question-2-title', 'survey.question-subtitle')}
			<ScrollArea h={336} offsetScrollbars className={classes.scroll}>
				<Select
					placeholder={t('survey.question-2-placeholder') as string}
					itemComponent={SelectItem}
					icon={<Icon icon='carbon:search' />}
					data={selectOptions}
					searchable
					maxDropdownHeight={325}
					dropdownComponent='div'
					// styles={{ rightSection: { display: 'none' } }}
					styles={{
						root: { borderLeft: 'none', borderRight: 'none' },
						dropdown: { borderLeft: 'none', borderRight: 'none', borderRadius: 0 },
						item: { borderBottom: '1px solid #EAEAEA' },
						// selected: { backgroundColor: '#EAEAEA' },
						rightSection: { display: 'none' },
					}}
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

	return (
		<>
			{TitleSubtitle('survey.question-5-title', 'survey.question-subtitle')}
			<NumberInput
				className={classes.answerContainer}
				label={t('survey.question-5-label')}
				hideControls
				placeholder={t('survey.question-5-placeholder') as string}
				{...form.getInputProps('birthYear')}
			/>
		</>
	)
}
// birthyear component end
