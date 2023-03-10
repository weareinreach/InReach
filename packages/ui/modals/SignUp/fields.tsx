import {
	Box,
	PasswordInput,
	Popover,
	Progress,
	TextInput,
	useMantineTheme,
	Text,
	Select,
	Stack,
	Autocomplete,
	createStyles,
	rem,
} from '@mantine/core'
import { useDebouncedValue } from '@mantine/hooks'
import { languageList } from '@weareinreach/api/generated/languages'
import { useTranslation } from 'next-i18next'
import { ComponentPropsWithRef, forwardRef, useState } from 'react'

import { useCustomVariant } from '~ui/hooks'
import { Icon } from '~ui/icon'
import { trpc as api } from '~ui/lib/trpcClient'

import { useSignUpFormContext } from './context'

export const FormName = () => {
	const { t } = useTranslation('common')
	const form = useSignUpFormContext()
	return (
		<TextInput
			required
			label={t('sign-up-name-alias')}
			description={t('sign-up-name-use-any')}
			placeholder={t('sign-up-enter-name-alias') as string}
			{...form.getInputProps('name')}
		/>
	)
}
export const FormEmail = ({ emailType }: { emailType?: 'professional' | 'student-pro' }) => {
	const { t } = useTranslation('common')
	const form = useSignUpFormContext()
	return (
		<TextInput
			required
			label={t('email', { context: emailType })}
			placeholder={t('enter-email-placeholder') as string}
			{...form.getInputProps('email')}
		/>
	)
}

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

export const FormPassword = () => {
	const { t } = useTranslation('common')
	const form = useSignUpFormContext()
	const variants = useCustomVariant()
	const theme = useMantineTheme()
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
	const variants = useCustomVariant()
	const groupedLangs = languageList.map(({ common, ...lang }) => ({
		...lang,
		group: t('lang', { context: common ? 'common' : 'all-other' }),
	}))

	const SelectItem = forwardRef<HTMLDivElement, ItemProps>(({ label, description, ...others }, ref) => (
		<Stack ref={ref} spacing={4} {...others}>
			<Text variant={variants.Text.utility1}>{label}</Text>
			<Text variant={variants.Text.utility4darkGray}>{description}</Text>
		</Stack>
	))
	SelectItem.displayName = 'Item selection'
	return (
		<Select
			label={t('lang', { context: 'choose' })}
			data={groupedLangs}
			searchable
			itemComponent={SelectItem}
			{...form.getInputProps('language')}
		/>
	)
}

const useLocationStyles = createStyles((theme) => ({
	autocompleteWrapper: {
		padding: 0,
		borderBottom: `${rem(1)} solid ${theme.other.colors.tertiary.coolGray}`,
	},
	itemComponent: {
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
}))

export const FormLocation = () => {
	const { t, i18n } = useTranslation('common')
	const form = useSignUpFormContext()
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
	const SelectItem = forwardRef<HTMLDivElement, LocationItem>(({ value, ...others }, ref) => (
		<div className={classes.itemComponent} ref={ref} {...others}>
			<Text variant={variants.Text.utility2}>{value}</Text>
		</div>
	))
	SelectItem.displayName = 'Location Item'
	console.log(form.values)
	return (
		<Autocomplete
			itemComponent={SelectItem}
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
type LocationItem = {
	value: string
}
