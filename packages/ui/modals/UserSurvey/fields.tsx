import {
	Box,
	PasswordInput,
	Popover,
	Progress,
	TextInput,
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

export const FormName = ({ tContext }: { tContext: 'alias' | 'full' }) => {
	const { t } = useTranslation('common')
	const form = useUserSurveyFormContext()
	return (
		<TextInput
			required
			label={t('sign-up-name', { context: tContext })}
			description={tContext === 'alias' ? t('sign-up-name-use-any') : undefined}
			placeholder={t('sign-up-placeholder-name', { context: tContext }) as string}
			{...form.getInputProps('name')}
		/>
	)
}
export const FormEmail = ({ tContext }: { tContext?: 'professional' | 'student-pro' }) => {
	const { t } = useTranslation('common')
	const form = useUserSurveyFormContext()
	return (
		<TextInput
			required
			label={t('email', { context: tContext })}
			placeholder={t('enter-email-placeholder') as string}
			{...form.getInputProps('email')}
		/>
	)
}

export const FormBirthyear = () => {
	const { t } = useTranslation('common')
	const form = useUserSurveyFormContext()
	const theme = useMantineTheme()
	type BirthyearRequirementProps = {
		meets: boolean
		label: string
	}
	const BirthyearRequirement = ({ meets, label }: BirthyearRequirementProps) => {
		const { t } = useTranslation('common')
		const theme = useMantineTheme()
		const variants = useCustomVariant()
		return (
			<Text
				variant={variants.Text.utility4}
				color={meets ? theme.other.colors.primary.lightGray : theme.other.colors.tertiary.red}
				sx={{ display: 'flex', alignItems: 'center' }}
				mt={8}
			>
				{meets ? (
					<Icon icon='carbon:checkmark-filled' height={20} color={theme.other.colors.primary.allyGreen} />
				) : (
					<Icon icon='carbon:warning-filled' height={20} color={theme.other.colors.tertiary.red} />
				)}
				<Box ml={10}>{t(label, { ns: 'common' })}</Box>
			</Text>
		)
	}
	const BirthyearRequirements = [{ re: /[0-9]/, label: 'survey.birthyear-req-length' }]
	const BirthyearStrength = (birthYear: number) => {
		let multiplier = birthYear?.toString().length == 4 ? 0 : 1

		BirthyearRequirements.forEach((requirement) => {
			if (!requirement.re.test(birthYear?.toString())) {
				multiplier += 1
			}
		})

		return Math.max(100 - (100 / (BirthyearRequirements.length + 1)) * multiplier, 10)
	}
	const birthYearChecks = BirthyearRequirements.map((requirement, index) => (
		<BirthyearRequirement
			key={index}
			label={requirement.label}
			meets={requirement.re.test(form.values.birthYear?.toString())}
		/>
	))
	const birthYearStrength = BirthyearStrength(form.values.birthYear)
	const birthYearMeterColor =
		birthYearStrength === 100
			? theme.other.colors.primary.allyGreen
			: birthYearStrength > 50
			? theme.other.colors.tertiary.yellow
			: theme.other.colors.tertiary.red
	const [birthYearPopover, setbirthYearPopover] = useState(false)

	return (
		<Popover
			opened={birthYearPopover}
			position='bottom'
			width='target'
			transitionProps={{ transition: 'pop' }}
		>
			<Popover.Target>
				<NumberInput
					hideControls
					label={t('survey.question-5-label')}
					placeholder={t('survey.question-5-placeholder') as string}
					{...form.getInputProps('birthYear')}
					onFocusCapture={() => setbirthYearPopover(true)}
					onBlurCapture={() => setbirthYearPopover(false)}
				/>
			</Popover.Target>
			<Popover.Dropdown>
				<Progress color={birthYearMeterColor} value={birthYearStrength} size={5} mb='xs' />
				<BirthyearRequirement
					label={t('survey.birthyear-req-value', {
						year1: new Date().getFullYear() - 100,
						year2: new Date().getFullYear(),
					})}
					meets={
						form.values.birthYear >= new Date().getFullYear() - 100 &&
						form.values.birthYear <= new Date().getFullYear()
					}
				/>
				{birthYearChecks}
			</Popover.Dropdown>
		</Popover>
	)
}

interface ItemProps extends ComponentPropsWithRef<'div'> {
	label: string
	description: string
}

export const LanguageSelect = () => {
	const { t } = useTranslation('common')
	const form = useUserSurveyFormContext()
	// BUG: [IN-792] Search should also search by Native Name
	const groupedLangs = languageList.map(({ common, ...lang }) => ({
		...lang,
		group: t('lang', { context: common ? 'common' : 'all-other' }),
	}))

	return (
		<Select
			label={t('lang', { context: 'choose' })}
			data={groupedLangs}
			searchable
			itemComponent={SelectItemTwoLines}
			{...form.getInputProps('language')}
		/>
	)
}

export const FormLocation = () => {
	const { t, i18n } = useTranslation('common')
	const form = useUserSurveyFormContext()
	const variants = useCustomVariant()
	const { classes } = useLocationStyles()
	const [locationSearch, setLocationSearch] = useState('')
	const [search] = useDebouncedValue(form.values.searchLocation, 400)
	const simpleLocale = (locale: string) => (locale.length === 2 ? locale : locale.substring(0, 1))
	api.geo.autocomplete.useQuery(
		{ search, locale: simpleLocale(i18n.language), cityOnly: true },
		{
			enabled: search !== '',
			onSuccess: ({ results }) =>
				form.setValues({
					locationOptions: results.map((result) => ({
						value: `${result.value}, ${result.subheading}`,
						label: `${result.value}, ${result.subheading}`,
						placeId: result.placeId,
					})),
				}),
			refetchOnWindowFocus: false,
		}
	)
	api.geo.geoByPlaceId.useQuery(locationSearch, {
		enabled: locationSearch !== '',
		onSuccess: ({ result }) => {
			if (result)
				form.setValues({ location: { city: result.city, govDist: result.govDist, country: result.country } })
		},
	})
	console.log(form.values)
	return (
		<Autocomplete
			itemComponent={SelectItemSingleLine}
			classNames={{ itemsWrapper: classes.autocompleteWrapper }}
			data={form.values.locationOptions}
			label={t('current-location')}
			onItemSubmit={(e) => {
				console.log(e)
				setLocationSearch(e.placeId)
			}}
			{...form.getInputProps('searchLocation')}
		/>
	)
}
type SingleItemSelectProps = {
	value: string
	label: string
	placeId?: string
}

export const FormLawPractice = () => {
	const { t } = useTranslation(['common', 'attribute'])
	const form = useUserSurveyFormContext()

	const options = attributesByCategory.find((item) => item.tag === 'law-practice-options')
	const selectItems =
		options?.attributes.map((item) => ({
			label: t(item.attribute.tsKey, { ns: item.attribute.tsNs }),
			value: item.attribute.id,
		})) ?? []

	return (
		<Select
			label={t('sign-up-select-law-practice')}
			data={selectItems}
			itemComponent={SelectItemSingleLine}
			{...form.getInputProps('lawPractice')}
		/>
	)
}

export const FormServiceProvider = () => {
	const { t } = useTranslation(['common', 'attribute'])
	const form = useUserSurveyFormContext()

	const options = attributesByCategory.find((item) => item.tag === 'service-provider-options')
	const selectItems =
		options?.attributes.map((item) => ({
			label: t(item.attribute.tsKey, { ns: item.attribute.tsNs }),
			value: item.attribute.id,
		})) ?? []

	return (
		<Select
			label={t('sign-up-select-service-provider')}
			data={selectItems}
			itemComponent={SelectItemSingleLine}
			{...form.getInputProps('servProvider')}
		/>
	)
}
