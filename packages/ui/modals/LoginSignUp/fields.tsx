import {
	Box,
	Combobox,
	type ComboboxItem,
	type ComboboxItemGroup,
	PasswordInput,
	Popover,
	Progress,
	Select,
	Stack,
	Text,
	TextInput,
	useCombobox,
	useMantineTheme,
} from '@mantine/core'
import { useDebouncedValue } from '@mantine/hooks'
import compact from 'just-compact'
import { useTranslation } from 'next-i18next/pages'
import { forwardRef, useEffect, useRef, useState } from 'react'

import { allAttributes } from '@weareinreach/db/generated/allAttributes'
import { attributesByCategory } from '@weareinreach/db/generated/attributesByCategory'
import { languageList } from '@weareinreach/db/generated/languages'
import { useCustomVariant } from '~ui/hooks'
import { Icon } from '~ui/icon'
import { trpc as api } from '~ui/lib/trpcClient'

import { useSignUpFormContext } from './context'
import classes from './fields.module.css'

const renderSingleLineOption = (variants: ReturnType<typeof useCustomVariant>, label: string) => (
	<div className={classes.singleLine}>
		<Text variant={variants.Text.utility2}>{label}</Text>
	</div>
)

const renderTwoLineOption = (
	variants: ReturnType<typeof useCustomVariant>,
	label: string,
	description?: string
) => (
	<Stack gap={4} className={classes.twoLines}>
		<Text variant={variants.Text.utility1}>{label}</Text>
		{description && <Text variant={variants.Text.utility4darkGray}>{description}</Text>}
	</Stack>
)

interface FormNameProps {
	tContext: 'alias' | 'full'
}
export const FormName = forwardRef<HTMLInputElement, FormNameProps>(({ tContext }, ref) => {
	const { t } = useTranslation('common')
	const form = useSignUpFormContext()
	return (
		<TextInput
			ref={ref}
			required
			label={t('sign-up.name', { context: tContext })}
			description={tContext === 'alias' ? t('sign-up.name-use-any') : undefined}
			placeholder={t('sign-up.placeholder-name', { context: tContext }) as string}
			{...form.getInputProps('name')}
		/>
	)
})
FormName.displayName = 'FormName'
export const FormEmail = ({ tContext }: { tContext?: 'professional' | 'student-pro' }) => {
	const { t } = useTranslation('common')
	const form = useSignUpFormContext()
	return (
		<TextInput
			required
			label={t('words.email', { context: tContext })}
			placeholder={t('enter-email-placeholder') as string}
			{...form.getInputProps('email')}
		/>
	)
}

