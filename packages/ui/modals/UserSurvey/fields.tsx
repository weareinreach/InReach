import {
	Checkbox,
	type ComboboxItem,
	type ComboboxLikeRenderOptionInput,
	NumberInput,
	type OptionsFilter,
	Radio,
	rem,
	ScrollArea,
	Select,
	Text,
	TextInput,
	Title,
} from '@mantine/core'
import { useTranslation } from 'next-i18next/pages'
import { useCallback, useEffect, useRef, useState } from 'react'

import { useCustomVariant } from '~ui/hooks'
import { Icon } from '~ui/icon'
import { cx } from '~ui/lib/cx'
import { trpc as api } from '~ui/lib/trpcClient'

import { useUserSurveyFormContext } from './context'
import classes from './fields.module.css'

/** Filters the country `Select`'s options by the current search text - needs nothing from component state. */
const filterCountryOptions: OptionsFilter = ({ options, search }) => {
	const query = search.toLowerCase().trim()
	return options.filter((option) => 'label' in option && option.label.toLowerCase().includes(query))
}

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
	const { data: surveyOptions } = api.user.surveyOptions.useQuery()
	const { t } = useTranslation('common')
	const form = useUserSurveyFormContext()
	const otherRef = useRef<HTMLInputElement>(null)

	const [selectedId, setSelectedId] = useState('')

	const handleRadioChange = (event: string) => {
		form.setFieldValue('immigrationId', event)
		setSelectedId(event)
	}

	const options = surveyOptions?.immigration
	const moveToEnd = ['immigration-prefer-not-to-say', 'immigration-immigrant']
	moveToEnd.forEach((tag) => {
		if (!options?.length) {
			return
		}
		const item = options.find(({ tsKey }) => tsKey === tag)
		if (!item) {
			return
		}
		const idx = options.indexOf(item)
		if (item && idx !== -1) {
			options.splice(idx, 1)
			options.push(item)
		}
	})

	const items = options?.map((item) => {
		return (
			<Radio
				label={t(item.tsKey, { ns: 'user' })}
				key={item.id}
				value={item.id}
				checked={selectedId === item.id}
			/>
		)
	})

	useEffect(() => {
		if (selectedId === 'uimm_01GW2HHHS4G6TA7FVKXBC3NT8M') {
			otherRef.current?.scrollIntoView({ behavior: 'smooth' })
		}
	}, [selectedId])

	return (
		<>
			{TitleSubtitle('survey.question-1-title', 'survey.question-subtitle')}
			<ScrollArea h={336} offsetScrollbars className={classes.scroll}>
				<Radio.Group value={selectedId} onChange={handleRadioChange} className={classes.answerContainer}>
					{items}
					{selectedId === 'uimm_01GW2HHHS4G6TA7FVKXBC3NT8M' ? (
						<TextInput
							label={t('please-specify')}
							required
							ref={otherRef}
							{...form.getInputProps('immigrationOther', { withFocus: false })}
						/>
					) : null}
				</Radio.Group>
			</ScrollArea>
		</>
	)
}

