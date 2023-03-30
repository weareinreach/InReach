import {
	Title,
	Text,
	Radio,
	TextInput,
	Checkbox,
	Modal,
	Stack,
	Autocomplete,
	createStyles,
	rem,
	Divider,
	Button,
	type StackProps,
} from '@mantine/core'
import { useDebouncedValue, useDisclosure } from '@mantine/hooks'
import { useTranslation } from 'next-i18next'
import { ComponentPropsWithRef, forwardRef, useState } from 'react'

import { useCustomVariant } from '~ui/hooks'
import { Icon } from '~ui/icon'
import { trpc as api } from '~ui/lib/trpcClient'
import { ModalTitle } from '~ui/modals'

import { SuggestionFormProvider, useForm, useFormContext } from './context'

// import { Button } from '../core'

const useLocationStyles = createStyles((theme) => ({
	autocompleteWrapper: {
		padding: 0,
		borderBottom: `${rem(1)} solid ${theme.other.colors.tertiary.coolGray}`,
	},
	leftIcon: {
		color: theme.other.colors.secondary.black,
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

export const SuggestOrg = () => {
	const form = useForm({
		initialValues: {
			searchLocation: '',
			locationOptions: [],
			formOptions: { countries: [], serviceTypes: [], communities: [] },
		},
	})
	const { classes: locationClasses } = useLocationStyles()
	const { t, i18n } = useTranslation(['suggestOrg', 'country', 'services', 'attribute'])
	const simpleLocale = (locale: string) => (locale.length === 2 ? locale : locale.substring(0, 1))
	const variants = useCustomVariant()
	const [locationSearch, setLocationSearch] = useState('')
	const [loading, setLoading] = useState(true)
	const [locSearchInput] = useDebouncedValue(form.values.searchLocation, 400)
	const [servOpened, servHandler] = useDisclosure(false)
	const [commOpened, commHandler] = useDisclosure(false)

	const { data: formOptions } = api.organization.suggestionOptions.useQuery(undefined, {
		onSuccess: (data) => {
			form.setValues({ formOptions: data })
			setLoading(false)
		},
	})

	api.geo.autocomplete.useQuery(
		{ search: locSearchInput, locale: simpleLocale(i18n.language), fullAddress: true },
		{
			enabled: Boolean(locSearchInput) && locSearchInput !== '',
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
		enabled: Boolean(locationSearch) && locationSearch !== '',
		onSuccess: ({ result }) => {
			if (result)
				form.setValues({
					data: {
						orgAddress: {
							city: result.city,
						},
					},
				})
		},
	})

	if (loading) return null
	console.log(formOptions, form.values.formOptions)
	const countrySelections = Array.isArray(form.values.formOptions?.countries)
		? form.values.formOptions?.countries.map(({ id, tsKey, tsNs }, i) => (
				<Radio
					key={id}
					label={t(tsKey, { ns: tsNs })}
					{...form.getInputProps(`formOptions.countries.${i}`)}
				/>
		  ))
		: null

	const ModalHeader = <ModalTitle breadcrumb={{ option: 'close' }} />
	console.log(form.values)
	const ServiceTypeModal = () => {
		const formContext = useFormContext()
		const options = Array.isArray(form.values.formOptions?.serviceTypes)
			? form.values.formOptions?.serviceTypes.map((item, i) => {
					const inputProps = formContext.getInputProps(`formOptions.serviceTypes.${i}.checked`, {
						type: 'checkbox',
					})

					return (
						<Checkbox
							key={item.id}
							label={t(item.tsKey, { ns: item.tsNs })}
							{...formContext.getInputProps(`formOptions.serviceTypes.${i}.checked`, { type: 'checkbox' })}
						/>
					)
			  })
			: null

		return (
			<Stack spacing={24}>
				<Stack spacing={16}>
					<Title order={2}>{t('modal.service-types-title')}</Title>
					<Text variant={variants.Text.darkGray}>{t('modal.service-types-sub')}</Text>
				</Stack>
				<Stack spacing={0}>
					<Checkbox.Group>{options}</Checkbox.Group>
				</Stack>
				<Stack spacing={20}>
					<Divider mt={16} />
					<Button variant={variants.Button.primaryLg}>{t('form.btn-save-changes')}</Button>
				</Stack>
			</Stack>
		)
	}

	return (
		<SuggestionFormProvider form={form}>
			<Stack spacing={40}>
				<Stack spacing={24}>
					<Title order={1}>{t('body.suggest-org')}</Title>
					<Text>{t('body.intro-text')}</Text>
				</Stack>
				<Divider />
				<Stack spacing={40}>
					<Stack spacing={16}>
						<Title order={2}>{t('body.required-info')}</Title>
						<Text>{t('body.accept-country')}</Text>
					</Stack>
					<Radio.Group name='country' label={t('form.org-country')} withAsterisk>
						<Stack spacing={0}>{countrySelections}</Stack>
					</Radio.Group>
					<TextInput
						label={t('form.org-name')}
						placeholder={t('form.placeholder-name') as string}
						{...form.getInputProps('data.orgName')}
					/>
					<TextInput
						label={t('form.org-website')}
						placeholder={t('form.placeholder-website') as string}
						{...form.getInputProps('data.orgWebsite')}
					/>
				</Stack>
				<Divider />
				<Stack spacing={40}>
					<Title order={2}>{t('body.additional-info')}</Title>
					<Autocomplete
						itemComponent={SelectItemTwoLines}
						classNames={{ itemsWrapper: locationClasses.autocompleteWrapper }}
						data={form.values.locationOptions}
						label={t('form.org-address')}
						icon={<Icon icon='carbon:search' className={locationClasses.leftIcon} />}
						placeholder={t('form.placeholder-address') as string}
						onItemSubmit={(e) => {
							setLocationSearch(e.placeId)
						}}
						{...form.getInputProps('searchLocation')}
					/>
					<Stack spacing={0}>
						<Text variant={variants.Text.utility1}>{t('form.service-types')}</Text>
						<Button variant={variants.Button.secondarySm} onClick={() => servHandler.open()}>
							{t('form.btn-service')}
						</Button>
					</Stack>{' '}
					<Stack spacing={0}>
						<Text variant={variants.Text.utility1}>{t('form.community-focus')}</Text>
						<Button variant={variants.Button.secondarySm}>{t('form.btn-community')}</Button>
					</Stack>
				</Stack>
				<Modal
					opened={servOpened}
					onClose={() => servHandler.close()}
					title={ModalHeader}
					scrollAreaComponent={Modal.NativeScrollArea}
				>
					<ServiceTypeModal />
				</Modal>
			</Stack>
		</SuggestionFormProvider>
	)
}

interface ItemProps extends ComponentPropsWithRef<'div'> {
	label: string
	description: string
}
