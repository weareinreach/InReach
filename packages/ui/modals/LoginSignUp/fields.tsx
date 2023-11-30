import {
	Autocomplete,
	Box,
	createStyles,
	PasswordInput,
	Popover,
	Progress,
	rem,
	Select,
	Stack,
	Text,
	TextInput,
	useMantineTheme,
} from '@mantine/core'
import { useDebouncedValue } from '@mantine/hooks'
import compact from 'just-compact'
import { useTranslation } from 'next-i18next'
import { type ComponentPropsWithRef, forwardRef, useEffect, useRef, useState } from 'react'

import { allAttributes } from '@weareinreach/db/generated/allAttributes'
import { attributesByCategory } from '@weareinreach/db/generated/attributesByCategory'
import { languageList } from '@weareinreach/db/generated/languages'
import { useCustomVariant } from '~ui/hooks'
import { Icon } from '~ui/icon'
import { trpc as api } from '~ui/lib/trpcClient'

import { useSignUpFormContext } from './context'

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
SelectItemSingleLine.displayName = 'SelectItemSingleLine'

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
SelectItemTwoLines.displayName = 'SelectItemTwoLines'

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

interface ItemProps extends ComponentPropsWithRef<'div'> {
	label: string
	description: string
}

export const LanguageSelect = () => {
	const { t } = useTranslation('common')
	const form = useSignUpFormContext()
	// BUG: [IN-792] Search should also search by Native Name
	const groupedLangs = languageList.map(({ common, ...lang }) => ({
		...lang,
		group: t('language', { context: common ? 'common' : 'all-other' }),
	}))

	return (
		<Select
			label={t('language', { context: 'choose' })}
			data={groupedLangs}
			searchable
			required
			itemComponent={SelectItemTwoLines}
			{...form.getInputProps('language')}
		/>
	)
}

export const FormLocation = () => {
	const { t, i18n } = useTranslation('common')
	const form = useSignUpFormContext()
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
			if (result && result.city && result.govDist && result.country)
				form.setValues({ location: { city: result.city, govDist: result.govDist, country: result.country } })
		},
	})
	return (
		<Autocomplete
			itemComponent={SelectItemSingleLine}
			classNames={{ itemsWrapper: classes.autocompleteWrapper }}
			data={form.values.locationOptions}
			label={t('current-location')}
			required
			onItemSubmit={(e) => {
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

export const FormLawPractice = forwardRef<HTMLInputElement>((_, ref) => {
	const { t } = useTranslation(['common', 'attribute'])
	const form = useSignUpFormContext()
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

	if (form.values.otherLawPractice && !selectedOther) form.setFieldValue('otherLawPractice', undefined)

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
				itemComponent={SelectItemSingleLine}
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
					itemComponent={SelectItemSingleLine}
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