export const FormCountry = () => {
	const [selectOptions, setSelectOptions] = useState<{ label: string; value: string }[]>([])
	const { data: surveyOptionsData } = api.user.surveyOptions.useQuery(undefined)
	const { t } = useTranslation(['common', 'country'])
	const form = useUserSurveyFormContext()
	const variants = useCustomVariant()

	useEffect(() => {
		if (!surveyOptionsData) {
			return
		}
		setSelectOptions(
			surveyOptionsData.countries.map(({ id, tsKey, tsNs }) => ({
				value: id,
				label: t(tsKey, { ns: tsNs }) satisfies string,
			}))
		)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [surveyOptionsData])

	const handleCountrySelect = (event: string | null) => {
		if (event) {
			form.setFieldValue('countryOriginId', event)
		}
	}

	const handleCountryRenderOption = useCallback(
		({ option, checked }: ComboboxLikeRenderOptionInput<ComboboxItem>) => (
			<div className={checked ? cx(classes.singleLine, classes.selected) : classes.singleLine}>
				<Text variant={variants.Text.utility2} size='sm'>
					{option.label}
				</Text>
				{checked && <Icon icon='carbon:checkmark-filled' height={rem(20)} className={classes.checkIcon} />}
			</div>
		),
		[variants]
	)

	return (
		<>
			{TitleSubtitle('survey.question-2-title', 'survey.question-subtitle')}
			<ScrollArea h={336} offsetScrollbars className={classes.scroll}>
				<Select
					placeholder={t('survey.question-2-placeholder') as string}
					renderOption={handleCountryRenderOption}
					leftSection={<Icon icon='carbon:search' />}
					data={selectOptions}
					searchable
					maxDropdownHeight={325}
					styles={{
						root: { borderLeft: 'none', borderRight: 'none' },
						dropdown: { borderLeft: 'none', borderRight: 'none', borderRadius: 0 },
						option: { borderBottom: '1px solid #EAEAEA' },
						section: { display: 'none' },
					}}
					filter={filterCountryOptions}
					onChange={handleCountrySelect}
				/>
			</ScrollArea>
		</>
	)
}
//countries component end

//identity component start
export const FormIdentity = () => {
	const { data: surveyOptions } = api.user.surveyOptions.useQuery()
	const { t } = useTranslation('common')
	const form = useUserSurveyFormContext()

	const handleCheckboxChange = (event: string[]) => {
		form.setFieldValue('identifyIds', event)
	}

	return (
		<>
			{TitleSubtitle('survey.question-3-title', 'survey.question-subtitle')}
			<ScrollArea h={336} offsetScrollbars className={classes.scroll}>
				<Checkbox.Group onChange={handleCheckboxChange} className={classes.answerContainer}>
					{surveyOptions?.sog.map((item) => {
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
	const { data: surveyOptions } = api.user.surveyOptions.useQuery()
	const { t } = useTranslation('common')
	const form = useUserSurveyFormContext()
	const otherRef = useRef<HTMLInputElement>(null)

	const handleCheckboxChange = (event: string[]) => {
		form.setFieldValue('ethnicityIds', event)
	}

	const options = surveyOptions?.ethnicity
	const moveToEnd = ['eth-prefer-not-to-say', 'eth-other']
	moveToEnd.forEach((tag) => {
		if (!options?.length) {
			return
		}
		const item = options.find(({ tsKey }) => tsKey === tag)
		if (!item) {
			return
		}
		const idx = options.indexOf(item)
		if (item && idx !== -1) {
			options.splice(idx, 1)
			options.push(item)
		}
	})
	const items = options?.map((item) => {
		return <Checkbox value={item.id} checked={false} label={t(item.tsKey, { ns: 'user' })} key={item.id} />
	})
	useEffect(() => {
		if (form.values.ethnicityIds?.includes('ueth_0000000000E5KVESBAY6NPGJW3')) {
			otherRef.current?.scrollIntoView({ behavior: 'smooth' })
		}
	}, [form.values.ethnicityIds])

	return (
		<>
			{TitleSubtitle('survey.question-4-title', 'survey.question-subtitle')}
			<ScrollArea h={336} offsetScrollbars className={classes.scroll}>
				<Checkbox.Group onChange={handleCheckboxChange} className={classes.answerContainer}>
					{items}
					{form.values.ethnicityIds?.includes('ueth_0000000000E5KVESBAY6NPGJW3') ? (
						<TextInput
							label={t('please-specify')}
							required
							ref={otherRef}
							{...form.getInputProps('ethnicityOther', { withFocus: false })}
						/>
					) : null}
				</Checkbox.Group>
			</ScrollArea>
		</>
	)
}
//ethnicity component end

// birthyear component start
export const FormBirthyear = () => {
	const { t } = useTranslation('common')
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