export const FormPassword = () => {
	const { t } = useTranslation('common')
	const form = useSignUpFormContext()
	const theme = useMantineTheme()
	type PasswordRequirementProps = {
		meets: boolean
		label: string
	}
	const PasswordRequirement = ({ meets, label }: PasswordRequirementProps) => {
		const { t } = useTranslation('common')
		const theme = useMantineTheme()
		const variants = useCustomVariant()
		return (
			<Text
				variant={variants.Text.utility4}
				color={meets ? theme.other.colors.primary.lightGray : theme.other.colors.tertiary.red}
				className={classes.passwordText}
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
	const passwordRequirements = [
		{ re: /[0-9]/, label: 'password-req-number' },
		{ re: /[a-z]/, label: 'password-req-lowercase' },
		{ re: /[A-Z]/, label: 'password-req-uppercase' },
		{ re: /[$&+,:;=?@#|'<>.^*()%!-]/, label: 'password-req-special' },
	]
	const passwordStrength = (password: string) => {
		let multiplier = password.length > 5 ? 0 : 1

		passwordRequirements.forEach((requirement) => {
			if (!requirement.re.test(password)) {
				multiplier += 1
			}
		})

		return Math.max(100 - (100 / (passwordRequirements.length + 1)) * multiplier, 10)
	}
	const pwChecks = passwordRequirements.map((requirement, index) => (
		<PasswordRequirement
			key={index}
			label={requirement.label}
			meets={requirement.re.test(form.values.password)}
		/>
	))
	const pwStrength = passwordStrength(form.values.password)
	const pwMeterColor =
		pwStrength === 100
			? theme.other.colors.primary.allyGreen
			: pwStrength > 50
				? theme.other.colors.tertiary.yellow
				: theme.other.colors.tertiary.red
	const [pwPopover, setPwPopover] = useState(false)

	return (
		<Popover opened={pwPopover} position='bottom' width='target' transitionProps={{ transition: 'pop' }}>
			<Popover.Target>
				<PasswordInput
					required
					label={t('password')}
					placeholder={t('enter-password-placeholder') as string}
					{...form.getInputProps('password')}
					onFocusCapture={() => setPwPopover(true)}
					onBlurCapture={() => setPwPopover(false)}
				/>
			</Popover.Target>
			<Popover.Dropdown>
				<Progress color={pwMeterColor} value={pwStrength} size={5} mb='xs' />
				<PasswordRequirement label='password-req-length' meets={form.values.password.length >= 8} />
				{pwChecks}
			</Popover.Dropdown>
		</Popover>
	)
}

export const LanguageSelect = () => {
	const { t } = useTranslation('common')
	const form = useSignUpFormContext()
	const variants = useCustomVariant()
	// BUG: [IN-792] Search should also search by Native Name
	const groupedLangs = languageList.map(({ common, ...lang }) => ({
		...lang,
		group: t('language', { context: common ? 'common' : 'all-other' }),
	}))
	// `Select`'s `data` items in v7 can only be `{value, label}` - the flat per-item `group` field
	// above is no longer rendered as a group header, so it's regrouped into real `ComboboxItemGroup`s.
	const langSelectData = (() => {
		const groups = new Map<string, typeof groupedLangs>()
		for (const item of groupedLangs) {
			const list = groups.get(item.group) ?? []
			list.push(item)
			groups.set(item.group, list)
		}
		return [...groups.entries()].map(([group, items]) => ({
			group,
			items: items.map(({ value, label }) => ({ value, label })),
		})) satisfies ComboboxItemGroup<ComboboxItem>[]
	})()

	return (
		<Select
			label={t('language', { context: 'choose' })}
			data={langSelectData}
			renderOption={({ option }) => {
				const lang = groupedLangs.find(({ value }) => value === option.value)
				return renderTwoLineOption(variants, option.label, lang?.description)
			}}
			searchable
			required
			{...form.getInputProps('language')}
		/>
	)
}

export const FormLocation = () => {
	const { t, i18n } = useTranslation('common')
	const form = useSignUpFormContext()
	const variants = useCustomVariant()
	const locationCombobox = useCombobox({
		onDropdownClose: () => locationCombobox.resetSelectedOption(),
	})
	const [locationSearch, setLocationSearch] = useState('')
	const [search] = useDebouncedValue(form.values.searchLocation, 400)
	const simpleLocale = (locale: string) => (locale.length === 2 ? locale : locale.substring(0, 1))
	const { data: autocompleteData } = api.geo.autocomplete.useQuery(
		{ search, locale: simpleLocale(i18n.language), cityOnly: true },
		{
			enabled: search !== '',
			refetchOnWindowFocus: false,
		}
	)
	useEffect(() => {
		if (!autocompleteData) {
			return
		}
		form.setValues({
			locationOptions: autocompleteData.results.map((result) => ({
				value: `${result.value}, ${result.subheading}`,
				label: `${result.value}, ${result.subheading}`,
				placeId: result.placeId,
			})),
		})
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [autocompleteData])

	const { data: geoByPlaceIdData } = api.geo.geoByPlaceId.useQuery(locationSearch, {
		enabled: locationSearch !== '',
	})
	useEffect(() => {
		const result = geoByPlaceIdData?.result
		if (result && result.city && result.govDist && result.country) {
			form.setValues({ location: { city: result.city, govDist: result.govDist, country: result.country } })
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [geoByPlaceIdData])
	const {
		value: searchLocationValue,
		onChange: searchLocationOnChange,
		...searchLocationProps
	} = form.getInputProps('searchLocation')

	return (
		<Combobox
			store={locationCombobox}
			onOptionSubmit={(value) => {
				const item = form.values.locationOptions.find((option) => option.value === value)
				if (item) {
					form.setFieldValue('searchLocation', item.value)
					setLocationSearch(item.placeId)
				}
				locationCombobox.closeDropdown()
			}}
		>
			<Combobox.Target>
				<TextInput
					label={t('current-location')}
					required
					value={searchLocationValue}
					{...searchLocationProps}
					onChange={(event) => {
						searchLocationOnChange(event)
						locationCombobox.openDropdown()
					}}
					onFocus={() => locationCombobox.openDropdown()}
					onBlur={() => locationCombobox.closeDropdown()}
				/>
			</Combobox.Target>
			<Combobox.Dropdown>
				<Combobox.Options className={classes.autocompleteWrapper}>
					{form.values.locationOptions.map((option) => (
						<Combobox.Option value={option.value} key={option.value}>
							{renderSingleLineOption(variants, option.value)}
						</Combobox.Option>
					))}
				</Combobox.Options>
			</Combobox.Dropdown>
		</Combobox>
	)
}
export const FormLawPractice = forwardRef<HTMLInputElement>((_, ref) => {
	const { t } = useTranslation(['common', 'attribute'])
	const form = useSignUpFormContext()
	const variants = useCustomVariant()
	let otherOption: string | undefined
	const otherRef = useRef<HTMLInputElement>(null)
	const options = attributesByCategory.find((item) => item.tag === 'law-practice-options')
	const otherOpt: { label: string; value: string }[] = []
	const selectItems = [
		...compact(
			options?.attributes.map((item) => {
				if (item.attribute.tag === 'law-other') {
					otherOption = item.attribute.id
					otherOpt.push({
						label: t(item.attribute.tsKey, { ns: item.attribute.tsNs }),
						value: item.attribute.id,
					})
					return
				}

				return {
					label: t(item.attribute.tsKey, { ns: item.attribute.tsNs }),
					value: item.attribute.id,
				}
			}) ?? []
		),
		...otherOpt,
	]

	const selectedOther = form.values.lawPractice === otherOption

	if (form.values.otherLawPractice && !selectedOther) {
		form.setFieldValue('otherLawPractice', undefined)
	}

	useEffect(() => {
		if (selectedOther) {
			otherRef.current?.scrollIntoView({ behavior: 'smooth' })
		}
	}, [selectedOther])

	return (
		<>
			<Select
				ref={ref}
				label={t('sign-up.select-law-practice')}
				data={selectItems}
				renderOption={({ option }) => renderSingleLineOption(variants, option.label)}
				required
				{...form.getInputProps('lawPractice')}
			/>
			{selectedOther && (
				<TextInput
					ref={otherRef}
					label={t('law-practice-other')}
					placeholder={t('law-practice-other-placeholder') as string}
					required
					{...form.getInputProps('otherLawPractice')}
				/>
			)}
		</>
	)
})
FormLawPractice.displayName = 'FormLawPractice'

export const FormServiceProvider = () => {
	const { t } = useTranslation(['common', 'attribute'])
	const form = useSignUpFormContext()
	const variants = useCustomVariant()
	const otherRef = useRef<HTMLInputElement>(null)
	const legalRef = useRef<HTMLInputElement>(null)
	const options = attributesByCategory.find((item) => item.tag === 'service-provider-options')
	const otherOpt: { label: string; value: string }[] = []
	const selectItems = [
		...compact(
			options?.attributes.map((item) => {
				if (item.attribute.tag === 'userserviceprovider.other') {
					otherOpt.push({
						label: t(item.attribute.tsKey, { ns: item.attribute.tsNs }),
						value: item.attribute.id,
					})
					return
				}
				return {
					label: t(item.attribute.tsKey, { ns: item.attribute.tsNs }),
					value: item.attribute.id,
				}
			}) ?? []
		),
		...otherOpt,
	]
	const optOtherId = allAttributes.find(({ tag }) => tag === 'userserviceprovider.other')?.id
	const legalIds = allAttributes
		.filter(({ tag }) => ['userserviceprovider.lawyer', 'userserviceprovider.paralegal'].includes(tag))
		?.map(({ id }) => id) as string[]

	const isOther = form.values.servProvider === optOtherId
	const isLegal = form.values.servProvider && legalIds.includes(form.values.servProvider)

	useEffect(() => {
		if (isOther) {
			otherRef.current?.scrollIntoView({ behavior: 'smooth' })
		}
		if (isLegal) {
			legalRef.current?.scrollIntoView({ behavior: 'smooth' })
		}
	}, [isOther, isLegal])

	return (
		<>
			<Stack>
				<Select
					label={t('sign-up.select-service-provider')}
					data={selectItems}
					renderOption={({ option }) => renderSingleLineOption(variants, option.label)}
					required
					{...form.getInputProps('servProvider')}
				/>
				{isOther && (
					<TextInput
						ref={otherRef}
						label={t('sign-up.specify-work-volunteer')}
						required
						{...form.getInputProps('servProviderOther')}
					/>
				)}
			</Stack>
			{isLegal && <FormLawPractice ref={legalRef} />}
		</>
	)
}
